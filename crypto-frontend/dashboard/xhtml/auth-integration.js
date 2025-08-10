// MotionFalcon Authentication Integration
// Handles login, registration, and session management

class MotionFalconAuth {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already authenticated
        if (api.isAuthenticated()) {
            this.redirectToDashboard();
            return;
        }

        // Set up login form
        this.setupLoginForm();
        
        // Set up registration form
        this.setupRegistrationForm();
        
        // Set up forgot password form
        this.setupForgotPasswordForm();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm.querySelector('[name="email"]').value;
            const password = loginForm.querySelector('[name="password"]').value;
            
            if (!email || !password) {
                this.showError('Please fill in all fields');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                api.showLoading(submitBtn);
                
                const result = await api.login(email, password);
                
                this.showSuccess('Login successful! Redirecting...');
                
                // Store user info
                localStorage.setItem('motionfalcon_user', JSON.stringify(result.user));
                
                // Redirect to dashboard
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
                
            } catch (error) {
                this.showError(`Login failed: ${error.message}`);
            } finally {
                api.hideLoading(submitBtn, originalText);
            }
        });
    }

    setupRegistrationForm() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = registerForm.querySelector('[name="username"]').value;
            const email = registerForm.querySelector('[name="email"]').value;
            const password = registerForm.querySelector('[name="password"]').value;
            const confirmPassword = registerForm.querySelector('[name="confirm_password"]').value;
            
            if (!username || !email || !password || !confirmPassword) {
                this.showError('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('Passwords do not match');
                return;
            }

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                api.showLoading(submitBtn);
                
                const result = await api.register(username, email, password);
                
                this.showSuccess('Registration successful! Please log in.');
                
                // Switch to login form
                this.showLoginForm();
                
            } catch (error) {
                this.showError(`Registration failed: ${error.message}`);
            } finally {
                api.hideLoading(submitBtn, originalText);
            }
        });
    }

    setupForgotPasswordForm() {
        const forgotForm = document.getElementById('forgot-form');
        if (!forgotForm) return;

        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = forgotForm.querySelector('[name="email"]').value;
            
            if (!email) {
                this.showError('Please enter your email address');
                return;
            }

            const submitBtn = forgotForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                api.showLoading(submitBtn);
                
                await api.forgotPassword(email);
                
                this.showSuccess('Password reset email sent! Please check your inbox.');
                
            } catch (error) {
                this.showError(`Password reset failed: ${error.message}`);
            } finally {
                api.hideLoading(submitBtn, originalText);
            }
        });
    }

    showLoginForm() {
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const forgotSection = document.getElementById('forgot-section');
        
        if (loginSection) loginSection.style.display = 'block';
        if (registerSection) registerSection.style.display = 'none';
        if (forgotSection) forgotSection.style.display = 'none';
    }

    showRegisterForm() {
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const forgotSection = document.getElementById('forgot-section');
        
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'block';
        if (forgotSection) forgotSection.style.display = 'none';
    }

    showForgotForm() {
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const forgotSection = document.getElementById('forgot-section');
        
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'none';
        if (forgotSection) forgotSection.style.display = 'block';
    }

    redirectToDashboard() {
        window.location.href = 'enhanced-dashboard.html';
    }

    showSuccess(message) {
        api.showSuccess(message);
    }

    showError(message) {
        api.showError(message);
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.auth = new MotionFalconAuth();
});

// Global functions for form switching
function showLoginForm() {
    if (window.auth) window.auth.showLoginForm();
}

function showRegisterForm() {
    if (window.auth) window.auth.showRegisterForm();
}

function showForgotForm() {
    if (window.auth) window.auth.showForgotForm();
} 