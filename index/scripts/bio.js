// scripts/bio.js

async function loadBioContent() {
    try {
        // Fetch your external JSON text description file
        const response = await fetch('json/bio-data.json'); // Adjust path to 'json/bio-data.json' if needed
        const bioData = await response.json();
        
        const container = document.getElementById('dynamic-bio-box');
        if (!container) return;
        
        container.innerHTML = ''; // Clear out the loading placeholder text

        bioData.forEach(section => {
            // Check if this section needs a code/monospace look
            let textStyle = section.isMonospace 
                ? 'font-family: monospace; font-size: 0.9rem; color: #888; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin: 0;'
                : 'margin: 0;';

            // Generate the dynamic HTML structure for each block
            const sectionHTML = `
                <section class="bio-section" style="margin-bottom: 25px;">
                    <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.2rem; border-left: 3px solid #fe2c55; padding-left: 10px;">
                        ${section.title}
                    </h3>
                    <p style="${textStyle}">
                        ${section.text}
                    </p>
                </section>
            `;
            
            container.innerHTML += sectionHTML;
        });

    } catch (error) {
        console.error("Error building dynamic bio box:", error);
        document.getElementById('dynamic-bio-box').innerHTML = 
            `<p style="color: #fe2c55; text-align: center;">Failed to load bio configurations.</p>`;
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
    loadBioContent();
    loadFooter();
});