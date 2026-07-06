
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
    loadFooter();
});