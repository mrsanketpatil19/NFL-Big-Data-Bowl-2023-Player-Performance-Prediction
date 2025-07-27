# NFL Rushing Analytics Dashboard

A modern, interactive web application for analyzing NFL rushing plays using FastAPI and Plotly.

## Features

- Team performance analysis
- Player statistics and metrics
- Interactive visualizations
- Responsive design for all devices
- Real-time data updates

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- Node.js and npm (for frontend dependencies)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nfl_dashboard
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Make sure your NFL data is in the correct location:
   - Place your `train.csv` file in `/Users/sanket/Documents/Mrunali/1st_Project/csv/`
   - The application expects the data to be in this specific location

## Running the Application

1. Start the FastAPI server:
   ```bash
   cd app
   uvicorn main:app --reload
   ```

2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:8000
   ```

## Project Structure

```
nfl_dashboard/
├── app/
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── app.js
│   ├── templates/
│   │   └── index.html
│   └── main.py
├── data/
│   └── (your data files)
└── requirements.txt
```

## API Endpoints

- `GET /`: Main dashboard
- `GET /api/team/{team}`: Get team statistics
- `GET /api/player/{player_id}`: Get player statistics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NFL for the play-by-play data
- FastAPI for the backend framework
- Plotly for interactive visualizations
- Bootstrap for responsive design
