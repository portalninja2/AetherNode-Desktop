/**
 * AetherNode Desktop - Hotkeys & Keyboard Shortcuts
 * Erweiterte Tastatursteuerung
 */

class HotkeyManager {
    constructor() {
        this.hotkeys = new Map();
        this.pressedKeys = new Set();
        this.sequences = new Map();
        
        this.setupDefaultHotkeys();
        this.setupEventListeners();
        
        logDebug('HotkeyManager initialisiert');
    }

    /**
     * Standard Hotkeys definieren
     */
    setupDefaultHotkeys() {
        // System Hotkeys
        this.registerHotkey('Escape', () => {
            if (window.app && window.app.activeWindow) {
                window.windowManager.minimizeWindow(window.app.activeWindow);
            } else {
                this.closeTopModal();
            }
        }, 'App minimieren oder Modal schließen');

        this.registerHotkey('F5', () => {
            this.reloadActiveWindow();
        }, 'Aktives Fenster neu laden');

        this.registerHotkey('Alt+F4', () => {
            if (window.windowManager.activeWindow) {
                window.windowManager.closeWindow(window.windowManager.activeWindow);
            }
        }, 'Aktives Fenster schließen');

        this.registerHotkey('Ctrl+Shift+S', () => {
            this.openSettings();
        }, 'Einstellungen öffnen');

        this.registerHotkey('Ctrl+Shift+H', () => {
            this.showHotkeyHelp();
        }, 'Hotkey-Hilfe anzeigen');

        // Window Management
        this.registerHotkey('Alt+Tab', () => {
            this.cycleThroughWindows();
        }, 'Zwischen Fenstern wechseln');

        this.registerHotkey('Ctrl+Alt+M', () => {
            window.windowManager.minimizeAllWindows();
        }, 'Alle Fenster minimieren');

        this.registerHotkey('F11', () => {
            this.toggleFullscreen();
        }, 'Vollbild umschalten');

        // App Shortcuts (Alt+1 bis Alt+9)
        for (let i = 1; i <= 9; i++) {
            this.registerHotkey(`Alt+${i}`, () => {
                this.openAppByIndex(i - 1);
            }, `App ${i} öffnen`);
        }

        // Quick Actions
        this.registerHotkey('Ctrl+N', () => {
            this.openNewAppDialog();
        }, 'Neue App hinzufügen');

        this.registerHotkey('Ctrl+O', () => {
            this.openStartMenu();
        }, 'Start-Menü öffnen');

        this.registerHotkey('Ctrl+Shift+T', () => {
            this.openTaskManager();
        }, 'Task Manager öffnen');

        // Search
        this.registerHotkey('Ctrl+F', () => {
            this.openAppSearch();
        }, 'App-Suche öffnen');

        // Desktop Navigation
        this.registerHotkey('Ctrl+1', () => {
            this.switchToDesktop(1);
        }, 'Desktop 1');

        this.registerHotkey('Ctrl+2', () => {
            this.switchToDesktop(2);
        }, 'Desktop 2');

        // Spezielle Sequenzen
        this.registerSequence(['Ctrl+K', 'Ctrl+C'], () => {
            this.copyActiveWindowUrl();
        }, 'URL des aktiven Fensters kopieren');
    }

    /**
     * Event Listeners Setup
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });

        // Prevent default actions for registered hotkeys
        document.addEventListener('keydown', (e) => {
            const combo = this.getKeyCombo(e);
            if (this.hotkeys.has(combo)) {
                e.preventDefault();
            }
        });
    }

    /**
     * Hotkey registrieren
     */
    registerHotkey(combo, callback, description = '') {
        this.hotkeys.set(combo, {
            callback: callback,
            description: description
        });
        logDebug(`Hotkey registriert: ${combo}`);
    }

    /**
     * Hotkey-Sequenz registrieren (z.B. Ctrl+K, dann Ctrl+C)
     */
    registerSequence(sequence, callback, description = '') {
        const key = sequence.join(' → ');
        this.sequences.set(key, {
            sequence: sequence,
            callback: callback,
            description: description,
            currentStep: 0,
            timeout: null
        });
        logDebug(`Sequence registriert: ${key}`);
    }

    /**
     * Key Down Handler
     */
    handleKeyDown(e) {
        const key = this.getKeyString(e);
        this.pressedKeys.add(key);
        
        const combo = this.getKeyCombo(e);
        
        // Check sequences first
        if (this.checkSequences(combo)) {
            e.preventDefault();
            return;
        }
        
        // Check regular hotkeys
        const hotkey = this.hotkeys.get(combo);
        if (hotkey) {
            e.preventDefault();
            hotkey.callback();
            LocalAnalytics.logEvent('hotkey', 'trigger', combo);
            logDebug(`Hotkey ausgelöst: ${combo}`);
        }
    }

    /**
     * Key Up Handler
     */
    handleKeyUp(e) {
        const key = this.getKeyString(e);
        this.pressedKeys.delete(key);
    }

