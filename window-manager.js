/**
 * AetherNode Desktop - Window Manager
 * Multi-Window Support & Desktop Management
 */

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.nextWindowId = 1;
        this.activeWindow = null;
        this.windowZ = 100;
        this.gridSize = 20; // Snap-to-grid
        
        this.setupWindowContainer();
        this.setupDesktopGroups();
        
        logDebug('WindowManager initialisiert');
    }

    /**
     * Window Container Setup
     */
    setupWindowContainer() {
        const container = document.getElementById('windowsContainer');
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target === container) {
                    this.minimizeAllWindows();
                }
            });
        }
    }

    /**
     * Desktop Gruppen Setup
     */
    setupDesktopGroups() {
        this.renderDesktopGroups();
    }

    /**
     * Neues Fenster erstellen
     */
    createWindow(app, options = {}) {
        const windowId = 'window_' + this.nextWindowId++;
        
        const windowData = {
            id: windowId,
            app: app,
            title: app.name,
            x: options.x || this.getNextWindowPosition().x,
            y: options.y || this.getNextWindowPosition().y,
            width: options.width || 800,
            height: options.height || 600,
            minimized: false,
            maximized: false,
            focused: true,
            zIndex: ++this.windowZ
        };

        this.windows.set(windowId, windowData);
        this.renderWindow(windowData);
        this.focusWindow(windowId);
        this.updateTaskbar();
        
        // Usage Statistics
        AppDataManager.recordAppUsage(app.id);
        LocalAnalytics.logEvent('window', 'create', app.id);
        
        logDebug('Fenster erstellt', windowData);
        return windowId;
    }

    /**
     * Fenster rendern
     */
    renderWindow(windowData) {
        const container = document.getElementById('windowsContainer');
        
        const windowEl = document.createElement('div');
        windowEl.className = 'desktop-window';
        windowEl.id = windowData.id;
        windowEl.style.cssText = `
            left: ${windowData.x}px;
            top: ${windowData.y}px;
            width: ${windowData.width}px;
            height: ${windowData.height}px;
            z-index: ${windowData.zIndex};
        `;
        
        // Check if it's an internal app
        const isInternalApp = windowData.app.url.startsWith('internal://');
        const iframeContent = this.getIframeContent(windowData.app);
        
        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span class="window-icon">${windowData.app.icon}</span>
                    <span class="window-title-text">${windowData.title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn minimize-btn" data-action="minimize">
                        <span>−</span>
                    </button>
                    <button class="window-btn maximize-btn" data-action="maximize">
                        <span>□</span>
                    </button>
                    <button class="window-btn close-btn" data-action="close">
                        <span>✕</span>
                    </button>
                </div>
            </div>
            <div class="window-content">
                ${iframeContent}
            </div>
        `;
        
        container.appendChild(windowEl);
        this.setupWindowEvents(windowEl, windowData);
    }
    
    /**
     * Iframe Content generieren
     */
    getIframeContent(app) {
        if (app.url.startsWith('internal://')) {
            const appType = app.url.replace('internal://', '');
            
            switch (appType) {
                case 'calculator':
                    return `<iframe src="calculator.html" title="${app.name}" style="border: none; width: 100%; height: 100%;"></iframe>`;
                default:
                    return `<div style="padding: 20px; text-align: center; color: #ff6b6b;">Interne App "${appType}" nicht gefunden</div>`;
            }
        } else {
            return `
                <iframe 
                    src="${app.url}" 
                    title="${app.name}"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                    loading="lazy"
                ></iframe>
            `;
        }
    }

    /**
     * Window Event Setup
     */
    setupWindowEvents(windowEl, windowData) {
        const header = windowEl.querySelector('.window-header');
        const controls = windowEl.querySelectorAll('.window-btn');
        
        // Window Controls
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                
                switch (action) {
                    case 'minimize':
                        this.minimizeWindow(windowData.id);
                        break;
                    case 'maximize':
                        this.toggleMaximize(windowData.id);
                        break;
                    case 'close':
                        this.closeWindow(windowData.id);
                        break;
                }
            });
        });
        
        // Dragging
        this.setupWindowDragging(header, windowEl, windowData);
        
        // Focus on click
        windowEl.addEventListener('mousedown', () => {
            this.focusWindow(windowData.id);
        });
        
        // Resize handles
        this.setupWindowResizing(windowEl, windowData);
    }

    /**
     * Window Dragging
     */
    setupWindowDragging(header, windowEl, windowData) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-btn')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = windowData.x;
            startTop = windowData.y;
            
            header.style.cursor = 'grabbing';
            
            const mouseMoveHandler = (e) => {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                let newX = startLeft + deltaX;
                let newY = startTop + deltaY;
                
                // Snap to grid
                newX = Math.round(newX / this.gridSize) * this.gridSize;
                newY = Math.round(newY / this.gridSize) * this.gridSize;
                
                // Keep on screen
                newX = Math.max(0, Math.min(newX, window.innerWidth - 100));
                newY = Math.max(0, Math.min(newY, window.innerHeight - 100));
                
                windowData.x = newX;
                windowData.y = newY;
                
                windowEl.style.left = newX + 'px';
                windowEl.style.top = newY + 'px';
            };
            
            const mouseUpHandler = () => {
                isDragging = false;
                header.style.cursor = 'grab';
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                
                // Finale Position sicherstellen
                const finalStyle = window.getComputedStyle(windowEl);
                windowData.x = parseInt(finalStyle.left) || windowData.x;
                windowData.y = parseInt(finalStyle.top) || windowData.y;
                
                AppDataManager.setWindowState(windowData.app.id, {
                    x: windowData.x,
                    y: windowData.y,
                    width: windowData.width,
                    height: windowData.height,
                    maximized: windowData.maximized
                });
                
                logDebug('Drag beendet - Position:', { x: windowData.x, y: windowData.y });
            };
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        
        // Double-click to maximize
        header.addEventListener('dblclick', (e) => {
            if (e.target.closest('.window-btn')) return;
            this.toggleMaximize(windowData.id);
        });
    }

    /**
     * Window Resizing
     */
    setupWindowResizing(windowEl, windowData) {
        const resizeHandles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
        
        resizeHandles.forEach(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${direction}`;
            windowEl.appendChild(handle);
            
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startResize(e, windowEl, windowData, direction);
            });
        });
    }

    startResize(e, windowEl, windowData, direction) {
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = windowData.width;
        const startHeight = windowData.height;
        const startLeft = windowData.x;
        const startTop = windowData.y;
        
        const mouseMoveHandler = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startLeft;
            let newY = startTop;
            
            // Calculate new dimensions based on direction
            if (direction.includes('e')) newWidth = startWidth + deltaX;
            if (direction.includes('w')) {
                newWidth = startWidth - deltaX;
                newX = startLeft + deltaX;
            }
            if (direction.includes('s')) newHeight = startHeight + deltaY;
            if (direction.includes('n')) {
                newHeight = startHeight - deltaY;
                newY = startTop + deltaY;
            }
            
            // Minimum size
            newWidth = Math.max(300, newWidth);
            newHeight = Math.max(200, newHeight);
            
            // Update window
            windowData.width = newWidth;
            windowData.height = newHeight;
            windowData.x = newX;
            windowData.y = newY;
            
            windowEl.style.width = newWidth + 'px';
            windowEl.style.height = newHeight + 'px';
            windowEl.style.left = newX + 'px';
            windowEl.style.top = newY + 'px';
        };
        
        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            
            AppDataManager.setWindowState(windowData.app.id, {
                x: windowData.x,
                y: windowData.y,
                width: windowData.width,
                height: windowData.height,
                maximized: windowData.maximized
            });
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }

    /**
     * Window Aktionen
     */
    focusWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData || windowData.minimized) return;
        
        // Update z-index
        windowData.zIndex = ++this.windowZ;
        windowData.focused = true;
        
        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            windowEl.style.zIndex = windowData.zIndex;
            windowEl.classList.add('focused');
        }
        
        // Unfocus other windows
        this.windows.forEach((data, id) => {
            if (id !== windowId) {
                data.focused = false;
                const el = document.getElementById(id);
                if (el) el.classList.remove('focused');
            }
        });
        
        this.activeWindow = windowId;
        this.updateTaskbar();
    }

    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        // Aktuelle Position und Größe vor dem Minimieren speichern
        const windowEl = document.getElementById(windowId);
        if (windowEl && !windowData.maximized) {
            // Verwende die CSS-Werte anstatt getBoundingClientRect
            const computedStyle = window.getComputedStyle(windowEl);
            windowData.x = parseInt(computedStyle.left) || windowData.x;
            windowData.y = parseInt(computedStyle.top) || windowData.y;
            windowData.width = parseInt(computedStyle.width) || windowData.width;
            windowData.height = parseInt(computedStyle.height) || windowData.height;
            
            logDebug('Minimieren - Position gespeichert:', {
                x: windowData.x,
                y: windowData.y,
                width: windowData.width,
                height: windowData.height
            });
        }
        
        windowData.minimized = true;
        if (windowEl) {
            windowEl.style.display = 'none';
        }
        
        this.updateTaskbar();
        if (typeof LocalAnalytics !== 'undefined') {
            LocalAnalytics.logEvent('window', 'minimize', windowData.app.id);
        }
    }

    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        windowData.minimized = false;
        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            windowEl.style.display = 'block';
            
            // Position und Größe wiederherstellen
            if (windowData.maximized) {
                // Wenn maximiert, maximierten Zustand beibehalten
                windowEl.style.left = '0px';
                windowEl.style.top = '0px';
                windowEl.style.width = '100vw';
                windowEl.style.height = 'calc(100vh - 40px)';
                windowEl.classList.add('maximized');
            } else {
                // Normale Position/Größe wiederherstellen mit Fallback-Werten
                const x = windowData.x || 100;
                const y = windowData.y || 100;
                const width = windowData.width || 800;
                const height = windowData.height || 600;
                
                windowEl.style.left = x + 'px';
                windowEl.style.top = y + 'px';
                windowEl.style.width = width + 'px';
                windowEl.style.height = height + 'px';
                windowEl.classList.remove('maximized');
                
                logDebug('Wiederherstellen - Position gesetzt:', { x, y, width, height });
            }
            
            // Z-Index wiederherstellen
            windowEl.style.zIndex = windowData.zIndex;
            
            // Sicherstellen, dass das Fenster sichtbar ist
            windowEl.style.display = 'flex';
            
            this.focusWindow(windowId);
        }
        
        this.updateTaskbar();
        if (typeof LocalAnalytics !== 'undefined') {
            LocalAnalytics.logEvent('window', 'restore', windowData.app.id);
        }
    }

    toggleMaximize(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;
        
        if (windowData.maximized) {
            // Restore - verwende gespeicherte oder aktuelle Position
            const restoreX = windowData.restoreX !== undefined ? windowData.restoreX : windowData.x;
            const restoreY = windowData.restoreY !== undefined ? windowData.restoreY : windowData.y;
            const restoreWidth = windowData.restoreWidth !== undefined ? windowData.restoreWidth : windowData.width;
            const restoreHeight = windowData.restoreHeight !== undefined ? windowData.restoreHeight : windowData.height;
            
            windowData.x = restoreX;
            windowData.y = restoreY;
            windowData.width = restoreWidth;
            windowData.height = restoreHeight;
            
            windowEl.style.left = restoreX + 'px';
            windowEl.style.top = restoreY + 'px';
            windowEl.style.width = restoreWidth + 'px';
            windowEl.style.height = restoreHeight + 'px';
            windowEl.classList.remove('maximized');
            windowData.maximized = false;
        } else {
            // Store current position before maximizing
            windowData.restoreX = windowData.x;
            windowData.restoreY = windowData.y;
            windowData.restoreWidth = windowData.width;
            windowData.restoreHeight = windowData.height;
            
            // Maximize
            windowEl.style.left = '0';
            windowEl.style.top = '0';
            windowEl.style.width = '100vw';
            windowEl.style.height = 'calc(100vh - 40px)'; // Account for taskbar
            windowEl.classList.add('maximized');
            windowData.maximized = true;
        }
        
        if (typeof LocalAnalytics !== 'undefined') {
            LocalAnalytics.logEvent('window', 'maximize', windowData.app.id);
        }
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            windowEl.remove();
        }
        
        this.windows.delete(windowId);
        
        if (this.activeWindow === windowId) {
            this.activeWindow = null;
        }
        
        this.updateTaskbar();
        LocalAnalytics.logEvent('window', 'close', windowData.app.id);
        logDebug('Fenster geschlossen', windowId);
    }

    minimizeAllWindows() {
        this.windows.forEach((_, windowId) => {
            this.minimizeWindow(windowId);
        });
    }

    /**
     * Nächste Fenster Position berechnen
     */
    getNextWindowPosition() {
        const offset = (this.nextWindowId - 1) * 30;
        return {
            x: 100 + offset,
            y: 100 + offset
        };
    }

    /**
     * Desktop Gruppen rendern
     */
    renderDesktopGroups() {
        const desktopArea = document.getElementById('desktopArea');
        if (!desktopArea) return;
        
        const groups = AppDataManager.getAppGroups();
        desktopArea.innerHTML = '';
        
        // Anleitung als erstes Element hinzufügen
        this.addWelcomeGuide(desktopArea);
        
        // Position Counter für Grid-Layout (startet bei 1 wegen Guide)
        let position = 1;
        
        groups.forEach(group => {
            const folderEl = document.createElement('div');
            folderEl.className = 'desktop-folder';
            folderEl.style.gridColumn = `${(position % 10) + 1}`;
            folderEl.style.gridRow = `${Math.floor(position / 10) + 1}`;
            
            folderEl.innerHTML = `
                <div class="folder-icon" style="background: ${group.color}; border: 2px solid rgba(255,255,255,0.2);">
                    ${group.icon}
                </div>
                <div class="folder-name" title="${group.name}">${group.name}</div>
            `;
            
            // Single Click für Selection
            folderEl.addEventListener('click', () => {
                document.querySelectorAll('.desktop-folder, .desktop-icon').forEach(el => {
                    el.classList.remove('selected');
                });
                folderEl.classList.add('selected');
            });
            
            // Double Click für Öffnen
            folderEl.addEventListener('dblclick', () => {
                this.openGroupWindow(group);
            });
            
            desktopArea.appendChild(folderEl);
            position++;
        });
        
        // Einzelne Apps ohne Gruppe
        const ungroupedApps = AppDataManager.getUngroupedApps();
        ungroupedApps.forEach(app => {
            const iconEl = document.createElement('div');
            iconEl.className = 'desktop-icon';
            iconEl.style.gridColumn = `${(position % 10) + 1}`;
            iconEl.style.gridRow = `${Math.floor(position / 10) + 1}`;
            
            iconEl.innerHTML = `
                <div class="desktop-icon-image" style="background: rgba(99, 102, 241, 0.1); border: 2px solid rgba(99, 102, 241, 0.3);">${app.icon}</div>
                <div class="desktop-icon-name" title="${app.name}">${app.name}</div>
            `;
            
            // Single Click für Selection
            iconEl.addEventListener('click', () => {
                document.querySelectorAll('.desktop-folder, .desktop-icon').forEach(el => {
                    el.classList.remove('selected');
                });
                iconEl.classList.add('selected');
            });
            
            // Double Click für Öffnen
            iconEl.addEventListener('dblclick', () => {
                this.createWindow(app);
            });
            
            desktopArea.appendChild(iconEl);
            position++;
        });
        
        logDebug(`Desktop gerendert: ${groups.length} Gruppen, ${ungroupedApps.length} einzelne Apps`);
    }
    
    /**
     * Willkommens-Anleitung hinzufügen
     */
    addWelcomeGuide(desktopArea) {
        const guideEl = document.createElement('div');
        guideEl.className = 'desktop-guide';
        guideEl.style.gridColumn = '1';
        guideEl.style.gridRow = '1';
        
        guideEl.innerHTML = `
            <div class="guide-icon">📖</div>
            <div class="guide-name">Anleitung</div>
        `;
        
        guideEl.addEventListener('click', () => {
            document.querySelectorAll('.desktop-folder, .desktop-icon, .desktop-guide').forEach(el => {
                el.classList.remove('selected');
            });
            guideEl.classList.add('selected');
        });
        
        guideEl.addEventListener('dblclick', () => {
            this.openWelcomeGuide();
        });
        
        desktopArea.appendChild(guideEl);
    }
    
    /**
     * Willkommens-Anleitung öffnen
     */
    openWelcomeGuide() {
        const guideApp = {
            id: 'welcome-guide',
            name: 'AetherNode Anleitung',
            url: 'data:text/html;charset=utf-8,' + encodeURIComponent(this.getGuideHTML()),
            icon: '📖'
        };
        
        this.createWindow(guideApp, {
            x: 100,
            y: 100,
            width: 900,
            height: 700
        });
        
        LocalAnalytics.logEvent('guide', 'open', 'welcome');
    }
    
    /**
     * Anleitung HTML generieren
     */
    getGuideHTML() {
        return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AetherNode Anleitung</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff;
            padding: 30px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #6366f1, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
        }
        
        h2 {
            color: #10b981;
            margin: 30px 0 15px 0;
            font-size: 1.5em;
            border-left: 4px solid #10b981;
            padding-left: 15px;
        }
        
        h3 {
            color: #6366f1;
            margin: 20px 0 10px 0;
            font-size: 1.2em;
        }
        
        .intro {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .step {
            background: rgba(45, 45, 68, 0.6);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #6366f1;
        }
        
        .step-number {
            display: inline-block;
            background: #6366f1;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            text-align: center;
            line-height: 25px;
            margin-right: 10px;
            font-weight: bold;
        }
        
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
            color: #10b981;
        }
        
        .app-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .app-card {
            background: rgba(45, 45, 68, 0.6);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .app-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        ul {
            padding-left: 20px;
        }
        
        li {
            margin: 8px 0;
        }
        
        .highlight {
            background: rgba(255, 193, 7, 0.2);
            padding: 2px 4px;
            border-radius: 3px;
            color: #ffc107;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AetherNode Suite - Anleitung</h1>
        
        <div class="intro">
            <h2>📖 Willkommen bei AetherNode!</h2>
            <p>Diese Anleitung erklärt dir, wie du dich bei allen AetherNode Anwendungen anmeldest und deine Daten verwaltest.</p>
        </div>

        <h2>🔐 Das Anmelde-System verstehen</h2>
        
        <div class="warning">
            <strong>⚠️ Wichtig:</strong> Alle AetherNode Apps speichern deine Daten standardmäßig <strong>nur lokal in deinem Browser</strong>. Keine Registrierung nötig!
        </div>

        <h2>🎯 Schnellstart - So meldest du dich an:</h2>
        
        <div class="step">
            <span class="step-number">1</span>
            <strong>App öffnen</strong><br>
            Öffne eine beliebige AetherNode App (Notes, Calendar, Projekte, etc.)
        </div>
        
        <div class="step">
            <span class="step-number">2</span>
            <strong>Passwort eingeben</strong><br>
            Gib <strong>irgendein Passwort</strong> deiner Wahl ein. Das kann alles sein: <code>test123</code>, <code>meinpasswort</code>, etc.
        </div>
        
        <div class="step">
            <span class="step-number">3</span>
            <strong>Enter drücken</strong><br>
            Drücke <kbd>Enter</kbd> und du bist drin! Es wird automatisch ein lokales Konto erstellt.
        </div>
        
        <div class="success">
            <strong>✅ Fertig!</strong> Du bist jetzt angemeldet und kannst die App nutzen.
        </div>

        <h2>🔄 Wieder anmelden</h2>
        <p>Beim nächsten Besuch:</p>
        <ul>
            <li>Gib <strong>das gleiche Passwort</strong> ein wie beim ersten Mal</li>
            <li>Drücke Enter</li>
            <li>Alle deine Daten sind wieder da!</li>
        </ul>
        
        <div class="warning">
            <strong>🧠 Passwort merken!</strong> Ohne das richtige Passwort kommst du nicht mehr an deine Daten.
        </div>

        <h2>💾 Datenspeicherung - 3 Optionen</h2>

        <h3>Option 1: 🖥️ Nur lokal (Standard)</h3>
        <div class="step">
            <strong>Wie es funktioniert:</strong><br>
            • Daten werden nur in deinem Browser gespeichert<br>
            • Keine Internetverbindung nötig<br>
            • Komplett privat und sicher
        </div>
        
        <div class="warning">
            <strong>⚠️ Achtung:</strong> Wenn du Browser-Daten löschst oder den Computer wechselst, sind deine Daten weg!
        </div>

        <h3>Option 2: ☁️ Cloud-Sync (Empfohlen)</h3>
        <div class="step">
            <span class="step-number">1</span>
            <strong>Sync-Button klicken</strong><br>
            In jeder App gibt es einen <span class="highlight">SYNC</span> Button
        </div>
        
        <div class="step">
            <span class="step-number">2</span>
            <strong>Verschlüsselte Speicherung</strong><br>
            Deine Daten werden verschlüsselt auf dem Server gespeichert
        </div>
        
        <div class="step">
            <span class="step-number">3</span>
            <strong>ID merken</strong><br>
            Du bekommst eine <span class="highlight">Sync-ID</span> - diese <strong>unbedingt notieren!</strong>
        </div>
        
        <div class="success">
            <strong>✅ Vorteil:</strong> Du kannst deine Daten auf jedem Gerät abrufen mit Passwort + Sync-ID
        </div>

        <h3>Option 3: 👥 Team-Collaboration (nur Projekte)</h3>
        <div class="step">
            <strong>Zusätzlich bei Projekten:</strong><br>
            • Es gibt noch eine <span class="highlight">Team-Secret</span><br>
            • Damit können mehrere Personen am gleichen Projekt arbeiten<br>
            • Jeder braucht: Passwort + Sync-ID + Team-Secret
        </div>

        <h2>📱 Die Anwendungen im Detail</h2>
        
        <div class="app-grid">
            <div class="app-card">
                <div class="app-icon">📝</div>
                <h3>Notes & Tasks</h3>
                <p>Notizen und Aufgaben verwalten. Einfaches Login mit beliebigem Passwort.</p>
            </div>
            
            <div class="app-card">
                <div class="app-icon">📅</div>
                <h3>Calendar</h3>
                <p>Termine und Events planen. Sync-Funktion für Geräte-übergreifenden Zugriff.</p>
            </div>
            
            <div class="app-card">
                <div class="app-icon">📊</div>
                <h3>Projekte</h3>
                <p>Team-Projekte verwalten. Collaboration mit Team-Secret für gemeinsame Projekte.</p>
            </div>
            
            <div class="app-card">
                <div class="app-icon">🛠️</div>
                <p>Verschiedene Tools und Utilities für Produktivität.</p>
            </div>
        </div>

        <h2>🛡️ Sicherheit & Backup</h2>
        
        <h3>✅ Was du tun solltest:</h3>
        <ul>
            <li><strong>Passwort notieren</strong> - schreib es irgendwo auf</li>
            <li><strong>Sync-ID sichern</strong> - wenn du Cloud-Sync nutzt</li>
            <li><strong>Team-Secret teilen</strong> - nur mit deinen Teammitgliedern</li>
            <li><strong>Regelmäßig syncen</strong> - damit deine Daten gesichert sind</li>
        </ul>
        
        <h3>❌ Was du vermeiden solltest:</h3>
        <ul>
            <li>Browser-Daten löschen ohne Backup</li>
            <li>Passwort vergessen (es gibt keine Wiederherstellung!)</li>
            <li>Team-Secret öffentlich teilen</li>
        </ul>

        <h2>🔧 Troubleshooting</h2>
        
        <h3>"Ich komme nicht mehr rein!"</h3>
        <p>Prüfe ob du das <strong>exakt gleiche Passwort</strong> verwendest. Groß-/Kleinschreibung beachten!</p>
        
        <h3>"Meine Daten sind weg!"</h3>
        <p>Hast du Browser-Daten gelöscht? Dann sind lokale Daten weg. Mit Sync-ID + Passwort kannst du sie wiederherstellen.</p>
        
        <h3>"Team-Collaboration funktioniert nicht!"</h3>
        <p>Alle Teammitglieder brauchen: <span class="highlight">Gleiches Passwort + Sync-ID + Team-Secret</span></p>

        <h2>🎯 Beispiel-Workflow</h2>
        
        <div class="step">
            <span class="step-number">1</span>
            <strong>Erste Anmeldung</strong><br>
            Passwort: <code>meingeheimespasswort123</code>
        </div>
        
        <div class="step">
            <span class="step-number">2</span>
            <strong>Daten eingeben</strong><br>
            Notizen schreiben, Termine eintragen, etc.
        </div>
        
        <div class="step">
            <span class="step-number">3</span>
            <strong>Sync aktivieren</strong><br>
            SYNC klicken → Sync-ID: <code>abc123-def456-ghi789</code>
        </div>
        
        <div class="step">
            <span class="step-number">4</span>
            <strong>IDs notieren</strong><br>
            Passwort + Sync-ID sicher aufschreiben
        </div>
        
        <div class="step">
            <span class="step-number">5</span>
            <strong>Überall verfügbar</strong><br>
            Auf jedem Gerät mit Passwort + Sync-ID anmelden
        </div>

        <div class="success">
            <h2>🎉 Viel Erfolg mit AetherNode!</h2>
            <p>Du bist jetzt bereit, alle AetherNode Apps produktiv zu nutzen. Bei Fragen schau einfach wieder in diese Anleitung.</p>
        </div>
        
        <div class="intro" style="margin-top: 40px;">
            <p><strong>💡 Tipp:</strong> Diese Anleitung ist jederzeit über das 📖 Symbol auf dem Desktop erreichbar.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Gruppen-Fenster öffnen
     */
    openGroupWindow(group) {
        const apps = AppDataManager.getApps();
        let openedCount = 0;
        
        // Alle Apps der Gruppe in Fenstern öffnen
        group.apps.forEach((appId, index) => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                setTimeout(() => {
                    // Bessere Positionierung für mehrere Fenster
                    const offset = index * 40;
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    
                    this.createWindow(app, {
                        x: 100 + (col * 300) + offset,
                        y: 100 + (row * 200) + offset,
                        width: 800,
                        height: 600
                    });
                    openedCount++;
                }, index * 300); // Staggered opening
            }
        });
        
        if (group.apps.length > 0) {
            Notifications.success(`📁 ${group.name}: ${group.apps.length} Apps werden geöffnet...`);
        }
        
        LocalAnalytics.logEvent('group', 'open', group.id);
        logDebug('Gruppe geöffnet', { group: group.name, apps: group.apps.length });
    }

    /**
     * Taskbar Update
     */
    updateTaskbar() {
        const runningApps = document.getElementById('runningApps');
        if (!runningApps) return;
        
        runningApps.innerHTML = '';
        
        this.windows.forEach((windowData) => {
            const taskBtn = document.createElement('button');
            taskBtn.className = `taskbar-app ${windowData.focused ? 'active' : ''} ${windowData.minimized ? 'minimized' : ''}`;
            taskBtn.innerHTML = `
                <span class="taskbar-app-icon">${windowData.app.icon}</span>
                <span class="taskbar-app-name">${windowData.title}</span>
            `;
            
            taskBtn.addEventListener('click', () => {
                if (windowData.minimized || !windowData.focused) {
                    this.restoreWindow(windowData.id);
                } else {
                    this.minimizeWindow(windowData.id);
                }
            });
            
            runningApps.appendChild(taskBtn);
        });
    }

    /**
     * App öffnen (externe API)
     */
    openApp(app) {
        return this.createWindow(app);
    }

    /**
     * Alle Fenster schließen
     */
    closeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => this.closeWindow(id));
    }
}

// Export für globale Nutzung
window.WindowManager = WindowManager;

logDebug('WindowManager Modul geladen');