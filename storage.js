/**
 * AetherNode Desktop - Lokaler Speicher
 * Verwaltet ALLE Daten lokal im Browser
 * Keine Daten werden auf Servern gespeichert!
 */

class LocalStorage {
    constructor(prefix = 'aethernode_') {
        this.prefix = prefix;
        this.storage = window.localStorage;
        logDebug('LocalStorage initialisiert', { prefix: this.prefix });
    }

    /**
     * Speichert einen Wert lokal
     */
    set(key, value) {
        try {
            const fullKey = this.prefix + key;
            const serialized = JSON.stringify(value);
            this.storage.setItem(fullKey, serialized);
            logDebug(`Gespeichert: ${key}`, value);
            return true;
        } catch (error) {
            console.error(`Fehler beim Speichern von ${key}:`, error);
            return false;
        }
    }

    /**
     * Ruft einen Wert lokal ab
     */
    get(key) {
        try {
            const fullKey = this.prefix + key;
            const serialized = this.storage.getItem(fullKey);
            if (serialized === null) return null;
            const value = JSON.parse(serialized);
            logDebug(`Gelesen: ${key}`, value);
            return value;
        } catch (error) {
            console.error(`Fehler beim Lesen von ${key}:`, error);
            return null;
        }
    }

    /**
     * Löscht einen Wert lokal
     */
    remove(key) {
        try {
            const fullKey = this.prefix + key;
            this.storage.removeItem(fullKey);
            logDebug(`Gelöscht: ${key}`);
            return true;
        } catch (error) {
            console.error(`Fehler beim Löschen von ${key}:`, error);
            return false;
        }
    }

    /**
     * Löscht ALLE gespeicherten Daten
     */
    clear() {
        try {
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
            logDebug('Alle Daten gelöscht');
            return true;
        } catch (error) {
            console.error('Fehler beim Löschen aller Daten:', error);
            return false;
        }
    }

    /**
     * Prüft ob Speicherplatz vorhanden ist
     */
    hasSpace() {
        try {
            const test = '__test__';
            this.set(test, 'test');
            this.remove(test);
            return true;
        } catch (error) {
            console.warn('Kein Speicherplatz vorhanden!', error);
            return false;
        }
    }

    /**
     * Exportiert alle Daten als JSON
     */
    export() {
        const data = {};
        const keys = Object.keys(this.storage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                const cleanKey = key.replace(this.prefix, '');
                data[cleanKey] = this.get(cleanKey);
            }
        });
        return data;
    }

    /**
     * Importiert Daten aus JSON
     */
    import(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                this.set(key, value);
            });
            logDebug('Daten importiert', data);
            return true;
        } catch (error) {
            console.error('Fehler beim Importieren:', error);
            return false;
        }
    }
}

// Globale Instanz
const appStorage = new LocalStorage(CONFIG.storagePrefix);

/**
 * App-spezifische Speicher-Verwaltung
 */
class AppDataManager {
    /**
     * Speichert oder ruft die Apps ab
     */
    static getApps() {
        let apps = appStorage.get('apps');
        if (!apps || apps.length === 0) {
            apps = CONFIG.defaultApps;
            AppDataManager.saveApps(apps);
        }
        return apps;
    }

    static saveApps(apps) {
        appStorage.set('apps', apps);
    }

    static addApp(app) {
        const apps = AppDataManager.getApps();
        // Verhindere Duplikate
        if (!apps.find(a => a.id === app.id)) {
            apps.push(app);
            AppDataManager.saveApps(apps);
            logDebug('App hinzugefügt', app);
            return true;
        }
        return false;
    }

    static removeApp(appId) {
        const apps = AppDataManager.getApps();
        const filtered = apps.filter(a => a.id !== appId);
        AppDataManager.saveApps(filtered);
        logDebug('App entfernt', appId);
        return true;
    }

