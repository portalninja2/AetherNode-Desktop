/**
 * AetherNode Desktop - Export/Import System
 * Einstellungen & Apps sichern und wiederherstellen
 */

class ExportImportManager {
    constructor() {
        this.setupExportImport();
        logDebug('ExportImportManager initialisiert');
    }
    
    /**
     * Setup Export/Import System
     */
    setupExportImport() {
        // Event Listeners werden in der globalen Funktion gesetzt
        this.updateBackupStats();
    }
    
    /**
     * Einstellungen exportieren
     */
    exportSettings() {
        const exportOptions = this.getExportOptions();
        const exportData = this.createExportData(exportOptions);
        
        // Dateiname generieren
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const filename = `aethernode-desktop-backup-${timestamp}.json`;
        
        // Download starten
        this.downloadJSON(exportData, filename);
        
        // Analytics & Feedback
        if (typeof LocalAnalytics !== 'undefined') {
            LocalAnalytics.logEvent('backup', 'export', Object.keys(exportData).join(','));
        }
        
        if (typeof Notifications !== 'undefined') {
            Notifications.success(`📥 Backup exportiert: ${filename}`);
        }
        
        logDebug('Settings exportiert', { filename, data: exportData });
    }
    
    /**
     * Export-Optionen lesen
     */
    getExportOptions() {
        return {
            apps: document.getElementById('exportApps')?.checked || false,
            settings: document.getElementById('exportSettings')?.checked || false,
            hotkeys: document.getElementById('exportHotkeys')?.checked || false,
            stats: document.getElementById('exportStats')?.checked || false
        };
    }
    
