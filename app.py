
from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from typing import Optional, Dict, Any
import os

# Import ML models and utilities
from xgboost import XGBRegressor
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

# Initialize FastAPI
app = FastAPI(title="NFL Rushing Yards Predictor",
              description="Predict NFL rushing yards based on player tracking data")

# Get the absolute path to the app directory
BASE_DIR = Path(__file__).parent

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# Initialize templates
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Constants
MODEL_PATH = "models"
DATA_PATH = "csv/train.csv"

# Create models directory if it doesn't exist
os.makedirs(MODEL_PATH, exist_ok=True)

# Define request/response models
class PlayFeatures(BaseModel):
    X_std: float
    Y_std: float
    S: float  # Speed
    A: float  # Acceleration
    Dis: float  # Distance
    Dir_std: float  # Direction
    X_std_end: float
    Y_std_end: float
    PlayerHeight: float  # in inches
    PlayerWeight: float  # in lbs
    PlayerAge: float
    Down: int
    Distance: int  # Yards to go
    DefendersInTheBox: int

class PredictionResponse(BaseModel):
    predicted_yards: float
    confidence: float
    model_used: str

# Initialize models
models = {
    'xgb': None,
    'stacking': None
}

def load_data():
    """Load and preprocess the data."""
    print("Loading data...")
    try:
        df = pd.read_csv(DATA_PATH)
        print(f"Data loaded with shape: {df.shape}")
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        raise

def preprocess_data(df):
    """Preprocess the data for modeling."""
    print("Preprocessing data...")
    
    # Make a copy to avoid SettingWithCopyWarning
    df = df.copy()
    
    # Handle missing values
    df['FieldPosition'] = df['FieldPosition'].fillna('None')
    
    # Standardize team abbreviations
    team_abbr_corrections = {'BLT': 'BAL', 'CLV': 'CLE', 'ARZ': 'ARI', 'HST': 'HOU'}
    df['PossessionTeam'] = df['PossessionTeam'].replace(team_abbr_corrections)
    
    # Handle missing formations
    df['OffenseFormation'] = df['OffenseFormation'].replace('', 'Unknown')
    
    # Convert height to inches
    df[['Height_ft', 'Height_in']] = df['PlayerHeight'].str.split('-', expand=True).astype(float)
    df['PlayerHeight'] = df['Height_ft'] * 12 + df['Height_in']
    
    # Compute player age
    df['PlayerBirthDate'] = pd.to_datetime(df['PlayerBirthDate'], errors='coerce')
    df['GameDate'] = pd.to_datetime(df['GameId'].astype(str).str[:8], format='%Y%m%d')
    df['PlayerAge'] = (df['GameDate'] - df['PlayerBirthDate']).dt.days / 365.25
    
    # Create isRunner flag
    df['isRunner'] = df['NflId'] == df['NflIdRusher']
    
    # Standardize coordinates based on play direction
    df['ToLeft'] = df['PlayDirection'] == 'left'
    df['X_std'] = np.where(df['ToLeft'], 120 - df['X'], df['X']) - 10
    df['Y_std'] = np.where(df['ToLeft'], (160/3) - df['Y'], df['Y'])
    
    # Standardize direction
    def standardize_direction(row):
        Dir = row['Dir']
        ToLeft = row['ToLeft']
        if ToLeft and Dir < 90:
            Dir += 360
        if not ToLeft and Dir > 270:
            Dir -= 360
        if ToLeft:
            Dir -= 180
        return Dir
    
    df['Dir_std'] = df.apply(standardize_direction, axis=1)
    df['X_std_end'] = df['S'] * np.cos(np.deg2rad(90 - df['Dir_std'])) + df['X_std']
    df['Y_std_end'] = df['S'] * np.sin(np.deg2rad(90 - df['Dir_std'])) + df['Y_std']
    
    return df

def prepare_model_data(df):
    """Prepare data for model training."""
    print("Preparing model data...")
    
    # Use only ball carrier data for modeling
    rusher_df = df[df['isRunner']].copy()
    
    # Select features
    feature_cols = [
        'X_std', 'Y_std', 'S', 'A', 'Dis', 'Dir_std',
        'X_std_end', 'Y_std_end', 'PlayerHeight', 'PlayerWeight', 'PlayerAge',
        'Down', 'Distance', 'DefendersInTheBox'
    ]
    
    # Drop any rows with missing selected features
    rusher_df = rusher_df.dropna(subset=feature_cols + ['Yards'])
    
    X = rusher_df[feature_cols]
    y = rusher_df['Yards']
    
    return X, y, feature_cols