    static updateApp(appId, updates) {
        const apps = AppDataManager.getApps();
        const index = apps.findIndex(a => a.id === appId);
        if (index !== -1) {
            apps[index] = { ...apps[index], ...updates };
            AppDataManager.saveApps(apps);
            logDebug('App aktualisiert', apps[index]);
            return true;
        }
        return false;
    }

    /**
     * Speichert den zuletzt geöffneten App
     */
    static setLastApp(appId) {
        appStorage.set('lastApp', appId);
    }

    static getLastApp() {
        return appStorage.get('lastApp');
    }

    /**
     * Speichert UI-Einstellungen
     */
    static setUISettings(settings) {
        appStorage.set('uiSettings', settings);
    }

    static getUISettings() {
        return appStorage.get('uiSettings') || {
            sidebarWidth: 280,
            theme: 'dark',
            compactMode: false
        };
    }

    /**
     * Speichert App-Fenster Positionen und Größen
     */
    static setWindowState(appId, state) {
        const states = appStorage.get('windowStates') || {};
        states[appId] = state;
        appStorage.set('windowStates', states);
    }

    static getWindowState(appId) {
        const states = appStorage.get('windowStates') || {};
        return states[appId];
    }

    /**
     * Cache für geöffnete Apps
     */
    static cacheApp(appId, data) {
        const cache = appStorage.get('appCache') || {};
        cache[appId] = {
            data: data,
            timestamp: Date.now()
        };
        appStorage.set('appCache', cache);
    }

    static getCachedApp(appId) {
        const cache = appStorage.get('appCache') || {};
        return cache[appId];
    }

    /**
     * Statistiken über App-Nutzung
     */
    static recordAppUsage(appId) {
        const stats = appStorage.get('usageStats') || {};
        if (!stats[appId]) {
            stats[appId] = {
                opens: 0,
                lastOpened: null,
                totalTime: 0
            };
        }
        stats[appId].opens += 1;
        stats[appId].lastOpened = new Date().toISOString();
        appStorage.set('usageStats', stats);
    }

    static getUsageStats() {
        return appStorage.get('usageStats') || {};
    }

    /**
     * App-Gruppen Management
     */
    static getAppGroups() {
        return appStorage.get('appGroups') || [
            {
                id: 'productivity',
                name: 'Produktivität',
                icon: '📊',
                color: '#6366f1',
                apps: ['notes', 'calendar'] // App IDs
            },
            {
                id: 'tools',
                name: 'Werkzeuge',
                icon: '🛠️',
                color: '#10b981',
                apps: ['tools']
            }
        ];
    }

    static saveAppGroups(groups) {
        appStorage.set('appGroups', groups);
    }

    static addAppGroup(group) {
        const groups = AppDataManager.getAppGroups();
        groups.push(group);
        AppDataManager.saveAppGroups(groups);
        logDebug('App-Gruppe hinzugefügt', group);
    }

    static removeAppGroup(groupId) {
        const groups = AppDataManager.getAppGroups();
        const filtered = groups.filter(g => g.id !== groupId);
        AppDataManager.saveAppGroups(filtered);
        logDebug('App-Gruppe entfernt', groupId);
    }

    static getUngroupedApps() {
        const allApps = AppDataManager.getApps();
        const groups = AppDataManager.getAppGroups();
        const groupedAppIds = groups.flatMap(g => g.apps);
        return allApps.filter(app => !groupedAppIds.includes(app.id));
    }

    static addAppToGroup(appId, groupId) {
        const groups = AppDataManager.getAppGroups();
        const group = groups.find(g => g.id === groupId);
        if (group && !group.apps.includes(appId)) {
            group.apps.push(appId);
            AppDataManager.saveAppGroups(groups);
            logDebug('App zu Gruppe hinzugefügt', { appId, groupId });
        }
    }

    static removeAppFromGroup(appId, groupId) {
        const groups = AppDataManager.getAppGroups();
        const group = groups.find(g => g.id === groupId);
        if (group) {
            group.apps = group.apps.filter(id => id !== appId);
            AppDataManager.saveAppGroups(groups);
            logDebug('App aus Gruppe entfernt', { appId, groupId });
        }
    }