    /**
     * Export-Daten erstellen
     */
    createExportData(options) {
        const exportData = {
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            type: 'aethernode-desktop-backup'
        };
        
        if (options.apps) {
            exportData.apps = AppDataManager.getApps();
            exportData.appGroups = AppDataManager.getAppGroups();
            exportData.quickLaunchApps = AppDataManager.getQuickLaunchApps();
        }
        
        if (options.settings) {
            exportData.desktopLayout = AppDataManager.getDesktopLayout();
            exportData.pwaSettings = AppDataManager.getPWASettings();
        }
        
        if (options.hotkeys) {\n            exportData.customHotkeys = AppDataManager.getCustomHotkeys();\n        }\n        \n        if (options.stats) {\n            exportData.usageStats = AppDataManager.getUsageStats();\n            exportData.lastApp = AppDataManager.getLastApp();\n        }\n        \n        return exportData;\n    }\n    \n    /**\n     * JSON-Datei herunterladen\n     */\n    downloadJSON(data, filename) {\n        const jsonString = JSON.stringify(data, null, 2);\n        const blob = new Blob([jsonString], { type: 'application/json' });\n        const url = URL.createObjectURL(blob);\n        \n        const link = document.createElement('a');\n        link.href = url;\n        link.download = filename;\n        document.body.appendChild(link);\n        link.click();\n        document.body.removeChild(link);\n        \n        URL.revokeObjectURL(url);\n    }\n    \n    /**\n     * Import-Datei verarbeiten\n     */\n    handleImportFile(file) {\n        if (!file) return;\n        \n        const reader = new FileReader();\n        reader.onload = (e) => {\n            try {\n                const importData = JSON.parse(e.target.result);\n                this.showImportPreview(importData);\n            } catch (error) {\n                console.error('Import Fehler:', error);\n                if (typeof Notifications !== 'undefined') {\n                    Notifications.error('❌ Ungültige Backup-Datei!');\n                }\n            }\n        };\n        reader.readAsText(file);\n    }\n    \n    /**\n     * Import-Vorschau anzeigen\n     */\n    showImportPreview(data) {\n        const preview = document.getElementById('importPreview');\n        if (!preview) return;\n        \n        // Validierung\n        if (!this.validateImportData(data)) {\n            if (typeof Notifications !== 'undefined') {\n                Notifications.error('❌ Backup-Datei ist nicht kompatibel!');\n            }\n            return;\n        }\n        \n        // Statistiken erstellen\n        const stats = this.analyzeImportData(data);\n        \n        preview.innerHTML = `\n            <h4>📋 Import-Vorschau</h4>\n            <div class=\"preview-stats\">\n                ${stats.map(stat => `\n                    <div class=\"preview-stat\">\n                        <div class=\"preview-stat-value\">${stat.value}</div>\n                        <div class=\"preview-stat-label\">${stat.label}</div>\n                    </div>\n                `).join('')}\n            </div>\n            \n            <div class=\"import-info\">\n                <strong>Backup vom:</strong> ${new Date(data.timestamp).toLocaleString('de-DE')}<br>\n                <strong>Version:</strong> ${data.version || 'Unbekannt'}\n            </div>\n            \n            <div class=\"import-confirm\">\n                <button class=\"cancel-import-btn\" onclick=\"cancelImport()\">Abbrechen</button>\n                <button class=\"confirm-import-btn\" onclick=\"confirmImport()\">Importieren</button>\n            </div>\n        `;\n        \n        preview.style.display = 'block';\n        \n        // Daten für Import speichern\n        this.pendingImportData = data;\n    }\n    \n    /**\n     * Import-Daten validieren\n     */\n    validateImportData(data) {\n        // Basis-Validierung\n        if (!data || typeof data !== 'object') return false;\n        if (data.type !== 'aethernode-desktop-backup') return false;\n        if (!data.timestamp) return false;\n        \n        // Mindestens ein Datenbereich muss vorhanden sein\n        return data.apps || data.settings || data.hotkeys || data.stats || data.appGroups;\n    }\n    \n    /**\n     * Import-Daten analysieren\n     */\n    analyzeImportData(data) {\n        const stats = [];\n        \n        if (data.apps) {\n            stats.push({\n                value: data.apps.length,\n                label: 'Apps'\n            });\n        }\n        \n        if (data.appGroups) {\n            stats.push({\n                value: data.appGroups.length,\n                label: 'Gruppen'\n            });\n        }\n        \n        if (data.customHotkeys) {\n            stats.push({\n                value: Object.keys(data.customHotkeys).length,\n                label: 'Hotkeys'\n            });\n        }\n        \n        if (data.usageStats) {\n            stats.push({\n                value: Object.keys(data.usageStats).length,\n                label: 'Statistiken'\n            });\n        }\n        \n        return stats;\n    }\n    \n    /**\n     * Import bestätigen\n     */\n    confirmImport() {\n        if (!this.pendingImportData) return;\n        \n        const mergeMode = document.getElementById('mergeMode')?.checked || false;\n        \n        try {\n            this.performImport(this.pendingImportData, mergeMode);\n            \n            if (typeof Notifications !== 'undefined') {\n                Notifications.success('✅ Import erfolgreich abgeschlossen!');\n            }\n            \n            // Modal schließen\n            closeModal('exportImportModal');\n            \n            // UI neu laden\n            if (window.app) {\n                window.app.renderDesktop();\n                window.app.renderGroupsList();\n            }\n            \n        } catch (error) {\n            console.error('Import Fehler:', error);\n            if (typeof Notifications !== 'undefined') {\n                Notifications.error('❌ Import fehlgeschlagen!');\n            }\n        }\n    }\n    \n    /**\n     * Import durchführen\n     */\n    performImport(data, mergeMode) {\n        if (data.apps) {\n            if (mergeMode) {\n                // Zusammenführen\n                const existingApps = AppDataManager.getApps();\n                const existingIds = existingApps.map(app => app.id);\n                \n                data.apps.forEach(app => {\n                    if (!existingIds.includes(app.id)) {\n                        AppDataManager.addApp(app);\n                    }\n                });\n            } else {\n                // Ersetzen\n                localStorage.removeItem('aethernode_apps');\n                data.apps.forEach(app => {\n                    AppDataManager.addApp(app);\n                });\n            }\n        }\n        \n        if (data.appGroups) {\n            if (!mergeMode) {\n                AppDataManager.saveAppGroups([]);\n            }\n            \n            const existingGroups = AppDataManager.getAppGroups();\n            const existingGroupIds = existingGroups.map(g => g.id);\n            \n            data.appGroups.forEach(group => {\n                if (!existingGroupIds.includes(group.id)) {\n                    AppDataManager.addAppGroup(group);\n                }\n            });\n        }\n        \n        if (data.customHotkeys) {\n            AppDataManager.setCustomHotkeys(data.customHotkeys);\n        }\n        \n        if (data.desktopLayout) {\n            AppDataManager.setDesktopLayout(data.desktopLayout);\n        }\n        \n        if (data.pwaSettings) {\n            AppDataManager.setPWASettings(data.pwaSettings);\n        }\n        \n        if (data.quickLaunchApps) {\n            AppDataManager.setQuickLaunchApps(data.quickLaunchApps);\n        }\n        \n        if (data.usageStats && !mergeMode) {\n            // Nur bei vollständigem Ersetzen\n            Object.entries(data.usageStats).forEach(([appId, stats]) => {\n                AppDataManager.recordAppUsage(appId, stats.opens);\n            });\n        }\n        \n        if (data.lastApp) {\n            AppDataManager.setLastApp(data.lastApp);\n        }\n        \n        // Analytics\n        if (typeof LocalAnalytics !== 'undefined') {\n            LocalAnalytics.logEvent('backup', 'import', mergeMode ? 'merge' : 'replace');\n        }\n        \n        logDebug('Import abgeschlossen', { mergeMode, data });\n    }\n    \n    /**\n     * Import abbrechen\n     */\n    cancelImport() {\n        this.pendingImportData = null;\n        const preview = document.getElementById('importPreview');\n        if (preview) {\n            preview.style.display = 'none';\n        }\n    }\n    \n    /**\n     * Backup-Statistiken aktualisieren\n     */\n    updateBackupStats() {\n        const container = document.getElementById('backupStats');\n        if (!container) return;\n        \n        const apps = AppDataManager.getApps();\n        const groups = AppDataManager.getAppGroups();\n        const hotkeys = AppDataManager.getCustomHotkeys();\n        const usageStats = AppDataManager.getUsageStats();\n        \n        // Lokalen Speicher berechnen\n        let storageSize = 0;\n        Object.keys(localStorage).forEach(key => {\n            if (key.startsWith('aethernode_')) {\n                storageSize += localStorage[key].length;\n            }\n        });\n        \n        const stats = [\n            {\n                value: apps.length,\n                label: 'Apps installiert'\n            },\n            {\n                value: groups.length,\n                label: 'Gruppen erstellt'\n            },\n            {\n                value: Object.keys(hotkeys).length,\n                label: 'Custom Hotkeys'\n            },\n            {\n                value: Math.round(storageSize / 1024) + ' KB',\n                label: 'Speicher verwendet'\n            }\n        ];\n        \n        container.innerHTML = stats.map(stat => `\n            <div class=\"backup-stat\">\n                <div class=\"backup-stat-value\">${stat.value}</div>\n                <div class=\"backup-stat-label\">${stat.label}</div>\n            </div>\n        `).join('');\n    }\n}\n\n// Global Instance\nlet exportImportManager = null;\n\n// Global Functions\nwindow.openExportImport = function() {\n    const modal = document.getElementById('exportImportModal');\n    if (modal) {\n        modal.classList.add('show');\n        \n        if (!exportImportManager) {\n            exportImportManager = new ExportImportManager();\n        }\n        \n        exportImportManager.updateBackupStats();\n        \n        if (typeof LocalAnalytics !== 'undefined') {\n            LocalAnalytics.logEvent('tool', 'open', 'export-import');\n        }\n    }\n};\n\nwindow.exportSettings = function() {\n    if (exportImportManager) {\n        exportImportManager.exportSettings();\n    }\n};\n\nwindow.handleImportFile = function() {\n    const fileInput = document.getElementById('importFile');\n    const file = fileInput.files[0];\n    \n    if (file && exportImportManager) {\n        exportImportManager.handleImportFile(file);\n    }\n    \n    // Input zurücksetzen für erneute Auswahl\n    fileInput.value = '';\n};\n\nwindow.confirmImport = function() {\n    if (exportImportManager) {\n        exportImportManager.confirmImport();\n    }\n};\n\nwindow.cancelImport = function() {\n    if (exportImportManager) {\n        exportImportManager.cancelImport();\n    }\n};\n\n// Export für andere Module\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = { ExportImportManager };\n}\n\nlogDebug('ExportImportManager module geladen');