# 🏈 NFL Rushing Yards Predictor

A sophisticated machine learning application that predicts NFL rushing performance using advanced analytics and AI. This project leverages the NFL Big Data Bowl 2020 dataset to provide accurate rushing yard predictions for individual plays.

## 🚀 Features

- **Advanced ML Models**: XGBoost Regressor and Stacking Ensemble models
- **Interactive Web Interface**: Modern, responsive design with NFL theming
- **Real-time Predictions**: Instant rushing yard predictions with confidence scores
- **Professional UI**: Custom NFL branding with rounded, modern design
- **API Documentation**: Complete FastAPI documentation with interactive testing
- **Data-Driven Insights**: Comprehensive analytics and feature engineering

## 📊 Model Performance

- **Mean Absolute Error**: 3.42 yards
- **Model Type**: Ensemble (XGBoost + Stacking)
- **Features Analyzed**: 5+ advanced metrics
- **Training Data**: NFL Big Data Bowl 2020 dataset

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **XGBoost**: Gradient boosting for predictions
- **Scikit-learn**: Machine learning utilities
- **Pandas & NumPy**: Data processing
- **Joblib**: Model serialization

### Frontend
- **HTML5/CSS3**: Modern web standards
- **Bootstrap 5**: Responsive design framework
- **JavaScript**: Interactive functionality
- **Plotly.js**: Data visualization
- **Custom NFL Theming**: Professional sports branding

## 📁 Project Structure

```
NFL-Rushing-Predictor/
├── app.py                 # FastAPI main application
├── requirements.txt       # Python dependencies
├── Project.ipynb         # Data analysis notebook
├── README.md             # Project documentation
├── .gitattributes        # Git LFS configuration
├── .gitignore           # Git ignore rules
├── csv/                  # Data files
│   ├── train.csv        # Training dataset (237MB)
│   └── kaggle/          # Kaggle competition files
├── models/              # Trained ML models
│   ├── stacking_model.joblib  # Ensemble model (156MB)
│   └── xgb_model.joblib      # XGBoost model (820KB)
├── static/              # Frontend assets
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── img/             # Images and logos
├── templates/           # HTML templates
│   ├── base.html        # Base template
│   ├── index.html       # Home page
│   ├── predict.html     # Prediction interface
│   └── about.html       # About page
└── nfl_dashboard/       # Additional dashboard components
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Git LFS (for large file handling)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrsanketpatil19/NFL-Big-Data-Bowl-2023-Player-Performance-Prediction.git
   cd NFL-Big-Data-Bowl-2023-Player-Performance-Prediction
   ```

2. **Install Git LFS** (if not already installed)
   ```bash
   git lfs install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   - Web Interface: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Prediction Interface: http://localhost:8000/predict

## 🎯 Usage

### Web Interface
1. Navigate to the home page to see project overview
2. Click "Start Predicting" to access the prediction interface
3. Fill in player and play information
4. Click "Predict Rushing Yards" to get instant predictions
5. View detailed results with confidence scores

### API Usage
```python
import requests

# Make a prediction
url = "http://localhost:8000/predict"
data = {
    "playerSpeed": 8.5,
    "playerAccel": 2.1,
    "playerDir": 45.0,
    "playerDis": 5.2,
    "playerX": 25.0,
    "playerY": 15.0,
    "playerHeight": 72,
    "playerWeight": 220,
    "playerAge": 25,
    "down": 2,
    "distance": 7,
    "quarter": 2,
    "timeRemaining": 1200
}

response = requests.post(url, json=data)
prediction = response.json()
print(f"Predicted Rushing Yards: {prediction['predicted_yards']}")
```

## 📈 Model Details

### Features Used
- **Player Metrics**: Speed, acceleration, direction, distance
- **Position Data**: X/Y coordinates on field
- **Player Demographics**: Height, weight, age
- **Game Context**: Down, distance, quarter, time remaining
- **Advanced Features**: 5+ derived metrics and interactions

### Model Architecture
- **Primary Model**: XGBoost Regressor
- **Ensemble Model**: Stacking (Ridge + RandomForest + XGBoost)
- **Feature Engineering**: 5+ engineered features
- **Validation**: Cross-validation with multiple folds

## 🎨 Design Features

### NFL Branding
- Custom NFL logo integration
- Professional sports color scheme
- Rounded, modern UI elements
- Responsive design for all devices

### Interactive Elements
- Real-time form validation
- Interactive football field positioning
- Dynamic charts and visualizations
- Smooth animations and transitions

## 📊 Data Sources

- **NFL Big Data Bowl 2020**: Primary dataset
- **Next Gen Stats**: Player tracking data
- **Play-by-Play Data**: Game situation information
- **Player Demographics**: Height, weight, age data

## 🔧 Development

### Local Development
```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Run tests (if available)
python -m pytest
```

### Git LFS Management
```bash
# Track large files
git lfs track "*.csv"
git lfs track "*.joblib"
git lfs track "*.zip"
git lfs track "*.jpg"
git lfs track "*.png"

# Check LFS status
git lfs ls-files
git lfs status
```

## 📝 API Documentation

### Endpoints

#### POST /predict
Predict rushing yards for a given play scenario.

**Request Body:**
```json
{
  "playerSpeed": 8.5,
  "playerAccel": 2.1,
  "playerDir": 45.0,
  "playerDis": 5.2,
  "playerX": 25.0,
  "playerY": 15.0,
  "playerHeight": 72,
  "playerWeight": 220,
  "playerAge": 25,
  "down": 2,
  "distance": 7,
  "quarter": 2,
  "timeRemaining": 1200
}
```

**Response:**
```json
{
  "predicted_yards": 4.2,
  "confidence": 0.85,
  "success_probability": 0.72,
  "model_used": "stacking_ensemble"
}
```

#### GET /docs
Interactive API documentation (Swagger UI)

#### GET /model/retrain
Retrain the model with new data (if implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NFL Big Data Bowl 2020**: For providing the dataset
- **Kaggle**: For hosting the competition
- **FastAPI**: For the excellent web framework
- **Bootstrap**: For the responsive design framework

## 📞 Contact

- **GitHub**: [@mrsanketpatil19](https://github.com/mrsanketpatil19)
- **Project Link**: [https://github.com/mrsanketpatil19/NFL-Big-Data-Bowl-2023-Player-Performance-Prediction](https://github.com/mrsanketpatil19/NFL-Big-Data-Bowl-2023-Player-Performance-Prediction)

## 📊 Project Statistics

- **Total Size**: 501MB
- **Lines of Code**: 1000+
- **Models**: 2 trained models
- **Features**: 5+ engineered features
- **Accuracy**: 3.42 yards MAE

---

**🏈 Built with ❤️ for NFL Analytics and Machine Learning** 