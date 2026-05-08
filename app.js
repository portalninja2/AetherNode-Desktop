/**
 * AetherNode Desktop - Haupt-Anwendung
 * Verwaltet UI, Navigation und App-Verwaltung
 */

class AetherNodeApp {
    constructor() {
        this.currentApp = null;
        this.iframe = null;
        this.appLoading = false;
        this.apps = [];
        this.windowManager = null;
        this.hotkeyManager = null;
        this.pwaManager = null;
        this.mode = 'desktop'; // 'desktop', 'grid', 'single'
        
        logDebug('AetherNodeApp initialisiert');
    }

    /**
     * Initialisiert die Anwendung
     */
    init() {
        logDebug('App wird initialisiert...');
        
        // Apps laden - neue Apps aus Config hinzufügen falls nötig
        this.refreshAppsFromConfig();
        this.apps = AppDataManager.getApps();
        logDebug('Apps geladen', this.apps);
        
        // Manager initialisieren
        this.initManagers();
        
        // Layout Mode setzen
        const layout = AppDataManager.getDesktopLayout();
        this.setMode(layout.mode || 'desktop');
        
        // UI Elemente rendern
        this.renderDesktop();
        this.renderTaskbar();
        
        // Event Listener
        this.setupEventListeners();
        
        logDebug('App initialisiert');
    }



