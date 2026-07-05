// scripts/main.js

const TWITCH_USERNAME = 'j0137dev'; 
const CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID'; 
const ACCESS_TOKEN = 'YOUR_APP_ACCESS_TOKEN'; 

async function updateTwitchCardStatus() {
    const twitchCard = document.getElementById('twitch-card');
    const twitchText = document.getElementById('twitch-text');
    
    if (!twitchCard || !twitchText) return;

    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`, {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        // If you are live!
        if (data.data && data.data.length > 0) {
            const streamInfo = data.data[0];
            
            // Add a class for specific CSS live styling rules
            twitchCard.classList.add('live-now');
            
            // Update text to show game title
            twitchText.innerHTML = `🔴 LIVE NOW<br><small style="font-size:0.8rem; opacity:0.9;">Playing ${streamInfo.game_name}</small>`;
        }
    } catch (error) {
        console.error("Twitch API Error:", error);
    }
}

// Separate function to load the main landing footer file
function loadMainFooter() {
    fetch('footers/footerMain.html')
        .then(response => response.text())
        .then(data => {
            const footer = document.getElementById('main-footer');
            if (footer) footer.innerHTML = data;
        })
        .catch(error => console.error('Error loading main footer:', error));
}

// Fire actions when structure loads
window.addEventListener('DOMContentLoaded', () => {
    updateTwitchCardStatus();
    loadMainFooter();
});