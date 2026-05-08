/**
 * AetherNode Desktop - Konfiguration
 * Definiert alle verfügbaren Anwendungen
 * LOKAL GESPEICHERT - Keine Serverdaten!
 */

const DEFAULT_APPS = [
    {
        id: 'notes',
        name: 'Notes & Tasks',
        url: 'https://nat.aethernode.de',
        icon: '📝',
        category: 'productivity',
        description: 'Notizen und Aufgabenverwaltung'
    },
    {
        id: 'calendar',
        name: 'Calendar',
        url: 'https://cal.aethernode.de',
        icon: '📅',
        category: 'productivity',
        description: 'Kalender und Termine'
    },
    {
        id: 'projects',
        name: 'Projekte',
        url: 'https://projects.aethernode.de',
        icon: '📊',
        category: 'collaboration',
        description: 'Projekte mit Collaboration'
    },
    {
        id: 'tools',
        name: 'Tools',
        url: 'https://tools.aethernode.de',
        icon: '🛠️',
        category: 'utilities',
        description: 'Verschiedene Hilfswerkzeuge'
    },
    {
        id: 'about',
        name: 'Über mich',
        url: 'https://dewbr.de',
        icon: '👤',
        category: 'info',
        description: 'Seite über den Entwickler'
    },
    {
        id: 'calculator',
        name: 'Taschenrechner',
        url: 'internal://calculator',
        icon: '🧮',
        category: 'utility',
        description: 'Integrierter Taschenrechner'
    }
];

const CONFIG = {
    // Allgemeine Einstellungen
    appName: 'AetherNode Desktop',
    version: '1.0.0',
    
    // Iframe Einstellungen
    useIframe: true,
    iframeTimeout: 30000, // 30 Sekunden
    
    // Speicher Einstellungen
    storagePrefix: 'aethernode_',
    useLocalStorage: true,
    useSessionStorage: false,
    
    // UI Einstellungen
    animationEnabled: true,
    transitionDuration: 300,
    
    // Sicherheit
    allowExternalLinks: true,
    corsEnabled: false,
    
    // Standard Apps
    defaultApps: DEFAULT_APPS,
    
    // Entwickler Optionen
    debug: false,
    showConsole: false
};

// Hilfsfunktion für Debugging
function logDebug(message, data = null) {
    if (CONFIG.debug) {
        console.log(`[${CONFIG.appName}] ${message}`, data || '');
    }
}

logDebug('Config geladen', CONFIG);
