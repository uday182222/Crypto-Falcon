// MotionFalcon Achievements Integration
class MotionFalconAchievements {
    constructor() {
        this.api = new MotionFalconAPI();
        this.ui = new MotionFalconUI();
        this.init();
    }

    async init() {
        console.log('Initializing achievements...');
        
        // Check authentication
        if (!this.api.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'page-login.html';
            return;
        }

        // Load all achievements data
        await this.loadUserAchievements();
        await this.loadAchievementStats();
        await this.updateLoginStreak();
    }

    async loadUserAchievements() {
        try {
            console.log('Loading user achievements...');
            const response = await this.api.get('/achievements/user');
            
            if (response.success) {
                this.updateUserAchievements(response.data);
                this.updateAchievementCounts(response.data);
            } else {
                console.error('Failed to load user achievements:', response.message);
                this.showError('Failed to load achievements');
            }
        } catch (error) {
            console.error('Error loading user achievements:', error);
            this.showError('Error loading achievements');
        }
    }

    async loadAchievementStats() {
        try {
            console.log('Loading achievement stats...');
            const response = await this.api.get('/achievements/stats');
            
            if (response.success) {
                this.updateAchievementStats(response.data);
            } else {
                console.error('Failed to load achievement stats:', response.message);
                this.showError('Failed to load achievement stats');
            }
        } catch (error) {
            console.error('Error loading achievement stats:', error);
            this.showError('Error loading achievement stats');
        }
    }

    async updateLoginStreak() {
        try {
            console.log('Updating login streak...');
            const response = await this.api.post('/achievements/login-streak');
            
            if (response.success) {
                this.updateLoginStreakDisplay(response.data);
            } else {
                console.error('Failed to update login streak:', response.message);
            }
        } catch (error) {
            console.error('Error updating login streak:', error);
        }
    }

    updateUserAchievements(data) {
        const container = document.getElementById('user-achievements');
        if (!container) return;

        if (!data.achievements || data.achievements.length === 0) {
            container.innerHTML = '<div class="text-center"><p>No achievements available</p></div>';
            return;
        }

        let html = '<div class="achievements-grid-container">';
        
        data.achievements.forEach((achievement, index) => {
            const isCompleted = achievement.is_completed;
            const progress = achievement.current_progress || 0;
            const requirement = achievement.requirement_value || 1;
            const progressPercent = Math.min((progress / requirement) * 100, 100);
            
            html += `
                <div class="achievement-card ${isCompleted ? 'completed' : 'in-progress'}">
                    <div class="achievement-icon">
                        ${achievement.icon || '🏆'}
                    </div>
                    <div class="achievement-content">
                        <h6 class="achievement-name">${achievement.name}</h6>
                        <p class="achievement-description">${achievement.description}</p>
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${progress}/${requirement}</span>
                        </div>
                        ${isCompleted ? `
                            <div class="achievement-reward">
                                <span class="reward-coins">+${achievement.reward_coins || 0} coins</span>
                                ${achievement.reward_title ? `<span class="reward-title">${achievement.reward_title}</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div class="achievement-status">
                        ${isCompleted ? '✅' : '⏳'}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    updateAchievementCounts(data) {
        const completedElement = document.getElementById('completed-achievements');
        const totalElement = document.getElementById('total-achievements');
        
        if (completedElement && totalElement) {
            const completed = data.achievements ? data.achievements.filter(a => a.is_completed).length : 0;
            const total = data.achievements ? data.achievements.length : 0;
            
            completedElement.textContent = completed;
            totalElement.textContent = total;
        }
    }

    updateAchievementStats(data) {
        const container = document.getElementById('achievement-stats');
        if (!container) return;

        const stats = data || {};
        
        html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <h4>${stats.total_achievements || 0}</h4>
                        <p>Total Achievements</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <h4>${stats.completed_achievements || 0}</h4>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h4>${stats.total_rewards || 0}</h4>
                        <p>Total Rewards</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h4>${stats.completion_rate || 0}%</h4>
                        <p>Completion Rate</p>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    updateLoginStreakDisplay(data) {
        const element = document.getElementById('login-streak');
        if (element) {
            const streak = data.current_streak || 0;
            element.textContent = streak;
        }
    }

    showError(message) {
        this.ui.showError(message);
    }
}

// Initialize achievements when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Achievements page loaded, initializing...');
    new MotionFalconAchievements();
});

// Add some CSS for achievements styling
const achievementStyles = `
<style>
.achievements-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.achievement-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.achievement-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.achievement-card.completed {
    background: linear-gradient(135deg, #00C851, #007E33);
    color: #fff;
}

.achievement-card.completed::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    animation: shine 2s infinite;
}

@keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.achievement-icon {
    font-size: 32px;
    margin-right: 20px;
    min-width: 50px;
    text-align: center;
}

.achievement-content {
    flex: 1;
}

.achievement-name {
    margin: 0 0 8px 0;
    font-weight: 600;
    font-size: 16px;
}

.achievement-description {
    margin: 0 0 15px 0;
    font-size: 14px;
    opacity: 0.8;
    line-height: 1.4;
}

.achievement-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(0,0,0,0.1);
    border-radius: 4px;
    overflow: hidden;
}

.achievement-card.completed .progress-bar {
    background: rgba(255,255,255,0.2);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00C851, #007E33);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.achievement-card.completed .progress-fill {
    background: rgba(255,255,255,0.8);
}

.progress-text {
    font-size: 12px;
    font-weight: 600;
    min-width: 60px;
    text-align: right;
}

.achievement-reward {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.reward-coins {
    background: rgba(255,255,255,0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.reward-title {
    background: rgba(255,255,255,0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.achievement-status {
    font-size: 24px;
    margin-left: 15px;
}

.achievements-stats {
    margin-bottom: 30px;
}

.stat-item {
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 20px;
}

.stat-item h3 {
    margin: 0;
    font-size: 28px;
    font-weight: bold;
    color: #333;
}

.stat-item p {
    margin: 5px 0 0 0;
    font-size: 14px;
    color: #666;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.stat-card {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-icon {
    font-size: 20px;
    margin-right: 12px;
}

.stat-content h4 {
    margin: 0;
    font-weight: bold;
    color: #333;
    font-size: 18px;
}

.stat-content p {
    margin: 0;
    font-size: 12px;
    color: #666;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .achievements-grid-container {
        grid-template-columns: 1fr;
    }
    
    .achievement-card {
        flex-direction: column;
        text-align: center;
    }
    
    .achievement-icon {
        margin-right: 0;
        margin-bottom: 15px;
    }
    
    .achievement-status {
        margin-left: 0;
        margin-top: 15px;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', achievementStyles); 