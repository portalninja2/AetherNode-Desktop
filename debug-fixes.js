/**
 * Debug Fixes für AetherNode Desktop
 * Behebt Export/Import und Window-Restore Probleme
 */

// Export/Import Fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Debug Fixes werden geladen...');
    
    // Export/Import Button Fix
    setTimeout(function() {
        const exportImportBtn = document.getElementById('exportImportFromStart');
        if (exportImportBtn) {
            console.log('✅ Export/Import Button gefunden');
            
            // Alten Event Listener entfernen und neuen hinzufügen
            exportImportBtn.replaceWith(exportImportBtn.cloneNode(true));
            
            document.getElementById('exportImportFromStart').addEventListener('click', function() {
                console.log('🚀 Export/Import Button geklickt');
                
                const modal = document.getElementById('exportImportModal');
                if (modal) {
                    console.log('✅ Modal gefunden, wird geöffnet');
                    modal.classList.add('show');
                    
                    // Export/Import Manager initialisieren falls nötig
                    if (!window.exportImportManager && typeof ExportImportManager !== 'undefined') {
                        console.log('📦 ExportImportManager wird erstellt');
                        window.exportImportManager = new ExportImportManager();
                    }
                    
                    // Backup Stats aktualisieren
                    if (window.exportImportManager && window.exportImportManager.updateBackupStats) {
                        window.exportImportManager.updateBackupStats();
                    }
                    
                    // Export-Button Event Listener hinzufügen
                    setTimeout(function() {
                        const exportBtn = document.getElementById('exportBtn');
                        if (exportBtn) {
                            exportBtn.replaceWith(exportBtn.cloneNode(true));
                            document.getElementById('exportBtn').addEventListener('click', function() {
                                console.log('📤 Export Button geklickt');
                                if (typeof window.exportSettings === 'function') {
                                    window.exportSettings();
                                } else {
                                    console.error('❌ exportSettings Funktion nicht gefunden');
                                }
                            });
                            console.log('✅ Export Button Event Listener hinzugefügt');
                        } else {
                            console.error('❌ Export Button nicht gefunden');
                        }
                    }, 100);
                    
                } else {
                    console.error('❌ Modal nicht gefunden!');
                }
                
                // Start-Menü schließen
                const startMenu = document.getElementById('startMenu');
                if (startMenu) {
                    startMenu.classList.remove('show');
                }
            });
        } else {
            console.error('❌ Export/Import Button nicht gefunden');
        }
    }, 1000);
    
    // Window Restore Fix
    if (window.windowManager) {
        console.log('🪟 Window Manager Fixes werden angewendet');
        
        // Backup der ursprünglichen Methoden
        const originalRestoreWindow = window.windowManager.restoreWindow;
        const originalMinimizeWindow = window.windowManager.minimizeWindow;
        
        // Verbesserte restoreWindow Methode
        window.windowManager.restoreWindow = function(windowId) {
            console.log('🔄 Window Restore Fix für:', windowId);
            
            const windowData = this.windows.get(windowId);
            if (!windowData) return;
            
            windowData.minimized = false;
            const windowEl = document.getElementById(windowId);
            if (windowEl) {
                // Zuerst sichtbar machen
                windowEl.style.display = 'flex';
                
                // Position und Größe wiederherstellen
                if (windowData.maximized) {
                    windowEl.style.left = '0px';
                    windowEl.style.top = '0px';
                    windowEl.style.width = '100vw';
                    windowEl.style.height = 'calc(100vh - 40px)';
                    windowEl.classList.add('maximized');
                } else {
                    // Fallback-Werte verwenden falls Position verloren
                    const x = windowData.x || 100;
                    const y = windowData.y || 100;
                    const width = windowData.width || 800;
                    const height = windowData.height || 600;
                    
                    windowEl.style.left = x + 'px';
                    windowEl.style.top = y + 'px';
                    windowEl.style.width = width + 'px';
                    windowEl.style.height = height + 'px';
                    windowEl.classList.remove('maximized');
                }
                
                // Z-Index setzen
                windowEl.style.zIndex = windowData.zIndex;
                
                // Fokussieren
                this.focusWindow(windowId);
                
                console.log('✅ Window wiederhergestellt:', {
                    x: windowData.x,
                    y: windowData.y,
                    width: windowData.width,
                    height: windowData.height,
                    maximized: windowData.maximized
                });
            }
            
            this.updateTaskbar();
        };
        
        // Verbesserte minimizeWindow Methode
        window.windowManager.minimizeWindow = function(windowId) {
            console.log('📦 Window Minimize Fix für:', windowId);
            
            const windowData = this.windows.get(windowId);
            if (!windowData) return;
            
            const windowEl = document.getElementById(windowId);
            if (windowEl && !windowData.maximized) {
                // Aktuelle CSS-Position lesen und speichern
                const computedStyle = window.getComputedStyle(windowEl);
                windowData.x = parseInt(computedStyle.left) || windowData.x || 100;
                windowData.y = parseInt(computedStyle.top) || windowData.y || 100;
                windowData.width = parseInt(computedStyle.width) || windowData.width || 800;
                windowData.height = parseInt(computedStyle.height) || windowData.height || 600;
                
                console.log('💾 Position gespeichert:', {
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
        };
        
        console.log('✅ Window Manager Fixes angewendet');
    }
    
    // Global Export/Import Funktionen definieren
    if (!window.openExportImport) {
        window.openExportImport = function() {
            console.log('🚀 Global openExportImport aufgerufen');
            const modal = document.getElementById('exportImportModal');
            if (modal) {
                modal.classList.add('show');
                console.log('✅ Export/Import Modal geöffnet');
            } else {
                console.error('❌ Export/Import Modal nicht gefunden');
            }
        };
        
        window.exportSettings = function() {
            console.log('📤 exportSettings aufgerufen');
            
            // Fallback falls Manager nicht existiert
            if (!window.exportImportManager && typeof ExportImportManager !== 'undefined') {
                console.log('📷 ExportImportManager wird erstellt');
                window.exportImportManager = new ExportImportManager();
            }
            
            if (window.exportImportManager && window.exportImportManager.exportSettings) {
                window.exportImportManager.exportSettings();
            } else {
                console.error('❌ exportImportManager nicht verfügbar');
                // Manual Export als Fallback
                manualExport();
            }
        };
        
        // Manual Export Fallback
        function manualExport() {
            console.log('🚑 Manual Export Fallback');
            
            const exportData = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                type: 'aethernode-desktop-backup',
                apps: AppDataManager.getApps(),
                appGroups: AppDataManager.getAppGroups(),
                quickLaunchApps: AppDataManager.getQuickLaunchApps(),
                desktopLayout: AppDataManager.getDesktopLayout(),
                customHotkeys: AppDataManager.getCustomHotkeys(),
                usageStats: AppDataManager.getUsageStats()
            };
            
            // Download
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `aethernode-desktop-backup-${timestamp}.json`;
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log('✅ Manual Export abgeschlossen:', filename);
        }
        
        window.handleImportFile = function() {
            console.log('📥 handleImportFile aufgerufen');
            const fileInput = document.getElementById('importFile');
            const file = fileInput?.files[0];
            
            if (file && window.exportImportManager && window.exportImportManager.handleImportFile) {
                window.exportImportManager.handleImportFile(file);
                fileInput.value = '';
            } else {
                console.error('❌ Import handling nicht verfügbar');
            }
        };
        
        window.confirmImport = function() {
            console.log('✅ confirmImport aufgerufen');
            if (window.exportImportManager && window.exportImportManager.confirmImport) {
                window.exportImportManager.confirmImport();
            }
        };
        
        window.cancelImport = function() {
            console.log('❌ cancelImport aufgerufen');
            if (window.exportImportManager && window.exportImportManager.cancelImport) {
                window.exportImportManager.cancelImport();
            }
        };
        
        console.log('✅ Export/Import globale Funktionen definiert');
    }
    
    console.log('🎉 Debug Fixes erfolgreich geladen!');
    
    // Taschenrechner-App prüfen und hinzufügen falls nötig
    setTimeout(function() {
        const apps = AppDataManager.getApps();
        const hasCalculator = apps.some(app => app.id === 'calculator');
        
        if (!hasCalculator) {
            console.log('🧮 Taschenrechner-App wird hinzugefügt');
            const calculatorApp = {
                id: 'calculator',
                name: 'Taschenrechner',
                url: 'internal://calculator',
                icon: '🧮',
                category: 'utility',
                description: 'Integrierter Taschenrechner'
            };
            
            AppDataManager.addApp(calculatorApp);
            
            // UI aktualisieren falls App-Instanz verfügbar
            if (window.app) {
                window.app.apps = AppDataManager.getApps();
                if (window.app.renderDesktop) window.app.renderDesktop();
                if (window.app.renderAppGrid) window.app.renderAppGrid();
            }
            
            console.log('✅ Taschenrechner-App hinzugefügt und UI aktualisiert');
        } else {
            console.log('🧮 Taschenrechner-App bereits vorhanden');
        }
    }, 2000);
});

// Export/Import Manager Fix
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof ExportImportManager !== 'undefined' && !window.exportImportManager) {
            console.log('📦 ExportImportManager wird als Fallback erstellt');
            window.exportImportManager = new ExportImportManager();
        }
    }, 2000);
});