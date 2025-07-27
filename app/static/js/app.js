// DOM Elements
const teamSelect = document.getElementById('teamSelect');
const playerSelect = document.getElementById('playerSelect');
const totalPlaysEl = document.getElementById('totalPlays');
const avgYardsEl = document.getElementById('avgYards');
const playerAttemptsEl = document.getElementById('playerAttempts');
const playerAvgYardsEl = document.getElementById('playerAvgYards');
const yardsChartEl = document.getElementById('yardsChart');

// Initialize Plotly chart
let yardsChart = {
    data: [{
        x: [],
        y: [],
        type: 'bar',
        marker: {
            color: '#013369',
            line: {
                color: '#d50a0a',
                width: 1.5
            }
        }
    }],
    layout: {
        title: {
            text: 'Rushing Yards Distribution',
            font: {
                family: 'Arial, sans-serif',
                size: 18,
                color: '#333'
            }
        },
        xaxis: {
            title: 'Yards',
            gridcolor: '#f0f0f0',
            showline: true,
            linecolor: '#ddd'
        },
        yaxis: {
            title: 'Number of Plays',
            gridcolor: '#f0f0f0',
            showline: true,
            linecolor: '#ddd'
        },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 40, r: 40, b: 60, l: 60 },
        hovermode: 'closest'
    },
    config: {
        responsive: true,
        displayModeBar: true
    }
};

// Initialize the chart
Plotly.newPlot(yardsChartEl, yardsChart.data, yardsChart.layout, yardsChart.config);

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    updateChart();
    
    // Team selection change
    teamSelect.addEventListener('change', function() {
        const team = this.value;
        if (team) {
            fetchTeamData(team);
        } else {
            resetTeamStats();
        }
    });
    
    // Player selection change
    playerSelect.addEventListener('change', function() {
        const player = this.value;
        if (player) {
            fetchPlayerData(player);
        } else {
            resetPlayerStats();
        }
    });
    
    // Add animation to cards on scroll
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
});

// Fetch Team Data
async function fetchTeamData(team) {
    try {
        // Show loading state
        teamSelect.disabled = true;
        
        const response = await fetch(`/api/team/${team}`);
        if (!response.ok) {
            throw new Error('Team data not found');
        }
        
        const data = await response.json();
        updateTeamStats(data);
        updateChart(team, 'team');
    } catch (error) {
        console.error('Error fetching team data:', error);
        alert('Error loading team data. Please try again.');
    } finally {
        teamSelect.disabled = false;
    }
}

// Fetch Player Data
async function fetchPlayerData(player) {
    try {
        // Show loading state
        playerSelect.disabled = true;
        
        const response = await fetch(`/api/player/${encodeURIComponent(player)}`);
        if (!response.ok) {
            throw new Error('Player data not found');
        }
        
        const data = await response.json();
        updatePlayerStats(data);
        updateChart(player, 'player');
    } catch (error) {
        console.error('Error fetching player data:', error);
        alert('Error loading player data. Please try again.');
    } finally {
        playerSelect.disabled = false;
    }
}

// Update Team Stats UI
function updateTeamStats(data) {
    if (data.error) {
        totalPlaysEl.textContent = 'N/A';
        avgYardsEl.textContent = 'N/A';
        return;
    }
    
    totalPlaysEl.textContent = data.total_plays.toLocaleString();
    avgYardsEl.textContent = data.avg_yards.toFixed(1);
    
    // Add animation
    animateValue('totalPlays', 0, data.total_plays, 1000);
    animateValue('avgYards', 0, data.avg_yards, 1000);
}

// Update Player Stats UI
function updatePlayerStats(data) {
    if (data.error) {
        playerAttemptsEl.textContent = 'N/A';
        playerAvgYardsEl.textContent = 'N/A';
        return;
    }
    
    playerAttemptsEl.textContent = data.total_plays.toLocaleString();
    playerAvgYardsEl.textContent = data.avg_yards.toFixed(1);
    
    // Add animation
    animateValue('playerAttempts', 0, data.total_plays, 1000);
    animateValue('playerAvgYards', 0, data.avg_yards, 1000);
}

// Reset Team Stats
function resetTeamStats() {
    totalPlaysEl.textContent = '-';
    avgYardsEl.textContent = '-';
    updateChart();
}

// Reset Player Stats
function resetPlayerStats() {
    playerAttemptsEl.textContent = '-';
    playerAvgYardsEl.textContent = '-';
    updateChart();
}

// Update Chart
function updateChart(id = null, type = null) {
    // This is a simplified example. In a real app, you would fetch actual data
    // from your backend based on the selected team/player
    
    let x = [];
    let y = [];
    
    if (id) {
        // Generate sample data based on selection
        for (let i = 0; i < 20; i++) {
            x.push(i);
            y.push(Math.floor(Math.random() * 100) + 10); // Random data for demo
        }
        
        // Update chart title based on selection type
        yardsChart.layout.title.text = `${type === 'team' ? 'Team' : 'Player'} Rushing Yards Distribution`;
    } else {
        // Default chart with no selection
        for (let i = 0; i < 20; i++) {
            x.push(i);
            y.push(Math.floor(Math.random() * 50) + 5); // Less data for default view
        }
        yardsChart.layout.title.text = 'Rushing Yards Distribution';
    }
    
    // Update chart data
    yardsChart.data[0].x = x;
    yardsChart.data[0].y = y;
    
    // Redraw chart
    Plotly.react(yardsChartEl, yardsChart.data, yardsChart.layout, yardsChart.config);
}

// Helper function to animate number values
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Add tooltip functionality
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Handle window resize
window.addEventListener('resize', function() {
    Plotly.Plots.resize(yardsChartEl);
});
