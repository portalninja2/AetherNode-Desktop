# AetherNode Desktop 🖥️

Eine modulare, lokal gespeicherte Desktop-ähnliche Suite zur Verwaltung aller AetherNode Anwendungen in einer einheitlichen Oberfläche.

## Features ✨

- **Desktop-ähnliche Oberfläche**: Elegantes Interface mit App-Icons und Sidebar
- **Lokal Gespeichert**: 100% LOCAL - Keine Daten auf Servern!
- **Iframe Integration**: Apps öffnen sich direkt in der Anwendung
- **Modular**: Einfach neue Apps hinzufügen oder entfernen
- **Verwaltung**: Apps über die Einstellungen hinzufügen, bearbeiten und löschen
- **Statistiken**: Nutzungsstatistiken werden lokal gespeichert
- **Backup & Restore**: Datenbackup und Wiederherstellung
- **Responsive Design**: Funktioniert auch auf kleineren Bildschirmen
- **Keyboard Shortcuts**: ESC = Schließen, Ctrl+Shift+S = Einstellungen, F5 = Reload

## Standard Apps

Die folgenden Apps sind vorinstalliert:

- 📝 **Notes & Tasks** - https://nat.aethernode.de
- 📅 **Calendar** - https://cal.aethernode.de
- 📊 **Projekte** - https://projects.aethernode.de
- 🛠️ **Tools** - https://tools.aethernode.de
- 👤 **Über mich** - https://dewbr.de

## Datenspeicherung 🔒

Alle Daten werden lokal im Browser gespeichert:

- **Apps Liste**: `localStorage` → `aethernode_apps`
- **UI Einstellungen**: `localStorage` → `aethernode_uiSettings`
- **Nutzungsstatistiken**: `localStorage` → `aethernode_usageStats`
- **Window States**: `localStorage` → `aethernode_windowStates`
- **Cache**: `localStorage` → `aethernode_appCache`

**Wichtig**: Beim Löschen der Browser-Daten werden auch diese Daten gelöscht!

## Struktur 📁

```
aethernode-desktop/
├── index.html          # Hauptseite & HTML Struktur
├── styles.css          # Alle Styles (Dark Theme)
├── config.js           # Konfiguration & Standard Apps
├── storage.js          # Lokale Speicherverwaltung
├── app.js              # Haupt-Anwendungslogik
└── README.md           # Diese Datei
```

## Installation 🚀

1. **Ordner in den Webserver kopieren**
   ```bash
   cp -r aethernode-desktop /var/www/html/
   ```

2. **Im Browser öffnen**
   ```
   http://localhost/aethernode-desktop/
   ```

3. **Fertig!** Alle Apps sind sofort verfügbar

## Verwendung 💻

### Apps starten
- Klick auf ein App-Icon in der Sidebar oder dem Raster
- App öffnet sich im Iframe

### Neue Apps hinzufügen
1. ⚙️ "Einstellungen" klicken
2. "Neue Anwendung hinzufügen" Formular ausfüllen
3. App wird sofort gespeichert und angezeigt

### App in neuem Fenster öffnen
- Button "↗ Extern" in der App-Header Bar
- Oder: Doppelklick auf App-Icon im Raster

### App neu laden
- Button "🔄 Neuladen" in der App-Header Bar
- Oder: F5 Taste drücken

## Konfiguration 🔧

Die Konfiguration befindet sich in `config.js`:

```javascript
const CONFIG = {
    appName: 'AetherNode Desktop',
    version: '1.0.0',
    useIframe: true,
    iframeTimeout: 30000,
    debug: false,
    // ...
}
```

## Erweiterung 🧩

### Neue App programmativ hinzufügen

```javascript
const newApp = {
    id: 'meine-app',
    name: 'Meine App',
    url: 'https://example.com',
    icon: '🎨',
    category: 'custom',
    description: 'Beschreibung'
};

AppDataManager.addApp(newApp);
app.apps = AppDataManager.getApps();
app.renderSidebar();
app.renderAppGrid();
```

### Config anpassen

Bearbeite `config.js` um neue Standard-Apps zu definieren:

```javascript
const DEFAULT_APPS = [
    {
        id: 'meine-app',
        name: 'Meine App',
        url: 'https://example.com',
        icon: '🎨',
        category: 'custom',
        description: 'Beschreibung'
    },
    // ... weitere Apps
];
```

## API & Funktionen 📚

### AppDataManager

```javascript
// Apps verwalten
AppDataManager.getApps()           // Alle Apps abrufen
AppDataManager.addApp(app)         // App hinzufügen
AppDataManager.removeApp(appId)    // App löschen
AppDataManager.updateApp(id, updates) // App aktualisieren

// Einstellungen
AppDataManager.setUISettings(settings)
AppDataManager.getUISettings()

// Statistiken
AppDataManager.recordAppUsage(appId)
AppDataManager.getUsageStats()

// Backup
AppDataManager.createBackup()
AppDataManager.restoreFromBackup(backup)
```

### App Klasse

```javascript
app.openApp(app)                   // App öffnen
app.closeCurrentApp()              // Aktuelle App schließen
app.reloadCurrentApp()             // Aktuelle App neu laden
app.openCurrentAppExternal()       // Im neuen Fenster öffnen
```

## Sicherheit 🔐

- ✅ Alle Daten lokal im Browser
- ✅ Keine externen Serverzugriffe für Konfiguration
- ✅ Iframe Sandbox für App-Isolation
- ✅ Keine Cookies außerhalb des Browsers
- ⚠️ Apps können weiterhin mit ihren eigenen Servern kommunizieren

## Browser Kompatibilität 🌐

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Benötigt: localStorage und iframes

## Tipps & Tricks 💡

1. **Schneller Zugriff**: Nutze Keyboard Shortcuts
2. **Backup erstellen**: Exportiere deine Konfiguration regelmäßig
3. **Custom Icons**: Nutze beliebige Emojis oder Symbole
4. **Dark Mode**: Ist bereits eingebaut und aktiv

## Troubleshooting 🔧

### "Iframe konnte nicht geladen werden"
- Prüfe die URL in den Einstellungen
- Manche externe Seiten verbieten Iframes (X-Frame-Options Header)
- Öffne die App stattdessen extern

### "Daten werden nicht gespeichert"
- Prüfe ob localStorage aktiviert ist
- Nicht alle Browser unterstützen es im Private/Incognito Mode
- Prüfe Browser-Konsole auf Fehler

### "App erscheint nicht"
- Aktualisiere die Seite (F5)
- Leere den Browser-Cache
- Prüfe die Browser-Konsole auf JavaScript Fehler

## Support & Fragen ❓

Kontakt: https://dewbr.de

## Lizenz 📄

Erstellt für AetherNode - Alle Rechte vorbehalten

---

**Version**: 1.0.0  
**Zuletzt aktualisiert**: 2026  
**Status**: ✅ Produktiv