    /**
     * Rendert das App Grid
     */
    renderAppGrid() {
        const appGrid = document.getElementById('appGrid');
        appGrid.innerHTML = '';

        this.apps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'app-icon';
            icon.dataset.appId = app.id;
            icon.innerHTML = `
                <div class="app-icon-symbol">${app.icon}</div>
                <div class="app-icon-name">${app.name}</div>
            `;
            icon.addEventListener('click', () => this.openApp(app));
            icon.addEventListener('dblclick', () => this.openAppInNewWindow(app));
            appGrid.appendChild(icon);
        });
    }

    /**
     * Manager initialisieren
     */
    initManagers() {
        // Window Manager
        this.windowManager = new WindowManager();
        window.windowManager = this.windowManager;
        
        // Hotkey Manager
        this.hotkeyManager = new HotkeyManager();
        this.hotkeyManager.loadCustomHotkeys();
        
        // PWA Manager
        this.pwaManager = new PWAManager();
        
        logDebug('Alle Manager initialisiert');
    }
    
    /**
     * Modus setzen (desktop, grid, single)
     */
    setMode(mode) {
        this.mode = mode;
        
        const desktopArea = document.getElementById('desktopArea');
        const windowsContainer = document.getElementById('windowsContainer');
        const appGrid = document.getElementById('appGrid');
        const appView = document.getElementById('appView');
        
        // Alle verstecken
        [desktopArea, windowsContainer, appGrid, appView].forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Je nach Modus anzeigen
        switch (mode) {
            case 'desktop':
                if (desktopArea) desktopArea.style.display = 'grid';
                if (windowsContainer) windowsContainer.style.display = 'block';
                break;
            case 'grid':
                if (appGrid) appGrid.style.display = 'grid';
                break;
            case 'single':
                if (appView) appView.style.display = 'flex';
                break;
        }
        
        // Layout speichern
        const layout = AppDataManager.getDesktopLayout();
        layout.mode = mode;
        AppDataManager.setDesktopLayout(layout);
    }

    /**
     * Öffnet eine App
     */
    openApp(app) {
        logDebug('Öffne App', app.id);
        
        if (this.mode === 'desktop') {
            // Multi-Window Mode: Neues Fenster erstellen
            this.windowManager.openApp(app);
        } else if (this.mode === 'single') {
            // Single Window Mode: App View rendern
            this.renderAppView(app);
            this.currentApp = app;
        } else if (this.mode === 'grid') {
            // Grid Mode: App extern öffnen
            this.openAppInNewWindow(app);
        }
        
        // Keine Sidebar mehr - Active States entfernt
        
        // Statistiken
        AppDataManager.recordAppUsage(app.id);
        AppDataManager.setLastApp(app.id);
    }

    /**
     * Rendert die App View mit Iframe
     */
    renderAppView(app) {
        const appView = document.getElementById('appView');
        
        appView.innerHTML = `
            <div class="app-frame-container">
                <div class="app-frame-header">
                    <span class="app-frame-title">${app.icon} ${app.name}</span>
                    <div class="app-frame-controls">
                        <button class="app-frame-btn reload" onclick="app.reloadCurrentApp()">
                            🔄 Neuladen
                        </button>
                        <button class="app-frame-btn external" onclick="app.openCurrentAppExternal()">
                            ↗ Extern
                        </button>
                        <button class="app-frame-btn close" onclick="app.closeCurrentApp()">
                            ✕ Schließen
                        </button>
                    </div>
                </div>
                <iframe 
                    src="${app.url}" 
                    title="${app.name}"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                    loading="lazy"
                ></iframe>
            </div>
        `;

        this.iframe = appView.querySelector('iframe');
        
        // Iframe Error Handling
        this.iframe.addEventListener('error', () => {
            logDebug('Iframe Fehler', app.id);
            this.showError(`Fehler beim Laden von ${app.name}`);
        });

        // Iframe Load Event
        this.iframe.addEventListener('load', () => {
            logDebug('Iframe geladen', app.id);
        });
    }

    /**
     * Öffnet die aktuelle App in neuem Fenster
     */
    openCurrentAppExternal() {
        if (this.currentApp) {
            window.open(this.currentApp.url, '_blank');
            logDebug('App in neuem Fenster geöffnet', this.currentApp.id);
        }
    }

    /**
     * Ladet die aktuelle App neu
     */
    reloadCurrentApp() {
        if (this.iframe) {
            this.iframe.src = this.iframe.src;
            logDebug('App neu geladen', this.currentApp.id);
        }
    }

    /**
     * Schließt die aktuelle App
     */
    closeCurrentApp() {
        const appView = document.getElementById('appView');
        appView.innerHTML = `
            <div class="app-empty-state">
                <h2>Wähle eine Anwendung</h2>
                <p>Klicke auf ein Symbol in der linken Leiste oder dem Raster, um eine Anwendung zu starten</p>
            </div>
        `;
        
        // Keine Sidebar mehr - nur App-Icons cleanup
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        
        this.currentApp = null;
        this.iframe = null;
    }

    /**
     * Öffnet eine App in neuem Fenster
     */
    openAppInNewWindow(app) {
        window.open(app.url, '_blank');
        logDebug('App in neuem Fenster geöffnet', app.id);
    }

    /**
     * Desktop Area rendern
     */
    renderDesktop() {
        if (this.windowManager) {
            this.windowManager.renderDesktopGroups();
        }
        this.renderQuickLaunch();
    }
    
    /**
     * Taskbar rendern
     */
    renderTaskbar() {
        this.updateClock();
        this.renderQuickLaunch();
        
        // Taskbar Event Listeners
        this.setupTaskbarEvents();
        
        // Clock Update
        setInterval(() => this.updateClock(), 1000);
    }
    
    /**
     * Clock Update
     */
    updateClock() {
        const timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay) {
            const now = new Date();
            timeDisplay.textContent = now.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    /**
     * Quick Launch rendern
     */
    renderQuickLaunch() {
        const quickLaunch = document.getElementById('quickLaunch');
        if (!quickLaunch) return;
        
        const quickAppIds = AppDataManager.getQuickLaunchApps();
        quickLaunch.innerHTML = '';
        
        quickAppIds.forEach(appId => {
            const app = this.apps.find(a => a.id === appId);
            if (app) {
                const btn = document.createElement('button');
                btn.className = 'tray-btn';
                btn.title = app.name;
                btn.innerHTML = `<span class="tray-icon">${app.icon}</span>`;
                btn.addEventListener('click', () => this.openApp(app));
                quickLaunch.appendChild(btn);
            }
        });
    }
    
    /**
     * Start-Menü rendern
     */
    renderStartMenu() {
        // System-Aktionen Event Listener
        this.setupStartMenuSystemActions();
        
        // App-Gruppen rendern
        const appGroups = document.getElementById('appGroups');
        if (appGroups) {
            const groups = AppDataManager.getAppGroups();
            appGroups.innerHTML = '';
            
            groups.forEach(group => {
                const groupBtn = document.createElement('button');
                groupBtn.className = 'start-menu-item group-item';
                groupBtn.innerHTML = `
                    <span class="item-icon" style="background: ${group.color}">${group.icon}</span>
                    <span class="item-name">${group.name}</span>
                    <span class="item-count">${group.apps.length}</span>
                `;
                groupBtn.addEventListener('click', () => {
                    this.openGroupApps(group);
                    document.getElementById('startMenu').classList.remove('show');
                });
                appGroups.appendChild(groupBtn);
            });
        }
        
        // Alle Apps rendern
        const allAppsStart = document.getElementById('allAppsStart');
        if (allAppsStart) {
            allAppsStart.innerHTML = '';
            
            this.apps.forEach(app => {
                const appBtn = document.createElement('button');
                appBtn.className = 'start-menu-item app-item';
                appBtn.innerHTML = `
                    <span class="item-icon">${app.icon}</span>
                    <span class="item-name">${app.name}</span>
                `;
                appBtn.addEventListener('click', () => {
                    this.openApp(app);
                    document.getElementById('startMenu').classList.remove('show');
                });
                allAppsStart.appendChild(appBtn);
            });
        }
    }
    
    /**
     * Start-Menü System-Aktionen Setup
     */
    setupStartMenuSystemActions() {
        // Einstellungen
        const settingsBtn = document.getElementById('settingsFromStart');
        if (settingsBtn) {
            settingsBtn.replaceWith(settingsBtn.cloneNode(true)); // Remove old listeners
            document.getElementById('settingsFromStart').addEventListener('click', () => {
                this.openSettings();
                document.getElementById('startMenu').classList.remove('show');
            });
        }
        
        // App-Gruppen Manager
        const groupBtn = document.getElementById('groupManagerFromStart');
        if (groupBtn) {
            groupBtn.replaceWith(groupBtn.cloneNode(true)); // Remove old listeners
            document.getElementById('groupManagerFromStart').addEventListener('click', () => {
                const modal = document.getElementById('groupManagerModal');
                if (modal) {
                    modal.classList.add('show');
                }
                document.getElementById('startMenu').classList.remove('show');
            });
        }
        
        // Hotkeys
        const hotkeysBtn = document.getElementById('hotkeysFromStart');
        if (hotkeysBtn) {
            hotkeysBtn.replaceWith(hotkeysBtn.cloneNode(true)); // Remove old listeners
            document.getElementById('hotkeysFromStart').addEventListener('click', () => {
                if (this.hotkeyManager) {
                    this.hotkeyManager.showHotkeyHelp();
                }
                document.getElementById('startMenu').classList.remove('show');
            });
        }
        
        // Export/Import
        const exportImportBtn = document.getElementById('exportImportFromStart');
        if (exportImportBtn) {
            exportImportBtn.replaceWith(exportImportBtn.cloneNode(true));
            document.getElementById('exportImportFromStart').addEventListener('click', () => {
                if (typeof openExportImport === 'function') {
                    openExportImport();
                } else {
                    // Fallback - Modal direkt öffnen
                    const modal = document.getElementById('exportImportModal');
                    if (modal) {
                        modal.classList.add('show');
                        // Export/Import Manager initialisieren
                        if (!window.exportImportManager) {
                            const { ExportImportManager } = window;
                            if (ExportImportManager) {
                                window.exportImportManager = new ExportImportManager();
                            }
                        }
                        if (window.exportImportManager) {
                            window.exportImportManager.updateBackupStats();
                        }
                    }
                }
                document.getElementById('startMenu').classList.remove('show');
            });
        }
    }
    
    /**
     * Gruppe öffnen (alle Apps der Gruppe)
     */
    openGroupApps(group) {
        group.apps.forEach((appId, index) => {
            const app = this.apps.find(a => a.id === appId);
            if (app) {
                // Staggered opening für bessere UX
                setTimeout(() => {
                    this.openApp(app);
                }, index * 300);
            }
        });
        
        if (group.apps.length > 0) {
            if (typeof Notifications !== 'undefined') {
                Notifications.success(`📁 ${group.name} geöffnet (${group.apps.length} Apps)`);
            } else {
                console.log(`📁 ${group.name} geöffnet (${group.apps.length} Apps)`);
            }
            if (typeof LocalAnalytics !== 'undefined') {
                LocalAnalytics.logEvent('group', 'open_all', group.id);
            }
        }
    }
    
    /**
     * Taskbar Events Setup
     */
    setupTaskbarEvents() {
        // Start Button
        const startBtn = document.getElementById('startBtn');
        const startMenu = document.getElementById('startMenu');
        
        if (startBtn && startMenu) {
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startMenu.classList.toggle('show');
                // Start-Menü mit Apps füllen wenn geöffnet
                if (startMenu.classList.contains('show')) {
                    this.renderStartMenu();
                }
            });
            
            // Close start menu when clicking outside
            document.addEventListener('click', () => {
                startMenu.classList.remove('show');
            });
            
            startMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Settings Button (nur in Taskbar, da Sidebar entfernt)
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        // Notification Button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.hotkeyManager.showHotkeyHelp();
            });
        }
    }

    /**
     * Event Listener Setup
     */
    setupEventListeners() {
        // Add App Form
        const form = document.getElementById('addAppForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewApp();
            });
        }
        
        // Create Group Form
        const groupForm = document.getElementById('createGroupForm');
        if (groupForm) {
            groupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewGroup();
            });
        }

        // Basic Keyboard Shortcuts (erweiterte sind im HotkeyManager)
        document.addEventListener('keydown', (e) => {
            // Ctrl+1/2/3 für Mode-Wechsel
            if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
                e.preventDefault();
                const modes = ['single', 'grid', 'desktop'];
                this.setMode(modes[parseInt(e.key) - 1]);
            }
        });
    }

    /**
     * Öffnet die Einstellungen Modal
     */
    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
        
        // Apps Liste in Einstellungen füllen
        this.renderAppsList();
        
        logDebug('Einstellungen geöffnet');
    }

    /**
     * Rendert die Apps Liste in den Einstellungen
     */
    renderAppsList() {
        const appsList = document.getElementById('appsList');
        appsList.innerHTML = '';

        this.apps.forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'app-item';
            appItem.innerHTML = `
                <div class="app-item-info">
                    <div class="app-item-icon">${app.icon}</div>
                    <div class="app-item-details">
                        <div class="app-item-name">${app.name}</div>
                        <div class="app-item-url">${app.url}</div>
                    </div>
                </div>
                <div class="app-item-actions">
                    <button class="btn-small" onclick="app.editApp('${app.id}')">Bearbeiten</button>
                    <button class="btn-small danger" onclick="app.deleteApp('${app.id}')">Löschen</button>
                </div>
            `;
            appsList.appendChild(appItem);
        });
    }

    /**
     * Neue Gruppe erstellen
     */
    createNewGroup() {
        const name = document.getElementById('groupName').value.trim();
        const icon = document.getElementById('groupIcon').value.trim();
        const color = document.getElementById('groupColor').value;
        
        if (!name) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Bitte gib einen Gruppennamen ein!');
            } else {
                alert('Bitte gib einen Gruppennamen ein!');
            }
            return;
        }
        
        const newGroup = {
            id: 'group_' + Date.now(),
            name: name,
            icon: icon || '📁',
            color: color,
            apps: []
        };
        
        AppDataManager.addAppGroup(newGroup);
        
        // UI aktualisieren
        this.renderDesktop();
        
        // Form leeren
        document.getElementById('createGroupForm').reset();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`✅ Gruppe "${name}" erstellt!`);
        } else {
            alert(`✅ Gruppe "${name}" erstellt!`);
        }
        logDebug('Neue Gruppe erstellt', newGroup);
    }

    /**
     * Fügt eine neue App hinzu
     */
    addNewApp() {
        const name = document.getElementById('appName').value.trim();
        const url = document.getElementById('appUrl').value.trim();
        const icon = document.getElementById('appIcon').value.trim();

        if (!name || !url) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Bitte fülle alle erforderlichen Felder aus!');
            } else {
                alert('Bitte fülle alle erforderlichen Felder aus!');
            }
            return;
        }

        // URL Validierung
        if (!Utils.isValidUrl(url)) {
            if (typeof Notifications !== 'undefined') {
                Notifications.error('Ungültige URL!');
            } else {
                alert('Ungültige URL!');
            }
            return;
        }

        const newApp = {
            id: 'app_' + Date.now(),
            name: name,
            url: url,
            icon: icon || '📦',
            category: 'custom',
            description: ''
        };

        AppDataManager.addApp(newApp);
        this.apps = AppDataManager.getApps();
        
        logDebug('Neue App hinzugefügt', newApp);
        
        // UI aktualisieren
        this.renderAppGrid();
        this.renderAppsList();
        this.renderDesktop();
        this.renderQuickLaunch();
        
        // Form leeren
        document.getElementById('addAppForm').reset();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`✅ "${name}" wurde erfolgreich hinzugefügt!`);
        } else {
            alert(`✅ "${name}" wurde erfolgreich hinzugefügt!`);
        }
    }

    /**
     * Löscht eine App
     */
    deleteApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (!app) return;

        if (confirm(`Möchtest du "${app.name}" wirklich löschen?`)) {
            AppDataManager.removeApp(appId);
            this.apps = AppDataManager.getApps();
            
            logDebug('App gelöscht', appId);
            
            // UI aktualisieren
            this.renderAppGrid();
            this.renderAppsList();
            
            // Wenn aktuelle App gelöscht wurde, schließen
            if (this.currentApp?.id === appId) {
                this.closeCurrentApp();
            }
        }
    }

    /**
     * Bearbeitet eine App
     */
    editApp(appId) {
        alert('App-Bearbeitung wird noch implementiert. Für jetzt: App löschen und neu hinzufügen.');
    }

    /**
     * Zeigt einen Fehler
     */
    showError(message) {
        const appView = document.getElementById('appView');
        appView.innerHTML = `
            <div class="app-empty-state">
                <h2>❌ Fehler</h2>
                <p>${message}</p>
                <button class="app-frame-btn" onclick="location.reload()">Seite neu laden</button>
            </div>
        `;
    }
}

