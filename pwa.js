/**
 * AetherNode Desktop - PWA (Progressive Web App)
 * Service Worker & Installation Support
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        
        this.init();
        logDebug('PWAManager initialisiert');
    }

    /**
     * PWA Manager initialisieren
     */
    init() {
        this.checkInstallation();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupAppUpdate();
        this.setupOfflineHandling();
    }

    /**
     * Prüfen ob App installiert ist
     */
    checkInstallation() {
        // PWA Installation Status
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            document.body.classList.add('pwa-installed');
            logDebug('PWA ist installiert');
        }

        // iOS Safari Check
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            document.body.classList.add('pwa-installed', 'ios-pwa');
            logDebug('PWA ist auf iOS installiert');
        }
    }

    /**
     * Service Worker registrieren
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                logDebug('Service Worker registriert', registration);
                
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });

                // Check for updates every 10 minutes
                setInterval(() => {
                    registration.update();
                }, 10 * 60 * 1000);

            } catch (error) {
                console.error('Service Worker Registration fehlgeschlagen:', error);
            }
        }
    }

    /**
     * Install Prompt Setup
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
            logDebug('Install Prompt verfügbar');
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.isInstalled = true;
            document.body.classList.add('pwa-installed');
            this.hideInstallButton();
            Notifications.success('🎉 App erfolgreich installiert!');
            LocalAnalytics.logEvent('pwa', 'install', 'success');
        });
    }

    /**
     * Install Button anzeigen
     */
    showInstallButton() {
        // Prüfen ob bereits installiert
        if (this.isInstalled) return;

        // Install Button in Taskbar hinzufügen
        const systemTray = document.querySelector('.system-tray');
        if (!systemTray || document.getElementById('installBtn')) return;

        const installBtn = document.createElement('button');
        installBtn.id = 'installBtn';
        installBtn.className = 'tray-btn install-btn';
        installBtn.title = 'Als Desktop-App installieren';
        installBtn.innerHTML = '<span class="tray-icon">📥</span>';
        
        installBtn.addEventListener('click', () => {
            this.promptInstall();
        });

        // Vor Settings Button einfügen
        const settingsBtn = document.getElementById('settingsBtn');
        systemTray.insertBefore(installBtn, settingsBtn);

        // Zusätzlich in Settings Modal
        this.addInstallToSettings();
    }

    /**
     * Install Button verstecken
     */
    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    /**
     * Installation auslösen
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            Notifications.info('ℹ️ Installation bereits verfügbar oder nicht unterstützt');
            return;
        }

        const result = await this.deferredPrompt.prompt();
        logDebug('Install Prompt Ergebnis:', result.outcome);

        if (result.outcome === 'accepted') {
            LocalAnalytics.logEvent('pwa', 'install_prompt', 'accepted');
        } else {
            LocalAnalytics.logEvent('pwa', 'install_prompt', 'dismissed');
        }

        this.deferredPrompt = null;
    }

    /**
     * Install Option in Einstellungen hinzufügen
     */
    addInstallToSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (!settingsModal) return;

        const modalBody = settingsModal.querySelector('.modal-body');
        if (!modalBody || document.getElementById('pwaSection')) return;

        const pwaSection = document.createElement('div');
        pwaSection.className = 'settings-section';
        pwaSection.id = 'pwaSection';
        pwaSection.innerHTML = `
            <h3>Progressive Web App (PWA)</h3>
            <div class="pwa-info">
                <p>Installiere AetherNode Desktop als native Desktop-Anwendung für:</p>
                <ul>
                    <li>✅ Schnelleren Zugriff über Desktop/Startmenü</li>
                    <li>✅ Bessere Performance</li>
                    <li>✅ Offline-Funktionalität</li>
                    <li>✅ Native Benachrichtigungen</li>
                    <li>✅ Automatische Updates</li>
                </ul>
                <div class="pwa-actions">
                    <button id="pwaInstallBtn" class="btn-install" ${!this.deferredPrompt ? 'disabled' : ''}>
                        📥 Als App installieren
                    </button>
                    <button id="pwaShareBtn" class="btn-small">
                        📤 App teilen
                    </button>
                    ${this.isInstalled ? '<span class="pwa-status">✅ Bereits installiert</span>' : ''}
                </div>
            </div>
        `;

        modalBody.appendChild(pwaSection);

        // Event Listeners
        const installBtn = pwaSection.querySelector('#pwaInstallBtn');
        const shareBtn = pwaSection.querySelector('#pwaShareBtn');

        if (installBtn && !this.isInstalled) {
            installBtn.addEventListener('click', () => {
                this.promptInstall();
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareApp();
            });
        }
    }

    /**
     * App teilen
     */
    async shareApp() {
        const shareData = {
            title: 'AetherNode Desktop',
            text: 'Entdecke AetherNode Desktop - Die modulare Suite für alle deine Apps!',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                LocalAnalytics.logEvent('pwa', 'share', 'native');
            } else {
                // Fallback: URL kopieren
                Utils.copyToClipboard(shareData.url);
                Notifications.success('📋 Link kopiert!');
                LocalAnalytics.logEvent('pwa', 'share', 'clipboard');
            }
        } catch (error) {
            console.error('Fehler beim Teilen:', error);
        }
    }

    /**
     * Service Worker Update Handler
     */
    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
            }
        });
    }

    /**
     * Update Benachrichtigung anzeigen
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <div class="update-text">
                    <strong>Update verfügbar!</strong>
                    <p>Eine neue Version von AetherNode Desktop ist verfügbar.</p>
                </div>
                <div class="update-actions">
                    <button class="update-btn reload">Jetzt aktualisieren</button>
                    <button class="update-btn dismiss">Später</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Event Listeners
        notification.querySelector('.reload').addEventListener('click', () => {
            window.location.reload();
        });

        notification.querySelector('.dismiss').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-dismiss nach 30 Sekunden
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 30000);

        LocalAnalytics.logEvent('pwa', 'update_available', 'notification_shown');
    }

    /**
     * App Update Setup
     */
    setupAppUpdate() {
        // Check for updates when app becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration) {
                        registration.update();
                    }
                });
            }
        });
    }

    /**
     * Offline Handling Setup
     */
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
            Notifications.success('🌐 Verbindung wiederhergestellt!');
            LocalAnalytics.logEvent('network', 'online', 'reconnected');
        });

        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
            Notifications.error('🔴 Offline - Einige Features sind eingeschränkt');
            LocalAnalytics.logEvent('network', 'offline', 'disconnected');
        });

        // Initial check
        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }
    }

    /**
     * PWA Features prüfen und anzeigen
     */
    checkPWAFeatures() {
        const features = {
            serviceWorker: 'serviceWorker' in navigator,
            notifications: 'Notification' in window,
            pushManager: 'PushManager' in window,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            webShare: 'share' in navigator,
            installPrompt: 'BeforeInstallPromptEvent' in window || this.deferredPrompt !== null,
            fullscreen: 'requestFullscreen' in document.documentElement,
            offline: 'onLine' in navigator
        };

        logDebug('PWA Features:', features);
        return features;
    }

    /**
     * Benachrichtigungen Setup
     */
    async setupNotifications() {
        if (!('Notification' in window)) {
            logDebug('Benachrichtigungen werden nicht unterstützt');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Native Benachrichtigung senden
     */
    sendNotification(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const notification = new Notification(title, {
            icon: 'icons/icon-192x192.png',
            badge: 'icons/icon-72x72.png',
            tag: 'aethernode-notification',
            renotify: true,
            ...options
        });

        notification.addEventListener('click', () => {
            window.focus();
            notification.close();
        });

        // Auto-close nach 5 Sekunden
        setTimeout(() => {
            notification.close();
        }, 5000);

        LocalAnalytics.logEvent('notification', 'sent', title);
    }

    /**
     * App-Shortcuts in Manifest
     */
    updateAppShortcuts() {
        const apps = AppDataManager.getApps();
        const topApps = Object.entries(AppDataManager.getUsageStats())
            .sort(([,a], [,b]) => b.opens - a.opens)
            .slice(0, 4)
            .map(([appId]) => apps.find(app => app.id === appId))
            .filter(Boolean);

        // Shortcuts könnten dynamisch an das Manifest angehängt werden
        // (Erfordert Service Worker Implementation)
        logDebug('Top Apps für Shortcuts:', topApps);
    }
}

// Global verfügbar machen
window.PWAManager = PWAManager;

logDebug('PWAManager Modul geladen');