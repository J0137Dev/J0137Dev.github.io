// scripts/main.js


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
    loadMainFooter();
});