    /**
     * Key-Kombination aus Event extrahieren
     */
    getKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        
        const key = this.getKeyString(e);
        if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    /**
     * Key-String aus Event
     */
    getKeyString(e) {
        // Special keys mapping
        const keyMap = {
            ' ': 'Space',
            'ArrowUp': 'Up',
            'ArrowDown': 'Down',
            'ArrowLeft': 'Left',
            'ArrowRight': 'Right',
            'Enter': 'Enter',
            'Escape': 'Escape',
            'Backspace': 'Backspace',
            'Delete': 'Delete',
            'Tab': 'Tab'
        };
        
        return keyMap[e.key] || e.key;
    }

    /**
     * Sequenzen prüfen
     */
    checkSequences(combo) {
        let sequenceTriggered = false;
        
        this.sequences.forEach((seq, key) => {
            if (seq.sequence[seq.currentStep] === combo) {
                seq.currentStep++;
                
                // Clear timeout
                if (seq.timeout) {
                    clearTimeout(seq.timeout);
                }
                
                if (seq.currentStep === seq.sequence.length) {
                    // Sequence completed
                    seq.callback();
                    seq.currentStep = 0;
                    sequenceTriggered = true;
                    LocalAnalytics.logEvent('sequence', 'complete', key);
                } else {
                    // Set timeout for next key
                    seq.timeout = setTimeout(() => {
                        seq.currentStep = 0;
                    }, 2000);
                }
            } else if (seq.currentStep > 0) {
                // Reset if wrong key
                seq.currentStep = 0;
                if (seq.timeout) {
                    clearTimeout(seq.timeout);
                }
            }
        });
        
        return sequenceTriggered;
    }

    /**
     * Hotkey Actions
     */
    reloadActiveWindow() {
        const activeWindowId = window.windowManager?.activeWindow;
        if (activeWindowId) {
            const windowEl = document.getElementById(activeWindowId);
            const iframe = windowEl?.querySelector('iframe');
            if (iframe) {
                iframe.src = iframe.src;
                Notifications.info('🔄 Fenster wird neu geladen...');
            }
        }
    }

    closeTopModal() {
        const modals = document.querySelectorAll('.modal.show');
        if (modals.length > 0) {
            const topModal = modals[modals.length - 1];
            topModal.classList.remove('show');
        }
    }

    openSettings() {
        if (window.app) {
            window.app.openSettings();
        }
    }

    showHotkeyHelp() {
        const modal = document.getElementById('hotkeysModal');
        if (modal) {
            modal.classList.add('show');
            this.renderHotkeyList();
        }
    }