def train_models(X_train, y_train):
    """Train the machine learning models."""
    print("Training models...")
    
    # Train XGBoost model
    xgb_model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(xgb_model, f"{MODEL_PATH}/xgb_model.joblib")
    
    # Train Stacking model
    base_learners = [
        ('ridge', Ridge(alpha=1.0)),
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
    ]
    
    stacking_model = StackingRegressor(
        estimators=base_learners,
        final_estimator=XGBRegressor(n_estimators=50, learning_rate=0.05, random_state=42, n_jobs=-1),
        n_jobs=-1
    )
    
    stacking_model.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(stacking_model, f"{MODEL_PATH}/stacking_model.joblib")
    
    return xgb_model, stacking_model

def evaluate_models(models, X_test, y_test):
    """Evaluate the trained models."""
    print("Evaluating models...")
    metrics = {}
    
    for name, model in models.items():
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        metrics[name] = {
            'MAE': mae,
            'RMSE': rmse,
            'R2': r2
        }
        
        print(f"\n{name.upper()} Model Performance:")
        print(f"  MAE: {mae:.4f} yards")
        print(f"  RMSE: {rmse:.4f} yards")
        print(f"  R²: {r2:.4f}")
    
    return metrics

def load_or_train_models():
    """Load existing models or train new ones if they don't exist."""
    global models
    
    xgb_path = f"{MODEL_PATH}/xgb_model.joblib"
    stacking_path = f"{MODEL_PATH}/stacking_model.joblib"
    
    if os.path.exists(xgb_path) and os.path.exists(stacking_path):
        print("Loading existing models...")
        models['xgb'] = joblib.load(xgb_path)
        models['stacking'] = joblib.load(stacking_path)
        return models, None
    
    print("Training new models...")
    
    # Load and preprocess data
    df = load_data()
    df = preprocess_data(df)
    X, y, feature_cols = prepare_model_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train models
    xgb_model, stacking_model = train_models(X_train, y_train)
    models['xgb'] = xgb_model
    models['stacking'] = stacking_model
    
    # Evaluate models
    metrics = evaluate_models(models, X_test, y_test)
    
    return models, metrics

# Load or train models when the application starts
print("Initializing models...")
models, metrics = load_or_train_models()

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint for Render"""
    return {"status": "healthy", "message": "NFL Rushing Predictor is running"}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "NFL Rushing Predictor"})

@app.get("/predict", response_class=HTMLResponse)
async def predict_page(request: Request):
    return templates.TemplateResponse("predict.html", {"request": request, "title": "Predict Rushing Yards"})

@app.get("/about", response_class=HTMLResponse)
async def about_page(request: Request):
    return templates.TemplateResponse("about.html", {"request": request, "title": "About"})

@app.post("/predict", response_model=PredictionResponse)
async def predict_rushing_yards(play: PlayFeatures):
    """
    Predict the number of rushing yards for a given play.
    
    Parameters:
    - play: PlayFeatures object containing the play data
    
    Returns:
    - Predicted yards and model confidence
    """
    if not models['xgb'] or not models['stacking']:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Convert input to DataFrame
        input_data = pd.DataFrame([play.model_dump()])
        
        # Make predictions with both models
        xgb_pred = models['xgb'].predict(input_data)[0]
        stacking_pred = models['stacking'].predict(input_data)[0]
        
        # Use ensemble prediction (average of both models)
        final_prediction = (xgb_pred + stacking_pred) / 2
        
        # Calculate confidence (inverse of the difference between model predictions)
        confidence = 1 / (1 + abs(xgb_pred - stacking_pred))
        
        return {
            "predicted_yards": round(float(final_prediction), 2),
            "confidence": round(float(confidence), 2),
            "model_used": "XGBoost + Stacking Ensemble"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/model/retrain")
async def retrain_models():
    """
    Retrain the prediction models with the latest data.
    
    Returns:
    - Training metrics and model information
    """
    try:
        global models
        
        # Load and preprocess data
        df = load_data()
        df = preprocess_data(df)
        X, y, feature_cols = prepare_model_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train new models
        xgb_model, stacking_model = train_models(X_train, y_train)
        models['xgb'] = xgb_model
        models['stacking'] = stacking_model
        
        # Evaluate models
        metrics = evaluate_models(models, X_test, y_test)
        
        return {
            "status": "success",
            "message": "Models retrained successfully",
            "metrics": metrics,
            "feature_importance": dict(zip(feature_cols, xgb_model.feature_importances_.tolist()))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
