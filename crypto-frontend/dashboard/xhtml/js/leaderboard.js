// MotionFalcon Leaderboard Integration
class MotionFalconLeaderboard {
    constructor() {
        this.api = new MotionFalconAPI();
        this.ui = new MotionFalconUI();
        this.init();
    }

    async init() {
        console.log('Initializing leaderboard...');
        
        // Check authentication
        if (!this.api.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'page-login.html';
            return;
        }

        // Load all leaderboard data
        await this.loadGlobalLeaderboard();
        await this.loadWeeklyLeaderboard();
        await this.loadLeaderboardStats();
        await this.loadMyRank();
    }

    async loadGlobalLeaderboard() {
        try {
            console.log('Loading global leaderboard...');
            const response = await this.api.get('/leaderboard/global');
            
            if (response.success) {
                this.updateGlobalLeaderboard(response.data);
                this.updateTotalUsers(response.data.total_users);
            } else {
                console.error('Failed to load global leaderboard:', response.message);
                this.showError('Failed to load global leaderboard');
            }
        } catch (error) {
            console.error('Error loading global leaderboard:', error);
            this.showError('Error loading global leaderboard');
        }
    }

    async loadWeeklyLeaderboard() {
        try {
            console.log('Loading weekly leaderboard...');
            const response = await this.api.get('/leaderboard/weekly');
            
            if (response.success) {
                this.updateWeeklyLeaderboard(response.data);
            } else {
                console.error('Failed to load weekly leaderboard:', response.message);
                this.showError('Failed to load weekly leaderboard');
            }
        } catch (error) {
            console.error('Error loading weekly leaderboard:', error);
            this.showError('Error loading weekly leaderboard');
        }
    }

    async loadLeaderboardStats() {
        try {
            console.log('Loading leaderboard stats...');
            const response = await this.api.get('/leaderboard/stats');
            
            if (response.success) {
                this.updateLeaderboardStats(response.data);
            } else {
                console.error('Failed to load leaderboard stats:', response.message);
                this.showError('Failed to load leaderboard stats');
            }
        } catch (error) {
            console.error('Error loading leaderboard stats:', error);
            this.showError('Error loading leaderboard stats');
        }
    }

    async loadMyRank() {
        try {
            console.log('Loading my rank...');
            const response = await this.api.get('/leaderboard/my-rank');
            
            if (response.success) {
                this.updateMyRank(response.data);
            } else {
                console.error('Failed to load my rank:', response.message);
                this.updateMyRank({ global_rank: 'N/A', weekly_rank: 'N/A' });
            }
        } catch (error) {
            console.error('Error loading my rank:', error);
            this.updateMyRank({ global_rank: 'N/A', weekly_rank: 'N/A' });
        }
    }

