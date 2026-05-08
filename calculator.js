/**
 * AetherNode Desktop - Calculator Module
 * Integrierter Taschenrechner
 */

class Calculator {
    constructor() {
        this.display = null;
        this.history = null;
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.historyLog = [];
        
        this.setupCalculator();
    }
    
    /**
     * Calculator Setup
     */
    setupCalculator() {
        const container = document.getElementById('calcButtons');
        if (!container) return;
        
        this.display = document.getElementById('calcDisplay');
        this.history = document.getElementById('calcHistory');
        
        // Button Layout
        const buttons = [
            { text: 'C', class: 'clear', action: 'clear' },
            { text: '±', class: 'operator', action: 'negate' },
            { text: '%', class: 'operator', action: '%' },
            { text: '÷', class: 'operator', action: '/' },
            
            { text: '7', class: 'number', action: '7' },
            { text: '8', class: 'number', action: '8' },
            { text: '9', class: 'number', action: '9' },
            { text: '×', class: 'operator', action: '*' },
            
            { text: '4', class: 'number', action: '4' },
            { text: '5', class: 'number', action: '5' },
            { text: '6', class: 'number', action: '6' },
            { text: '−', class: 'operator', action: '-' },
            
            { text: '1', class: 'number', action: '1' },
            { text: '2', class: 'number', action: '2' },
            { text: '3', class: 'number', action: '3' },
            { text: '+', class: 'operator', action: '+' },
            
            { text: '0', class: 'number zero', action: '0' },
            { text: '.', class: 'number', action: '.' },
            { text: '=', class: 'equals', action: '=' }
        ];
        
        container.innerHTML = buttons.map(btn => {
            const classes = `calc-btn ${btn.class}`;
            return `<button class="${classes}" data-action="${btn.action}">${btn.text}</button>`;
        }).join('');
        
        // Event Listeners
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('calc-btn')) {
                const action = e.target.dataset.action;
                this.handleInput(action);
            }
        });
        
        // Keyboard Support
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('calculatorModal').classList.contains('show')) {
                this.handleKeyboard(e);
            }
        });
        
        logDebug('Calculator initialisiert');
    }
    
    /**
     * Input Handler
     */
    handleInput(action) {
        if (this.isNumber(action)) {
            this.inputNumber(action);
        } else if (action === '.') {
            this.inputDecimal();
        } else if (this.isOperator(action)) {
            this.inputOperator(action);
        } else if (action === '=') {
            this.calculate();
        } else if (action === 'clear') {
            this.clear();
        } else if (action === 'negate') {
            this.negate();
        }
        
        this.updateDisplay();
    }
    
    /**
     * Keyboard Handler
     */
    handleKeyboard(e) {
        e.preventDefault();
        
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.handleInput(key);
        } else if (key === '.') {
            this.handleInput('.');
        } else if (key === '+') {
            this.handleInput('+');
        } else if (key === '-') {
            this.handleInput('-');
        } else if (key === '*') {
            this.handleInput('*');
        } else if (key === '/') {
            this.handleInput('/');
        } else if (key === '%') {
            this.handleInput('%');
        } else if (key === 'Enter' || key === '=') {
            this.handleInput('=');
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.handleInput('clear');
        } else if (key === 'Backspace') {
            this.backspace();
        }
    }
    
    /**
     * Number Input
     */
    inputNumber(number) {
        if (this.waitingForOperand) {
            this.currentInput = number;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? number : this.currentInput + number;
        }
    }
    
    /**
     * Decimal Input
     */
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
    }
    
    /**
     * Operator Input
     */
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const result = this.performCalculation();
            
            this.currentInput = String(result);
            this.previousInput = result;
            
            this.addToHistory(`${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${inputValue} = ${result}`);
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
    }
    
    /**
     * Calculate
     */
    calculate() {
        if (this.operator && !this.waitingForOperand) {
            const inputValue = parseFloat(this.currentInput);
            const result = this.performCalculation();
            
            this.addToHistory(`${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${inputValue} = ${result}`);
            
            this.currentInput = String(result);
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
        }
    }
    
    /**
     * Perform Calculation
     */
    performCalculation() {
        const prev = this.previousInput;
        const current = parseFloat(this.currentInput);
        
        let result = 0;
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = current !== 0 ? prev / current : 0;
                break;
            case '%':
                result = prev % current;
                break;
        }
        
        // Runden auf 10 Dezimalstellen
        return Math.round(result * 10000000000) / 10000000000;
    }
    
    /**
     * Clear Calculator
     */
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
    }
    
    /**
     * Negate Number
     */
    negate() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.startsWith('-') 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
        }
    }
    
    /**
     * Backspace
     */
    backspace() {
        if (!this.waitingForOperand) {
            this.currentInput = this.currentInput.length > 1 
                ? this.currentInput.slice(0, -1) 
                : '0';
        }
    }
    
    /**
     * Update Display
     */
    updateDisplay() {
        if (this.display) {
            // Format number for display
            const displayValue = this.formatNumber(this.currentInput);
            this.display.value = displayValue;
        }
    }
    
    /**
     * Format Number for Display
     */
    formatNumber(value) {
        if (value === '0' || value === '') return '0';
        
        const number = parseFloat(value);
        if (isNaN(number)) return '0';
        
        // Format mit Tausender-Trennzeichen für große Zahlen
        if (Math.abs(number) >= 1000000) {
            return number.toExponential(6);
        }
        
        return number.toLocaleString('de-DE', {
            maximumFractionDigits: 10
        });
    }
    
    /**
     * Add to History
     */
    addToHistory(calculation) {
        this.historyLog.unshift(calculation);
        if (this.historyLog.length > 5) {
            this.historyLog.pop();
        }
        
        if (this.history) {
            this.history.textContent = this.historyLog[0] || '';
        }
        
        // Analytics
        if (typeof LocalAnalytics !== 'undefined') {
            LocalAnalytics.logEvent('calculator', 'calculation', calculation);
        }
    }
    
    /**
     * Helper Methods
     */
    isNumber(value) {
        return !isNaN(value) && value !== '.';
    }
    
    isOperator(value) {
        return ['+', '-', '*', '/', '%'].includes(value);
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '%': '%'
        };
        return symbols[op] || op;
    }
    
    /**
     * Reset Calculator
     */
    reset() {
        this.clear();
        this.historyLog = [];
        this.updateDisplay();
        if (this.history) {
            this.history.textContent = '';
        }
    }
}

// Global Calculator Instance
let calculatorInstance = null;

// Calculator Modal Functions
window.openCalculator = function() {
    const modal = document.getElementById('calculatorModal');
    if (modal) {
        modal.classList.add('show');
        
        // Initialize calculator if not already done
        if (!calculatorInstance) {
            calculatorInstance = new Calculator();
        }
        
        // Focus the calculator
        setTimeout(() => {
            const display = document.getElementById('calcDisplay');
            if (display) display.focus();
        }, 100);
        
        if (typeof LocalAnalytics !== 'undefined') {
            LocalAnalytics.logEvent('tool', 'open', 'calculator');
        }
    }
};

window.closeCalculator = function() {
    const modal = document.getElementById('calculatorModal');
    if (modal) {
        modal.classList.remove('show');
    }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calculator };
}

logDebug('Calculator module geladen');