    cycleThroughWindows() {
        if (!window.windowManager) return;
        
        const windows = Array.from(window.windowManager.windows.keys());
        if (windows.length === 0) return;
        
        const currentIndex = windows.indexOf(window.windowManager.activeWindow);
        const nextIndex = (currentIndex + 1) % windows.length;
        
        window.windowManager.focusWindow(windows[nextIndex]);
        Notifications.info(`🪟 Wechsel zu: ${window.windowManager.windows.get(windows[nextIndex]).title}`);
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

    openAppByIndex(index) {
        const apps = AppDataManager.getApps();
        if (apps[index]) {
            window.windowManager?.openApp(apps[index]);
        }
    }

    openNewAppDialog() {
        if (window.app) {
            window.app.openSettings();
            // Focus auf App hinzufügen Form
            setTimeout(() => {
                const nameInput = document.getElementById('appName');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    }

    openStartMenu() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.classList.toggle('show');
        }
    }

    openTaskManager() {
        // Task Manager UI anzeigen
        this.showTaskManager();
    }

    openAppSearch() {
        // App-Suche anzeigen
        const searchInput = document.getElementById('appSearch');
        if (searchInput) {
            searchInput.focus();
        } else {
            // Create temporary search overlay
            this.createSearchOverlay();
        }
    }

    switchToDesktop(desktopNumber) {
        // Virtual Desktop functionality
        Notifications.info(`🖥️ Desktop ${desktopNumber} (coming soon)`);
    }

    copyActiveWindowUrl() {
        const activeWindowId = window.windowManager?.activeWindow;
        if (activeWindowId) {
            const windowData = window.windowManager.windows.get(activeWindowId);
            if (windowData) {
                Utils.copyToClipboard(windowData.app.url);
                Notifications.success('📋 URL kopiert!');
            }
        }
    }

    /**
     * Hotkey Liste rendern
     */
    renderHotkeyList() {
        const container = document.getElementById('hotkeysList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Kategorien
        const categories = {
            'System': [],
            'Fenster': [],
            'Apps': [],
            'Navigation': []
        };
        
        this.hotkeys.forEach((hotkey, combo) => {
            let category = 'System';
            
            if (combo.includes('Alt+Tab') || combo.includes('F11') || combo.includes('Alt+F4')) {
                category = 'Fenster';
            } else if (combo.match(/Alt+[1-9]/)) {
                category = 'Apps';
            } else if (combo.includes('Ctrl+1') || combo.includes('Ctrl+2') || combo.includes('Ctrl+F')) {
                category = 'Navigation';
            }
            
            categories[category].push({ combo, description: hotkey.description });
        });
        
        // Sequenzen hinzufügen
        this.sequences.forEach((seq, key) => {
            categories['System'].push({ 
                combo: key, 
                description: seq.description 
            });
        });
        
        Object.entries(categories).forEach(([categoryName, hotkeys]) => {
            if (hotkeys.length === 0) return;
            
            const categoryEl = document.createElement('div');
            categoryEl.className = 'hotkey-category';
            categoryEl.innerHTML = `
                <h3>${categoryName}</h3>
                <div class="hotkey-items">
                    ${hotkeys.map(({ combo, description }) => `
                        <div class="hotkey-item">
                            <div class="hotkey-combo">${this.formatHotkeyDisplay(combo)}</div>
                            <div class="hotkey-description">${description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(categoryEl);
        });
    }

    /**
     * Hotkey Display formatieren
     */
    formatHotkeyDisplay(combo) {
        return combo.split('+').map(key => 
            `<kbd>${key}</kbd>`
        ).join(' + ').replace(' → ', ' <span class="sequence-arrow">→</span> ');
    }

    /**
     * Task Manager anzeigen
     */
    showTaskManager() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'taskManagerModal';
        
        const windows = Array.from(window.windowManager?.windows.values() || []);
        
        modal.innerHTML = `
            <div class="modal-content task-manager">
                <div class="modal-header">
                    <h2>📊 Task Manager</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-list">
                        <div class="task-header">
                            <span>App</span>
                            <span>Status</span>
                            <span>Aktionen</span>
                        </div>
                        ${windows.map(win => `
                            <div class="task-item">
                                <div class="task-info">
                                    <span class="task-icon">${win.app.icon}</span>
                                    <span class="task-name">${win.title}</span>
                                </div>
                                <div class="task-status">
                                    ${win.minimized ? '📉 Minimiert' : win.maximized ? '📈 Maximiert' : '🪟 Normal'}
                                </div>
                                <div class="task-actions">
                                    <button onclick="window.windowManager.focusWindow('${win.id}')" class="btn-small">Fokus</button>
                                    <button onclick="window.windowManager.closeWindow('${win.id}')" class="btn-small danger">Schließen</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Search Overlay erstellen
     */
    createSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-container">
                <input type="text" id="globalSearch" placeholder="🔍 Apps durchsuchen..." autofocus>
                <div id="searchResults"></div>
            </div>
        `;
        
        const searchInput = overlay.querySelector('#globalSearch');
        const resultsContainer = overlay.querySelector('#searchResults');
        
        searchInput.addEventListener('input', Utils.debounce((e) => {
            this.performSearch(e.target.value, resultsContainer);
        }, 300));
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
            } else if (e.key === 'Enter') {
                const firstResult = resultsContainer.querySelector('.search-result');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        document.body.appendChild(overlay);
    }

    /**
     * App-Suche durchführen
     */
    performSearch(query, container) {
        if (!query.trim()) {
            container.innerHTML = '';
            return;
        }
        
        const apps = AppDataManager.getApps();
        const results = apps.filter(app =>
            app.name.toLowerCase().includes(query.toLowerCase()) ||
            app.description?.toLowerCase().includes(query.toLowerCase()) ||
            app.category.toLowerCase().includes(query.toLowerCase())
        );
        
        container.innerHTML = results.map(app => `
            <div class="search-result" data-app-id="${app.id}">
                <span class="result-icon">${app.icon}</span>
                <div class="result-info">
                    <div class="result-name">${app.name}</div>
                    <div class="result-description">${app.description || app.category}</div>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const appId = result.dataset.appId;
                const app = apps.find(a => a.id === appId);
                if (app) {
                    window.windowManager?.openApp(app);
                    container.closest('.search-overlay').remove();
                }
            });
        });
    }

    /**
     * Custom Hotkey definieren
     */
    setCustomHotkey(combo, appId, description) {
        this.registerHotkey(combo, () => {
            const app = AppDataManager.getApps().find(a => a.id === appId);
            if (app) {
                window.windowManager?.openApp(app);
            }
        }, description);
        
        // Speichern
        const customHotkeys = AppDataManager.getCustomHotkeys() || {};
        customHotkeys[combo] = { appId, description };
        AppDataManager.setCustomHotkeys(customHotkeys);
    }

    /**
     * Custom Hotkeys laden
     */
    loadCustomHotkeys() {
        const customHotkeys = AppDataManager.getCustomHotkeys() || {};
        Object.entries(customHotkeys).forEach(([combo, data]) => {
            this.setCustomHotkey(combo, data.appId, data.description);
        });
    }
}

// Global verfügbar machen
window.HotkeyManager = HotkeyManager;

logDebug('HotkeyManager Modul geladen');