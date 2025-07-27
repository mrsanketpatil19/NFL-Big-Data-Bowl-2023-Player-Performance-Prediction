// Main JavaScript for NFL Rushing Predictor

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle prediction form submission
    const predictionForm = document.getElementById('predictionForm');
    console.log('Prediction form found:', predictionForm);
    if (predictionForm) {
        console.log('Setting up prediction form...');
        setupPredictionForm();
    } else {
        console.error('Prediction form not found!');
    }

    // Handle navigation active state
    updateActiveNavLink();
    window.addEventListener('hashchange', updateActiveNavLink);
});

/**
 * Sets up the prediction form with event listeners and validation
 */
function setupPredictionForm() {
    console.log('setupPredictionForm called');
    const form = document.getElementById('predictionForm');
    console.log('Form element:', form);
    
    const submitBtn = document.getElementById('predictButton');
    console.log('Submit button:', submitBtn);
    
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultsSection = document.getElementById('predictionResults');
    const newPredictionBtn = document.getElementById('newPredictionBtn');
    
    console.log('Submit text:', submitText);
    console.log('Loading spinner:', loadingSpinner);
    console.log('Results section:', resultsSection);
    console.log('New prediction button:', newPredictionBtn);
    
    // Update range input displays
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
    
    // Field position interaction
    const field = document.querySelector('.football-field');
    const playerMarker = document.getElementById('playerMarker');
    const xPosition = document.getElementById('xPosition');
    const yPosition = document.getElementById('yPosition');
    
    if (field && playerMarker) {
        setupFieldInteraction(field, playerMarker, xPosition, yPosition);
    }
    
    // Button click handler
    console.log('Adding click event listener to predict button');
    submitBtn.addEventListener('click', async function(e) {
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
        submitBtn.disabled = true;
        submitText.textContent = 'Predicting...';
        loadingSpinner.classList.remove('d-none');
        
        try {
            console.log('Preparing form data...');
            // Prepare form data
            const formData = getFormData(form);
            console.log('Form data:', formData);
            
            console.log('Calling prediction API...');
            // Call prediction API
            const prediction = await fetchPrediction(formData);
            console.log('Prediction received:', prediction);
            
            console.log('Displaying results...');
            // Display results
            displayPredictionResults(prediction);
            
            console.log('Scrolling to results...');
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Prediction error:', error);
            showError('Failed to get prediction. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitText.textContent = 'Predict Rushing Yards';
            loadingSpinner.classList.add('d-none');
        }
    });
    
    // New prediction button
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
            
            // Reset field position
            if (playerMarker) {
                playerMarker.style.left = '50%';
                playerMarker.style.top = '50%';
                if (xPosition) xPosition.value = '50';
                if (yPosition) yPosition.value = '50';
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
    });
    
    // New prediction button
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
            
            // Reset field position
            if (playerMarker) {
                playerMarker.style.left = '50%';
                playerMarker.style.top = '50%';
                if (xPosition) xPosition.value = '50';
                if (yPosition) yPosition.value = '50';
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/**
 * Updates the display element for a range input
 * @param {HTMLInputElement} input - The range input element
 * @param {HTMLElement} displayElement - The element to update with the value
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
    // Initial position (center)
    playerMarker.style.left = '50%';
    playerMarker.style.top = '50%';
    
    // Handle click on field
    field.addEventListener('click', function(e) {
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
    });
}

/**
 * Gets form data and converts it to an object
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} Form data as key-value pairs
 */
function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to plain object
    formData.forEach((value, key) => {
        // Convert numeric values to numbers
        data[key] = isNaN(value) ? value : parseFloat(value);
    });
    
    return data;
}

/**
 * Fetches prediction from the API
 * @param {Object} formData - Form data to send to the API
 * @returns {Promise<Object>} Prediction results
 */
async function fetchPrediction(formData) {
    // Convert form data to match the expected API format
    const apiData = {
        X_std: parseFloat(formData.xPosition) || 0,
        Y_std: parseFloat(formData.yPosition) || 0,
        S: parseFloat(formData.playerSpeed) || 0,
        A: parseFloat(formData.playerAccel) || 0,
        Dis: parseFloat(formData.playerDis) || 0,
        Dir_std: parseFloat(formData.playerDir) || 0,
        X_std_end: parseFloat(formData.xPosition) || 0, // Use same as X_std for now
        Y_std_end: parseFloat(formData.yPosition) || 0, // Use same as Y_std for now
        PlayerHeight: parseFloat(formData.playerHeight) || 0,
        PlayerWeight: parseFloat(formData.playerWeight) || 0,
        PlayerAge: parseFloat(formData.playerAge) || 0,
        Down: parseInt(formData.down) || 1,
        Distance: parseInt(formData.distance) || 10,
        DefendersInTheBox: parseInt(formData.defendersInBox) || 7
    };

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(apiData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('API Error:', error);
            throw new Error(error.detail || 'Failed to get prediction');
        }
        
        const result = await response.json();
        
        // Format the response to match what the frontend expects
        return {
            predictedYards: result.predicted_yards,
            confidence: 75, // Default confidence
            successProbability: 70, // Default success probability
            insights: [
                `Predicted ${result.predicted_yards.toFixed(1)} yards using ${result.model_used} model.`,
                result.confidence ? `Model confidence: ${result.confidence}%` : ""
            ].filter(Boolean) // Remove empty strings
        };
        
    } catch (error) {
        console.error('Prediction error:', error);
        throw new Error('Failed to get prediction. Please try again.');
    }
}