    updateGlobalLeaderboard(data) {
        const container = document.getElementById('global-leaderboard');
        if (!container) return;

        if (!data.leaderboard || data.leaderboard.length === 0) {
            container.innerHTML = '<div class="text-center"><p>No leaderboard data available</p></div>';
            return;
        }

        let html = '<div class="leaderboard-entries">';
        
        data.leaderboard.forEach((entry, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
            
            html += `
                <div class="leaderboard-entry ${rankClass}">
                    <div class="rank-info">
                        <span class="rank-number">${index + 1}</span>
                        ${medal}
                    </div>
                    <div class="user-info">
                        <div class="user-avatar">
                            <img src="images/avatar/${(index % 5) + 1}.jpg" alt="User" class="rounded-circle">
                        </div>
                        <div class="user-details">
                            <h6 class="user-name">${entry.username}</h6>
                            <p class="user-level">Level ${entry.level}</p>
                        </div>
                    </div>
                    <div class="performance-info">
                        <div class="portfolio-value">
                            <span class="currency">₹</span>
                            <span class="amount">${this.ui.formatCurrency(entry.portfolio_value || 0)}</span>
                        </div>
                        <div class="performance-change ${(entry.performance_change || 0) >= 0 ? 'positive' : 'negative'}">
                            ${(entry.performance_change || 0) >= 0 ? '+' : ''}${(entry.performance_change || 0).toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    updateWeeklyLeaderboard(data) {
        const container = document.getElementById('weekly-leaderboard');
        if (!container) return;

        if (!data.leaderboard || data.leaderboard.length === 0) {
            container.innerHTML = '<div class="text-center"><p>No weekly leaderboard data available</p></div>';
            return;
        }

        let html = '<div class="leaderboard-entries">';
        
        data.leaderboard.forEach((entry, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
            
            html += `
                <div class="leaderboard-entry ${rankClass}">
                    <div class="rank-info">
                        <span class="rank-number">${index + 1}</span>
                        ${medal}
                    </div>
                    <div class="user-info">
                        <div class="user-avatar">
                            <img src="images/avatar/${(index % 5) + 1}.jpg" alt="User" class="rounded-circle">
                        </div>
                        <div class="user-details">
                            <h6 class="user-name">${entry.username}</h6>
                            <p class="user-level">Level ${entry.level}</p>
                        </div>
                    </div>
                    <div class="performance-info">
                        <div class="weekly-performance">
                            <span class="currency">₹</span>
                            <span class="amount">${this.ui.formatCurrency(entry.weekly_gain || 0)}</span>
                        </div>
                        <div class="performance-change ${(entry.weekly_percentage || 0) >= 0 ? 'positive' : 'negative'}">
                            ${(entry.weekly_percentage || 0) >= 0 ? '+' : ''}${(entry.weekly_percentage || 0).toFixed(2)}%
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    updateLeaderboardStats(data) {
        const container = document.getElementById('leaderboard-stats');
        if (!container) return;

        const stats = data || {};
        
        html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <h4>${stats.total_users || 0}</h4>
                        <p>Total Users</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h4>₹${this.ui.formatCurrency(stats.average_portfolio || 0)}</h4>
                        <p>Average Portfolio</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <h4>${stats.top_performer || 'N/A'}</h4>
                        <p>Top Performer</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h4>₹${this.ui.formatCurrency(stats.highest_portfolio || 0)}</h4>
                        <p>Highest Portfolio</p>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    updateTotalUsers(count) {
        const element = document.getElementById('total-users');
        if (element) {
            element.textContent = count || 0;
        }
    }

    updateMyRank(data) {
        const element = document.getElementById('my-rank');
        if (element) {
            const rank = data.global_rank || data.rank || 'N/A';
            element.textContent = rank;
        }
    }

    showError(message) {
        this.ui.showError(message);
    }
}

// Initialize leaderboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Leaderboard page loaded, initializing...');
    new MotionFalconLeaderboard();
});

// Add some CSS for leaderboard styling
const leaderboardStyles = `
<style>
.leaderboard-entries {
    max-height: 400px;
    overflow-y: auto;
}

.leaderboard-entry {
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

.leaderboard-entry:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.leaderboard-entry.rank-1 {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #fff;
}

.leaderboard-entry.rank-2 {
    background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
    color: #fff;
}

.leaderboard-entry.rank-3 {
    background: linear-gradient(135deg, #CD7F32, #B8860B);
    color: #fff;
}

.rank-info {
    display: flex;
    align-items: center;
    margin-right: 15px;
    min-width: 50px;
}

.rank-number {
    font-size: 18px;
    font-weight: bold;
    margin-right: 5px;
}

.user-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.user-avatar {
    margin-right: 15px;
}

.user-avatar img {
    width: 40px;
    height: 40px;
    object-fit: cover;
}

.user-name {
    margin: 0;
    font-weight: 600;
    font-size: 14px;
}

.user-level {
    margin: 0;
    font-size: 12px;
    opacity: 0.7;
}

.performance-info {
    text-align: right;
    min-width: 120px;
}

.portfolio-value, .weekly-performance {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.performance-change {
    font-size: 12px;
    font-weight: 600;
}

.performance-change.positive {
    color: #00C851;
}

.performance-change.negative {
    color: #ff4444;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-icon {
    font-size: 24px;
    margin-right: 15px;
}

.stat-content h4 {
    margin: 0;
    font-weight: bold;
    color: #333;
}

.stat-content p {
    margin: 0;
    font-size: 12px;
    color: #666;
}

.leaderboard-stats {
    margin-bottom: 20px;
}

.stat-item {
    text-align: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 15px;
}

.stat-item h3 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.stat-item p {
    margin: 5px 0 0 0;
    font-size: 12px;
    color: #666;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', leaderboardStyles); 