// Globale App Instanz
let app;

// Starten wenn DOM bereit ist
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis alle Module geladen sind
    if (typeof WindowManager === 'undefined' || 
        typeof HotkeyManager === 'undefined' || 
        typeof PWAManager === 'undefined') {
        setTimeout(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }, 100);
        return;
    }
    
    app = new AetherNodeApp();
    window.app = app; // Global verfügbar machen
    app.init();
});

// Modal schließen
function closeModal(modalId = 'settingsModal') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Modal schließen wenn außerhalb geklickt wird
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Globale Funktionen für Inline Event Handler
window.closeModal = closeModal;
window.app = null; // Wird nach Initialisierung gesetzt

// Gruppen-Management Funktionen
window.openGroupManager = function() {
    if (window.app) {
        window.app.openGroupManager();
    }
};

window.closeAppAssignment = function() {
    const section = document.getElementById('appAssignmentSection');
    if (section) {
        section.style.display = 'none';
    }
};

window.deleteGroup = function(groupId) {
    if (window.app) {
        window.app.deleteGroup(groupId);
    }
};

window.editGroupApps = function(groupId) {
    if (window.app) {
        window.app.editGroupApps(groupId);
    }
};

window.toggleAppAssignment = function(appId, groupId) {
    if (window.app) {
        window.app.toggleAppAssignment(appId, groupId);
    }
};

