# 🚀 Deployment Guide - NFL Rushing Predictor

This guide provides instructions for deploying the NFL Rushing Predictor application to various platforms.

## 📋 Prerequisites

- Python 3.8+
- Git LFS installed
- Access to the GitHub repository

## 🏠 Local Development

### Quick Start
```bash
# Clone the repository
git clone https://github.com/mrsanketpatil19/NFL-Big-Data-Bowl-2023-Player-Performance-Prediction.git
cd NFL-Big-Data-Bowl-2023-Player-Performance-Prediction

# Install Git LFS
git lfs install

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Development Server
```bash
# Run with auto-reload for development
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## ☁️ Cloud Deployment

### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create your-nfl-predictor-app
   ```

2. **Add Buildpacks**
   ```bash
   heroku buildpacks:add heroku/python
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-git-lfs
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set PYTHON_VERSION=3.9.0
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app/)
   - Connect your GitHub repository
   - Railway will automatically detect the Python app

2. **Configure Environment**
   - Set `PORT` environment variable
   - Railway will handle the rest automatically

3. **Deploy**
   - Railway will automatically deploy on push to main

### Render Deployment

1. **Create New Web Service**
   - Go to [Render](https://render.com/)
   - Connect your GitHub repository
   - Choose "Web Service"

2. **Configuration**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.9

3. **Deploy**
   - Render will automatically deploy on push to main

## 🐳 Docker Deployment

### Create Dockerfile
```dockerfile
FROM python:3.9-slim

# Install Git LFS
RUN apt-get update && apt-get install -y git-lfs && git lfs install

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and Run Docker
```bash
# Build the image
docker build -t nfl-predictor .

# Run the container
docker run -p 8000:8000 nfl-predictor
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Optional: Set custom port
PORT=8000

# Optional: Set debug mode
DEBUG=False

# Optional: Set log level
LOG_LEVEL=INFO
```

### Production Settings
```python
# In app.py, add production settings
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

## 📊 Monitoring and Logging

### Health Check Endpoint
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

### Logging Configuration
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 🔒 Security Considerations

### Production Security
1. **HTTPS Only**: Ensure all deployments use HTTPS
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Input Validation**: All inputs are validated via Pydantic models
4. **CORS Configuration**: Configure CORS for production domains

### Environment Variables
```bash
# Set in production environment
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT=100
```

## 📈 Performance Optimization

### Model Loading
- Models are loaded once at startup
- Consider model caching for high-traffic scenarios
- Monitor memory usage with large models

### Static Assets
- All static assets are optimized
- Images are compressed
- CSS/JS are minified for production

## 🚨 Troubleshooting

### Common Issues

1. **Git LFS Files Not Loading**
   ```bash
   git lfs install
   git lfs pull
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 8000
   lsof -i :8000
   # Kill the process
   kill -9 <PID>
   ```

3. **Memory Issues**
   - Monitor memory usage during model loading
   - Consider using smaller models for production

4. **Large File Upload Issues**
   - Ensure Git LFS is properly configured
   - Check file size limits on deployment platform

### Debug Mode
```bash
# Run in debug mode
DEBUG=True python app.py
```

## 📞 Support

For deployment issues:
1. Check the logs in your deployment platform
2. Verify all dependencies are installed
3. Ensure Git LFS is properly configured
4. Check environment variables are set correctly

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        lfs: true
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        token: ${{ secrets.RAILWAY_TOKEN }}
```

---

**🏈 Your NFL Rushing Predictor is now ready for deployment!** 