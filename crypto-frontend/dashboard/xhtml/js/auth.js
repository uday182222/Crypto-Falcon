// MotionFalcon Authentication Integration
// Handles login, register, and password reset functionality

document.addEventListener('DOMContentLoaded', function() {
    // Only run auth logic on login page or if user is not authenticated
    const isLoginPage = window.location.pathname.includes('page-login.html');
    const isAuthenticated = MotionFalconUI.isAuthenticated();
    
    // If user is authenticated and we're on login page, redirect to dashboard
    if (isAuthenticated && isLoginPage) {
        MotionFalconUI.redirect('index-1.html');
        return;
    }
    
    // If user is not authenticated and we're not on login page, redirect to login
    if (!isAuthenticated && !isLoginPage) {
        MotionFalconUI.redirect('page-login.html');
        return;
    }
    
    // Only set up form handlers on login page
    if (isLoginPage) {
        // Login form handler
        const loginForm = document.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Register form handler
        const registerForm = document.querySelector('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }

        // Forgot password form handler
        const forgotPasswordForm = document.querySelector('#forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', handleForgotPassword);
        }
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Basic validation
    if (!email || !password) {
        MotionFalconUI.showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        MotionFalconUI.showError('Please enter a valid email address');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    
    try {
        MotionFalconUI.showLoading(submitButton);
        
        const response = await api.login(email, password);
        
        MotionFalconUI.showSuccess('Login successful! Redirecting...');
        
        // Store user info if available
        if (response.user) {
            localStorage.setItem('motionfalcon_user', JSON.stringify(response.user));
        }
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            MotionFalconUI.redirect('index-1.html');
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        MotionFalconUI.showError(error.message || 'Login failed. Please try again.');
        MotionFalconUI.hideLoading(submitButton, originalButtonText);
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const fullNameInput = form.querySelector('input[name="fullName"]');
    const usernameInput = form.querySelector('input[name="username"]');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const confirmPasswordInput = form.querySelector('input[name="confirmPassword"]');
    const termsCheckbox = form.querySelector('input[name="terms"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const fullName = fullNameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const termsAccepted = termsCheckbox.checked;
    
    // Basic validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
        MotionFalconUI.showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        MotionFalconUI.showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        MotionFalconUI.showError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        MotionFalconUI.showError('Passwords do not match');
        return;
    }
    
    if (!termsAccepted) {
        MotionFalconUI.showError('Please accept the terms of service');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    
    try {
        MotionFalconUI.showLoading(submitButton);
        
        const response = await api.register(username, email, password);
        
        MotionFalconUI.showSuccess('Registration successful! Welcome to MotionFalcon!');
        
        // Store user info if available
        if (response.user) {
            localStorage.setItem('motionfalcon_user', JSON.stringify(response.user));
        }
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            MotionFalconUI.redirect('index-1.html');
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        MotionFalconUI.showError(error.message || 'Registration failed. Please try again.');
        MotionFalconUI.hideLoading(submitButton, originalButtonText);
    }
}

// Handle forgot password form submission
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[name="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const email = emailInput.value.trim();
    
    // Basic validation
    if (!email) {
        MotionFalconUI.showError('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        MotionFalconUI.showError('Please enter a valid email address');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    
    try {
        MotionFalconUI.showLoading(submitButton);
        
        await api.forgotPassword(email);
        
        MotionFalconUI.showSuccess('Password reset instructions have been sent to your email');
        
        // Clear the form
        emailInput.value = '';
        
        // Switch back to login tab
        const loginTab = document.querySelector('#nav-personal-tab');
        if (loginTab) {
            loginTab.click();
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        MotionFalconUI.showError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
        MotionFalconUI.hideLoading(submitButton, originalButtonText);
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Logout function (can be called from anywhere)
function logout() {
    MotionFalconUI.logout();
}

// Check authentication status on page load
function checkAuth() {
    if (!MotionFalconUI.isAuthenticated()) {
        MotionFalconUI.redirect('page-login.html');
    }
}

// Get current user info
function getCurrentUser() {
    const userStr = localStorage.getItem('motionfalcon_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Update user info in localStorage
function updateUserInfo(userData) {
    localStorage.setItem('motionfalcon_user', JSON.stringify(userData));
}

// Export functions for use in other files
window.logout = logout;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.updateUserInfo = updateUserInfo; 