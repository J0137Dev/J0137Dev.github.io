
const scheduleTimeZone = 'America/New_York';

function getScheduleClocks(time) {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;

    const [, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod] = match;
    const parseClock = (hour, minute, period) => {
        const numericHour = Number(hour);
        const numericMinute = Number(minute);
        if (numericMinute > 59) return null;
        if (period) {
            if (numericHour < 1 || numericHour > 12) return null;
            return { hour: numericHour % 12 + (period.toUpperCase() === 'PM' ? 12 : 0), minute: numericMinute };
        }
        if (numericHour > 23) return null;
        return { hour: numericHour, minute: numericMinute };
    };

    const start = parseClock(startHour, startMinute, startPeriod);
    const end = parseClock(endHour, endMinute, endPeriod);
    return start && end ? { start, end } : null;
}

function isLiveNow(item) {
    if (!item.isActive || !item.time || item.time === '--') return false;

    const clocks = getScheduleClocks(item.time);
    if (!clocks) return false;

    const nowParts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
        timeZone: scheduleTimeZone,
        weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayIndex.indexOf(nowParts.weekday);
    const itemDay = dayIndex.indexOf(item.day);
    const currentMinutes = Number(nowParts.hour) * 60 + Number(nowParts.minute);
    const startMinutes = clocks.start.hour * 60 + clocks.start.minute;
    const endMinutes = clocks.end.hour * 60 + clocks.end.minute;

    if (endMinutes > startMinutes) {
        return currentDay === itemDay && currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    return (currentDay === itemDay && currentMinutes >= startMinutes) ||
        (currentDay === (itemDay + 1) % 7 && currentMinutes < endMinutes);
}

function convertScheduleTime(time, day) {
    if (!time || time === '--') return time;

    const clocks = getScheduleClocks(time);
    if (!clocks) return time;

    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
    if (dayIndex === -1) return time;

    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setDate(currentDate.getDate() + (dayIndex - currentDate.getDay() + 7) % 7);

    const createSourceDate = (hour, minute, dayOffset = 0) => {
        const sourceDate = new Date(targetDate);
        sourceDate.setDate(sourceDate.getDate() + dayOffset);
        const utcGuess = Date.UTC(
            sourceDate.getFullYear(),
            sourceDate.getMonth(),
            sourceDate.getDate(),
            hour,
            minute
        );
        const offsetParts = new Intl.DateTimeFormat('en-US', {
            timeZone: scheduleTimeZone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(new Date(utcGuess));
        const parts = Object.fromEntries(offsetParts.map(part => [part.type, part.value]));
        const timezoneAsUtc = Date.UTC(
            Number(parts.year), Number(parts.month) - 1, Number(parts.day),
            Number(parts.hour), Number(parts.minute), Number(parts.second)
        );
        return new Date(utcGuess - (timezoneAsUtc - utcGuess));
    };

    const start = createSourceDate(clocks.start.hour, clocks.start.minute);
    const startMinutes = clocks.start.hour * 60 + clocks.start.minute;
    const endMinutes = clocks.end.hour * 60 + clocks.end.minute;
    const endIsNextDay = endMinutes <= startMinutes;
    const end = createSourceDate(clocks.end.hour, clocks.end.minute, endIsNextDay ? 1 : 0);
    const formatter = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
    });

    return `${formatter.format(start)} - ${formatter.format(end)}`;
}

async function loadManagedSchedule() {
    try {
        // Fetch the external JSON configuration data file
        const response = await fetch('json/schedule-data.json');
        const scheduleData = await response.json();
        const gameColors = {};
        
        const container = document.getElementById('dynamic-schedule-box');
        const renderSchedule = () => {
            container.innerHTML = ''; // Clear loading placeholder text

            scheduleData.forEach(item => {
            // Determine card CSS status layout classes
            let cardClass = "day-card offline";
            let statusText = "No Stream";
            let statusStyle = "background: var(--hb)"; // Default gray offline look
            let statusClass = "status-tag event";

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

            if (isLiveNow(item)) {
                statusText = "Live now";
                statusStyle = "background: #fe2c55; color: white";
                statusClass = "status-tag live";
            }

            const gameKey = item.game.trim().toLowerCase();
            const isOffline = gameKey === 'offline' || gameKey === 'offline/working';
            if (!isOffline && !item.gameColor && !gameColors[gameKey]) {
                gameColors[gameKey] = `hsl(${Math.floor(Math.random() * 360)} 75% 60%)`;
            }

            const gameColor = isOffline ? '' : item.gameColor || gameColors[gameKey];
            const gameStyle = gameColor ? ` style="color: ${gameColor}"` : '';

            // Generate the full HTML structure for the day card dynamically
            const cardHTML = `
                <div class="${cardClass}">
                    <div class="day-name">${item.day}</div>
                    <div class="stream-time">${convertScheduleTime(item.time, item.day)}</div>
                    <div class="stream-game"${gameStyle}>${item.game}</div>
                    <span class="${statusClass}" style="${statusStyle}">${statusText}</span>
                </div>
            `;
            
            container.innerHTML += cardHTML;
            });
        };

        renderSchedule();
        setInterval(renderSchedule, 30000);

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