// Apps aus Config refreshen
AetherNodeApp.prototype.refreshAppsFromConfig = function() {
    const existingApps = AppDataManager.getApps();
    const existingIds = existingApps.map(app => app.id);
    
    // Neue Apps aus DEFAULT_APPS hinzufügen
    if (typeof DEFAULT_APPS !== 'undefined') {
        DEFAULT_APPS.forEach(configApp => {
            if (!existingIds.includes(configApp.id)) {
                AppDataManager.addApp(configApp);
                console.log('✅ Neue App hinzugefügt:', configApp.name);
            }
        });
    }
};

// Erweiterte App-Klasse Methoden
AetherNodeApp.prototype.openGroupManager = function() {
    const modal = document.getElementById('groupManagerModal');
    if (modal) {
        modal.classList.add('show');
        this.renderGroupsList();
    }
};

AetherNodeApp.prototype.renderGroupsList = function() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    const groups = AppDataManager.getAppGroups();
    
    if (groups.length === 0) {
        container.innerHTML = `
            <div class="empty-groups">
                Noch keine Gruppen erstellt.
            </div>
        `;
        return;
    }
    
    container.innerHTML = groups.map(group => `
        <div class="group-item">
            <div class="group-item-icon" style="background: ${group.color}">
                ${group.icon}
            </div>
            <div class="group-item-info">
                <div class="group-item-name">${group.name}</div>
                <div class="group-item-count">${group.apps.length} Apps</div>
            </div>
            <div class="group-item-actions">
                <button class="group-action-btn apps" onclick="editGroupApps('${group.id}')" title="Apps verwalten">
                    📝
                </button>
                <button class="group-action-btn delete" onclick="deleteGroup('${group.id}')" title="Gruppe löschen">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
};

AetherNodeApp.prototype.deleteGroup = function(groupId) {
    const groups = AppDataManager.getAppGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    if (confirm(`Gruppe "${group.name}" wirklich löschen?\n\nDie Apps bleiben erhalten und werden auf dem Desktop angezeigt.`)) {
        AppDataManager.removeAppGroup(groupId);
        
        // UI aktualisieren
        this.renderGroupsList();
        this.renderDesktop();
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`✅ Gruppe "${group.name}" gelöscht!`);
        } else {
            alert(`✅ Gruppe "${group.name}" gelöscht!`);
        }
        
        logDebug('Gruppe gelöscht', groupId);
    }
};

AetherNodeApp.prototype.editGroupApps = function(groupId) {
    const groups = AppDataManager.getAppGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const section = document.getElementById('appAssignmentSection');
    const title = document.getElementById('assignmentTitle');
    const container = document.getElementById('availableApps');
    
    if (!section || !title || !container) return;
    
    // Titel setzen
    title.textContent = `Apps zu "${group.name}" hinzufügen/entfernen`;
    
    // Alle Apps anzeigen
    const allApps = this.apps;
    container.innerHTML = allApps.map(app => {
        const isAssigned = group.apps.includes(app.id);
        return `
            <div class="assignable-app ${isAssigned ? 'assigned' : ''}" onclick="toggleAppAssignment('${app.id}', '${groupId}')">
                <span class="assignable-app-icon">${app.icon}</span>
                <span class="assignable-app-name">${app.name}</span>
            </div>
        `;
    }).join('');
    
    // Section anzeigen
    section.style.display = 'block';
    section.dataset.currentGroup = groupId;
};

AetherNodeApp.prototype.toggleAppAssignment = function(appId, groupId) {
    const groups = AppDataManager.getAppGroups();
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const isAssigned = group.apps.includes(appId);
    
    if (isAssigned) {
        // App aus Gruppe entfernen
        AppDataManager.removeAppFromGroup(appId, groupId);
    } else {
        // App zu Gruppe hinzufügen
        AppDataManager.addAppToGroup(appId, groupId);
    }
    
    // UI aktualisieren
    this.editGroupApps(groupId); // Neu rendern
    this.renderGroupsList(); // App-Counts aktualisieren
    this.renderDesktop(); // Desktop aktualisieren
    
    const app = this.apps.find(a => a.id === appId);
    const action = isAssigned ? 'entfernt' : 'hinzugefügt';
    
    if (typeof Notifications !== 'undefined') {
        Notifications.success(`✅ ${app?.name || 'App'} ${action}!`);
    } else {
        console.log(`${app?.name || 'App'} ${action}`);
    }
};

// Gruppen-Liste beim Gruppe erstellen aktualisieren
const originalCreateNewGroup = AetherNodeApp.prototype.createNewGroup;
if (originalCreateNewGroup) {
    AetherNodeApp.prototype.createNewGroup = function() {
        const result = originalCreateNewGroup.call(this);
        // Nach dem Erstellen die Liste aktualisieren
        setTimeout(() => {
            this.renderGroupsList();
        }, 100);
        return result;
    };
}