    /**
     * Hotkeys Management
     */
    static getCustomHotkeys() {
        return appStorage.get('customHotkeys') || {};
    }

    static setCustomHotkeys(hotkeys) {
        appStorage.set('customHotkeys', hotkeys);
    }

    static addCustomHotkey(combo, appId, description) {
        const hotkeys = AppDataManager.getCustomHotkeys();
        hotkeys[combo] = { appId, description };
        AppDataManager.setCustomHotkeys(hotkeys);
        logDebug('Custom Hotkey hinzugefügt', { combo, appId });
    }

    static removeCustomHotkey(combo) {
        const hotkeys = AppDataManager.getCustomHotkeys();
        delete hotkeys[combo];
        AppDataManager.setCustomHotkeys(hotkeys);
        logDebug('Custom Hotkey entfernt', combo);
    }

    /**
     * Desktop Layout Management
     */
    static getDesktopLayout() {
        return appStorage.get('desktopLayout') || {
            mode: 'desktop', // 'desktop', 'grid', 'single'
            iconPositions: {},
            groupPositions: {}
        };
    }

    static setDesktopLayout(layout) {
        appStorage.set('desktopLayout', layout);
    }

    static setIconPosition(appId, x, y) {
        const layout = AppDataManager.getDesktopLayout();
        layout.iconPositions[appId] = { x, y };
        AppDataManager.setDesktopLayout(layout);
    }

    static getIconPosition(appId) {
        const layout = AppDataManager.getDesktopLayout();
        return layout.iconPositions[appId];
    }

    /**
     * Quick Launch Management
     */
    static getQuickLaunchApps() {
        return appStorage.get('quickLaunchApps') || ['notes', 'calendar', 'projects'];
    }

    static setQuickLaunchApps(appIds) {
        appStorage.set('quickLaunchApps', appIds);
    }

    static addToQuickLaunch(appId) {
        const quickApps = AppDataManager.getQuickLaunchApps();
        if (!quickApps.includes(appId)) {
            quickApps.push(appId);
            AppDataManager.setQuickLaunchApps(quickApps);
        }
    }

    static removeFromQuickLaunch(appId) {
        const quickApps = AppDataManager.getQuickLaunchApps();
        const filtered = quickApps.filter(id => id !== appId);
        AppDataManager.setQuickLaunchApps(filtered);
    }

    /**
     * PWA Settings
     */
    static getPWASettings() {
        return appStorage.get('pwaSettings') || {
            installPromptShown: false,
            notificationsEnabled: false,
            autoUpdate: true,
            offlineMode: true
        };
    }

    static setPWASettings(settings) {
        appStorage.set('pwaSettings', settings);
    }

    static setPWASetting(key, value) {
        const settings = AppDataManager.getPWASettings();
        settings[key] = value;
        AppDataManager.setPWASettings(settings);
    }

    /**
     * Window State Management
     */
    static setWindowState(appId, state) {
        const windowStates = appStorage.get('windowStates') || {};
        windowStates[appId] = state;
        appStorage.set('windowStates', windowStates);
    }
    
    static getWindowState(appId) {
        const windowStates = appStorage.get('windowStates') || {};
        return windowStates[appId];
    }
    
    static setWindowStates(states) {
        appStorage.set('windowStates', states);
    }
    
    static getWindowStates() {
        return appStorage.get('windowStates') || {};
    }

    /**
     * Backup und Restore
     */
    static createBackup() {
        const backup = {
            version: CONFIG.version,
            timestamp: new Date().toISOString(),
            data: appStorage.export()
        };
        appStorage.set('lastBackup', backup);
        return backup;
    }

    static restoreFromBackup(backup) {
        try {
            appStorage.import(backup.data);
            logDebug('Backup wiederhergestellt', backup.timestamp);
            return true;
        } catch (error) {
            console.error('Fehler bei Wiederherstellung:', error);
            return false;
        }
    }
}

logDebug('Storage-Module geladen');
