// scripts/schedule.js
async function loadManagedSchedule() {
    try {
        // Fetch the external JSON configuration data file
        const response = await fetch('json/schedule-data.json');
        const scheduleData = await response.json();
        
        const container = document.getElementById('dynamic-schedule-box');
        container.innerHTML = ''; // Clear loading placeholder text

        scheduleData.forEach(item => {
            // Determine card CSS status layout classes
            let cardClass = "day-card offline";
            let statusText = "No Stream";
            let statusStyle = "background: var(--hb)"; // Default gray offline look

            if (item.isActive) {
                cardClass = "day-card active";
                statusText = "Upcoming live";
                statusStyle = "background: var(--accent); color: var(--bg)"; // Your stream theme color
            }

            if (item.isActive && item.isSpecialEvent) {
                cardClass = "day-card special";
                statusText = "upcoming special event"; 
                statusStyle = "background: var(--special); color: var(--bg);"; 
            }

            if (item.isActive && item.isCollab) {
                cardClass = "day-card collab";
                statusText = "Upcoming collab";
                statusStyle = "background: var(--collab); color: var(--bg)"; 
            }

            // Generate the full HTML structure for the day card dynamically
            const cardHTML = `
                <div class="${cardClass}">
                    <div class="day-name">${item.day}</div>
                    <div class="stream-time">${item.time}</div>
                    <div class="stream-game">${item.game}</div>
                    <span class="status-tag event" style="${statusStyle}">${statusText}</span>
                </div>
            `;
            
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error building managed schedule:", error);
        document.getElementById('dynamic-schedule-box').innerHTML = 
            `<p style="color: #fe2c55; text-align: center;">Failed to load schedule file configuration.</p>`;
    }
}

// Twitch API Status Check Configuration
const TWITCH_USERNAME = 'j0137dev'; 
const CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID'; 
const ACCESS_TOKEN = 'YOUR_APP_ACCESS_TOKEN'; 

async function checkTwitchStatus() {
    const banner = document.getElementById('live-status-banner');
    const bannerText = document.getElementById('status-banner-text');
    
    if (!banner || !bannerText) return;

    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`, {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const streamInfo = data.data[0];
            banner.className = "status-banner status-live-btn";
            banner.innerHTML = `
                <a href="https://twitch.tv/${TWITCH_USERNAME}" target="_blank" class="live-button-link">
                    <span class="status-dot"></span>
                    <span>LIVE NOW: Playing <strong>${streamInfo.game_name}</strong></span>
                    <span class="join-prompt">Join Stream →</span>
                </a>
            `;
        } else {
            banner.className = "status-banner status-offline";
            banner.innerHTML = `<span class="status-dot"></span><span>CURRENTLY OFFLINE</span>`;
        }
    } catch (error) {
        console.error("Twitch API Error:", error);
        banner.className = "status-banner status-offline";
        bannerText.innerText = "Status temporarily unavailable";
    }
}

// Load footer content dynamically
function loadFooter() {
    fetch('footers/footer.html')
        .then(response => response.text())
        .then(data => {
            const footer = document.getElementById('main-footer');
            if (footer) footer.innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

// Run everything when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    loadManagedSchedule();
    checkTwitchStatus();
    loadFooter();
});