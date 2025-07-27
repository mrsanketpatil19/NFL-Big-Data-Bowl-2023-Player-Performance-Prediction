// Simple form handler for NFL Rushing Predictor
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const form = document.getElementById('predictionForm');
    const predictButton = document.getElementById('predictButton');
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultsSection = document.getElementById('predictionResults');
    
    console.log('Form found:', form);
    console.log('Predict button found:', predictButton);
    
    // Set up range input displays
    const rangeInputs = form.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const displayId = input.id + 'Value';
        const displayElement = document.getElementById(displayId);
        if (displayElement) {
            // Initial display
            updateRangeDisplay(input, displayElement);
            
            // Update on change
            input.addEventListener('input', () => {
                updateRangeDisplay(input, displayElement);
            });
        }
    });
    
    // Set up field position interaction
    const field = document.querySelector('.football-field');
    const playerMarker = document.getElementById('playerMarker');
    const xPosition = document.getElementById('xPosition');
    const yPosition = document.getElementById('yPosition');
    
    console.log('Field found:', field);
    console.log('Player marker found:', playerMarker);
    
    if (field && playerMarker) {
        setupFieldInteraction(field, playerMarker, xPosition, yPosition);
    }
    
    if (predictButton) {
        console.log('Adding click event listener to predict button');
        predictButton.addEventListener('click', async function(e) {
            console.log('Predict button clicked');
            e.preventDefault();
            
            // Validate form
            if (!form.checkValidity()) {
                console.log('Form validation failed');
                form.classList.add('was-validated');
                return;
            }
            console.log('Form validation passed');
            
            // Show loading state
            predictButton.disabled = true;
            submitText.textContent = 'Predicting...';
            loadingSpinner.classList.remove('d-none');
            
            try {
                console.log('Preparing form data...');
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = isNaN(value) ? value : parseFloat(value);
                });
                console.log('Form data:', data);
                
                // Convert to API format
                const apiData = {
                    X_std: parseFloat(data.xPosition) || 0,
                    Y_std: parseFloat(data.yPosition) || 0,
                    S: parseFloat(data.playerSpeed) || 0,
                    A: parseFloat(data.playerAccel) || 0,
                    Dis: parseFloat(data.playerDis) || 0,
                    Dir_std: parseFloat(data.playerDir) || 0,
                    X_std_end: parseFloat(data.xPosition) || 0,
                    Y_std_end: parseFloat(data.yPosition) || 0,
                    PlayerHeight: parseFloat(data.playerHeight) || 0,
                    PlayerWeight: parseFloat(data.playerWeight) || 0,
                    PlayerAge: parseFloat(data.playerAge) || 0,
                    Down: parseInt(data.down) || 1,
                    Distance: parseInt(data.distance) || 10,
                    DefendersInTheBox: parseInt(data.defendersInBox) || 7
                };
                
                console.log('Calling prediction API...');
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(apiData)
                });
                
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                
                const result = await response.json();
                console.log('Prediction received:', result);
                
                console.log('Displaying results...');
                // Hide form, show results
                form.classList.add('d-none');
                resultsSection.classList.remove('d-none');
                
                // Update prediction display
                const predictedYardsElement = document.getElementById('predictedYards');
                if (predictedYardsElement) {
                    predictedYardsElement.textContent = result.predicted_yards;
                }
                
                // Animate progress bar
                const yardageBar = document.getElementById('yardageBar');
                if (yardageBar) {
                    const maxYards = 20;
                    const percentage = Math.min(100, (result.predicted_yards / maxYards) * 100);
                    yardageBar.style.width = percentage + '%';
                    yardageBar.setAttribute('aria-valuenow', percentage);
                }
                
                console.log('Scrolling to results...');
                resultsSection.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Prediction error:', error);
                alert('Failed to get prediction. Please try again.');
            } finally {
                // Reset button state
                predictButton.disabled = false;
                submitText.textContent = 'Predict Rushing Yards';
                loadingSpinner.classList.add('d-none');
            }
        });
    }
    
    // Handle new prediction button
    const newPredictionBtn = document.getElementById('newPredictionBtn');
    if (newPredictionBtn) {
        newPredictionBtn.addEventListener('click', function() {
            form.reset();
            form.classList.remove('was-validated');
            form.classList.remove('d-none');
            resultsSection.classList.add('d-none');
            
            // Reset progress bar
            const yardageBar = document.getElementById('yardageBar');
            if (yardageBar) {
                yardageBar.style.width = '0%';
                yardageBar.setAttribute('aria-valuenow', '0');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

/**
 * Updates the display element for a range input
 */
function updateRangeDisplay(input, displayElement) {
    const value = input.value;
    const unit = input.dataset.unit || '';
    displayElement.textContent = value + ' ' + unit;
}

/**
 * Sets up the football field interaction for player positioning
 */
function setupFieldInteraction(field, playerMarker, xPosition, yPosition) {
    console.log('Setting up field interaction');
    
    // Initial position (center)
    playerMarker.style.left = '50%';
    playerMarker.style.top = '50%';
    
    // Handle click on field
    field.addEventListener('click', function(e) {
        console.log('Field clicked');
        const rect = field.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Constrain to field boundaries (with some padding)
        const constrainedX = Math.max(5, Math.min(95, x));
        const constrainedY = Math.max(5, Math.min(95, y));
        
        // Update marker position
        playerMarker.style.left = constrainedX + '%';
        playerMarker.style.top = constrainedY + '%';
        
        // Update hidden inputs (normalized to 0-100)
        if (xPosition) xPosition.value = Math.round(constrainedX);
        if (yPosition) yPosition.value = Math.round(constrainedY);
        
        console.log('Player positioned at:', constrainedX + '%, ' + constrainedY + '%');
    });
} 