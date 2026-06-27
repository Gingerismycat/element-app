const leaderboardData = {
    total: [
        { rank: 1, name: 'User #1', score: '30 pt', icon: 'assets/water-profile.svg' },
        { rank: 2, name: 'User #2', score: '28 pt', icon: 'assets/electric-profile.svg' },
        { rank: 3, name: 'User #3', score: '25 pt', icon: 'assets/cloud-profile.svg' },
        { rank: 4, name: 'User #4', score: '24 pt', icon: 'assets/cloud-profile.svg' },
        { rank: 5, name: 'User #5', score: '22 pt', icon: 'assets/electric-profile.svg' },
        { rank: 6, name: 'User #6', score: '20 pt', icon: 'assets/water-profile.svg' },
        { rank: 7, name: 'User #7', score: '17 pt', icon: 'assets/water-profile.svg' }
    ],
    water: [
        { rank: 1, name: 'User #2', score: '34 pt', icon: 'assets/water-profile.svg' },
        { rank: 2, name: 'User #1', score: '31 pt', icon: 'assets/water-profile.svg' },
        { rank: 3, name: 'User #6', score: '28 pt', icon: 'assets/water-profile.svg' },
        { rank: 4, name: 'User #7', score: '24 pt', icon: 'assets/water-profile.svg' },
        { rank: 5, name: 'User #5', score: '21 pt', icon: 'assets/electric-profile.svg' },
        { rank: 6, name: 'User #4', score: '19 pt', icon: 'assets/cloud-profile.svg' },
        { rank: 7, name: 'User #3', score: '16 pt', icon: 'assets/cloud-profile.svg' }
    ],
    electricity: [
        { rank: 1, name: 'User #2', score: '40 pt', icon: 'assets/electric-profile.svg' },
        { rank: 2, name: 'User #5', score: '35 pt', icon: 'assets/electric-profile.svg' },
        { rank: 3, name: 'User #4', score: '29 pt', icon: 'assets/electric-profile.svg' },
        { rank: 4, name: 'User #1', score: '26 pt', icon: 'assets/water-profile.svg' },
        { rank: 5, name: 'User #3', score: '23 pt', icon: 'assets/cloud-profile.svg' },
        { rank: 6, name: 'User #6', score: '18 pt', icon: 'assets/water-profile.svg' },
        { rank: 7, name: 'User #7', score: '14 pt', icon: 'assets/water-profile.svg' }
    ],
    gas: [
        { rank: 1, name: 'User #3', score: '38 pt', icon: 'assets/cloud-profile.svg' },
        { rank: 2, name: 'User #4', score: '33 pt', icon: 'assets/cloud-profile.svg' },
        { rank: 3, name: 'User #7', score: '31 pt', icon: 'assets/water-profile.svg' },
        { rank: 4, name: 'User #5', score: '29 pt', icon: 'assets/electric-profile.svg' },
        { rank: 5, name: 'User #1', score: '26 pt', icon: 'assets/water-profile.svg' },
        { rank: 6, name: 'User #2', score: '24 pt', icon: 'assets/electric-profile.svg' },
        { rank: 7, name: 'User #6', score: '21 pt', icon: 'assets/water-profile.svg' }
    ]
};

function renderLeaderboard(filter) {
    const list = document.querySelector('.leaderboard-list');
    if (!list) return;

    const entries = leaderboardData[filter] || leaderboardData.total;
    list.innerHTML = entries.map(item => `
        <li class="leaderboard-item">
            <div class="leaderboard-rank">
                <span class="rank-number">${item.rank})</span>
                <span class="rank-icon"><img src="${item.icon}" alt="${item.name}" width="22" height="22"></span>
                <span class="rank-label">${item.name}</span>
            </div>
            <span class="rank-score">${item.score}</span>
        </li>
    `).join('');
}

function setActiveFilter(filter) {
    document.querySelectorAll('.leaderboard-filter').forEach(button => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function attachLeaderboardFilters() {
    document.querySelectorAll('.leaderboard-filter').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const filter = button.dataset.filter || 'total';
            setActiveFilter(filter);
            renderLeaderboard(filter);
        });
    });
}

function attachMeterControls() {
    document.querySelectorAll('.simulation-card-icon').forEach(icon => {
        const notch = icon.querySelector('.meter-notch');
        const card = icon.closest('.simulation-card');
        const resource = card?.dataset.resource;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startAngle = 0;

        const updateRotation = angle => {
            if (notch) {
                notch.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            }
        };

        const clampAngle = angle => Math.max(-90, Math.min(90, angle));

        const beginDrag = event => {
            event.preventDefault();
            isDragging = true;
            startX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
            startY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
            startAngle = window.simulation?.state[resource]?.angle || 0;
            icon.classList.add('dragging');
        };

        const moveDrag = event => {
            if (!isDragging) return;
            if (event.cancelable) {
                event.preventDefault();
            }
            const currentX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
            const currentY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
            const deltaX = currentX - startX;
            const deltaY = startY - currentY;
            const deltaAngle = (deltaX + deltaY) / 2;
            const nextAngle = clampAngle(startAngle + deltaAngle);
            if (resource && window.simulation) {
                window.simulation.setSimulationAngle(resource, nextAngle);
                window.simulation.updateSimulationCard(resource);
                updateRotation(nextAngle);
            }
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            icon.classList.remove('dragging');
        };

        icon.addEventListener('mousedown', beginDrag);
        icon.addEventListener('touchstart', beginDrag, { passive: true });
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    });
}

function router() {
    const page = location.hash.replace('#', '') || 'index';
    const content = document.getElementById('page-content');

    content.style.opacity = '0';

    setTimeout(() => {
        document.querySelectorAll('[data-page]').forEach(el => {
            el.style.display = el.dataset.page === page ? 'block' : 'none';
        });
        content.style.opacity = '1';
    }, 300);

    document.querySelectorAll('.nav-link[data-target]').forEach(link => {
        link.classList.toggle('active', link.dataset.target === page);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link[data-target]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            location.hash = this.dataset.target;
        });
    });

    attachLeaderboardFilters();
    attachMeterControls();
    window.simulation?.updateAllSimulationCards();
    renderLeaderboard('total');
});

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