/**
 * Displays the prediction results
 * @param {Object} prediction - Prediction results from the API
 */
function displayPredictionResults(prediction) {
    // Hide form, show results
    const form = document.getElementById('predictionForm');
    const resultsSection = document.getElementById('predictionResults');
    
    form.classList.add('d-none');
    resultsSection.classList.remove('d-none');
    
    // Update prediction display
    const predictedYardsElement = document.getElementById('predictedYards');
    const confidenceScoreElement = document.getElementById('confidenceScore');
    const successProbabilityElement = document.getElementById('successProbability');
    const insightsListElement = document.getElementById('insightsList');
    
    if (predictedYardsElement) {
        predictedYardsElement.textContent = prediction.predictedYards;
    }
    
    if (confidenceScoreElement) {
        confidenceScoreElement.textContent = prediction.confidence + '%';
    }
    
    if (successProbabilityElement) {
        successProbabilityElement.textContent = prediction.successProbability + '%';
    }
    
    // Update insights
    if (insightsListElement && prediction.insights) {
        insightsListElement.innerHTML = ''; // Clear existing insights
        
        prediction.insights.forEach(insight => {
            const li = document.createElement('li');
            li.textContent = insight;
            insightsListElement.appendChild(li);
        });
    }
    
    // Animate progress bar
    const yardageBar = document.getElementById('yardageBar');
    if (yardageBar) {
        // Cap at 20 yards for visualization purposes
        const maxYards = 20;
        const percentage = Math.min(100, (prediction.predictedYards / maxYards) * 100);
        
        // Animate the progress bar
        let width = 0;
        const id = setInterval(frame, 10);
        
        function frame() {
            if (width >= percentage) {
                clearInterval(id);
            } else {
                width++;
                yardageBar.style.width = width + '%';
                yardageBar.setAttribute('aria-valuenow', width);
                
                // Update color based on yards
                if (width < 33) {
                    yardageBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-danger';
                } else if (width < 66) {
                    yardageBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-warning';
                } else {
                    yardageBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
                }
            }
        }
    }
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
    // Check if alert container exists, if not create it
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.className = 'position-fixed top-0 end-0 p-3';
        alertContainer.style.zIndex = '1100';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container and auto-remove after 5 seconds
    alertContainer.appendChild(alertDiv);
    
    // Initialize Bootstrap alert
    const bsAlert = new bootstrap.Alert(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        bsAlert.close();
    }, 5000);
}

/**
 * Updates the active state of navigation links based on current URL
 */
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if ((currentPath === '/' && linkPath === '/') || 
            (linkPath !== '/' && currentPath.includes(linkPath))) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateRangeDisplay,
        setupFieldInteraction,
        getFormData,
        fetchPrediction,
        displayPredictionResults,
        showError,
        updateActiveNavLink
    };
}
