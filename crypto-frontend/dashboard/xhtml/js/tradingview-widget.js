// TradingView Widget Integration
// Handles the TradingView chart widget with symbol and timeframe controls

class TradingViewWidget {
    constructor() {
        this.widget = null;
        this.currentSymbol = 'BTCUSD';
        this.currentTimeframe = '1D';
        this.init();
    }

    init() {
        // Initialize the widget when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createWidget());
        } else {
            this.createWidget();
        }

        // Set up event listeners for controls
        this.setupControls();
    }

    createWidget() {
        const container = document.getElementById('tradingview-chart');
        if (!container) {
            console.error('TradingView chart container not found');
            return;
        }

        // Clear existing widget
        if (this.widget) {
            container.innerHTML = '';
        }

        // Create new TradingView widget
        this.widget = new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": this.currentSymbol,
            "interval": this.currentTimeframe,
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": "tradingview-chart",
            "studies": [
                "RSI@tv-basicstudies",
                "MACD@tv-basicstudies"
            ],
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650",
            "hide_side_toolbar": false,
            "hide_legend": false,
            "save_image": false,
            "backgroundColor": "rgba(255, 255, 255, 1)",
            "gridColor": "rgba(240, 243, 250, 0.5)",
            "fontColor": "rgba(33, 56, 77, 1)",
            "fontSize": "12",
            "borderColor": "rgba(197, 203, 206, 1)",
            "borderSize": 1,
            "watermark": {
                "color": "rgba(0, 0, 0, 0.1)",
                "fontSize": 24,
                "text": "MotionFalcon",
                "fontFamily": "Arial"
            }
        });

        console.log('TradingView widget created with symbol:', this.currentSymbol, 'timeframe:', this.currentTimeframe);
    }

    setupControls() {
        // Symbol selector
        const symbolSelect = document.getElementById('chart-symbol');
        if (symbolSelect) {
            symbolSelect.addEventListener('change', (e) => {
                this.currentSymbol = e.target.value;
                this.updateWidget();
            });
        }

        // Timeframe selector
        const timeframeSelect = document.getElementById('chart-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.currentTimeframe = e.target.value;
                this.updateWidget();
            });
        }
    }

    updateWidget() {
        if (this.widget) {
            // Update the widget with new symbol and timeframe
            this.widget.setSymbol(this.currentSymbol, this.currentTimeframe);
            console.log('TradingView widget updated:', this.currentSymbol, this.currentTimeframe);
        }
    }

    // Method to change symbol programmatically
    changeSymbol(symbol) {
        this.currentSymbol = symbol;
        if (this.widget) {
            this.widget.setSymbol(symbol, this.currentTimeframe);
        }
        
        // Update the select element
        const symbolSelect = document.getElementById('chart-symbol');
        if (symbolSelect) {
            symbolSelect.value = symbol;
        }
    }

    // Method to change timeframe programmatically
    changeTimeframe(timeframe) {
        this.currentTimeframe = timeframe;
        if (this.widget) {
            this.widget.setSymbol(this.currentSymbol, timeframe);
        }
        
        // Update the select element
        const timeframeSelect = document.getElementById('chart-timeframe');
        if (timeframeSelect) {
            timeframeSelect.value = timeframe;
        }
    }

    // Method to get current symbol
    getCurrentSymbol() {
        return this.currentSymbol;
    }

    // Method to get current timeframe
    getCurrentTimeframe() {
        return this.currentTimeframe;
    }

    // Method to refresh the widget
    refresh() {
        this.createWidget();
    }
}

// Initialize TradingView widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for TradingView script to load
    setTimeout(() => {
        if (typeof TradingView !== 'undefined') {
            window.tradingViewWidget = new TradingViewWidget();
        } else {
            console.error('TradingView script not loaded');
        }
    }, 1000);
});

// Export for global access
window.TradingViewWidget = TradingViewWidget; 