/**
 * AetherNode Desktop - Utilities
 * Nützliche Hilfsfunktionen und Extensions
 */

/**
 * Utility Funktionen
 */
const Utils = {
    /**
     * Validiert eine URL
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Extrahiert Domain aus URL
     */
    getDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (error) {
            return null;
        }
    },

    /**
     * Formatiert Datum
     */
    formatDate(date) {
        return new Date(date).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Formatiert Zeit Differenz (z.B. "vor 2 Minuten")
     */
    formatTimeDiff(timestamp) {
        const now = Date.now();
        const diff = now - new Date(timestamp).getTime();
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'gerade eben';
        if (minutes < 60) return `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
        if (hours < 24) return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
        if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
        
        return this.formatDate(timestamp);
    },

    /**
     * Debounce Funktion
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle Funktion
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep Clone
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Merge Objekte
     */
    merge(target, source) {
        return { ...target, ...source };
    },

    /**
     * Sortiere Array von Objekten
     */
    sortBy(array, key, ascending = true) {
        return [...array].sort((a, b) => {
            if (a[key] < b[key]) return ascending ? -1 : 1;
            if (a[key] > b[key]) return ascending ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filtere Array von Objekten
     */
    filterBy(array, key, value) {
        return array.filter(item => item[key] === value);
    },

    /**
     * Erstelle ID
     */
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Kopiere Text in Zwischenablage
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            logDebug('Text kopiert', text);
        }).catch(err => {
            console.error('Fehler beim Kopieren:', err);
        });
    },

    /**
     * Zeige Toast Benachrichtigung
     */
    showToast(message, duration = 3000, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Konvertiere Bytes zu lesbarer Größe
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Prüfe localStorage Verfügbarkeit
     */
    isLocalStorageAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Prüfe verfügbaren localStorage Platz
     */
    getAvailableStorage() {
        const test = 'x';
        let size = 0;
        try {
            for (let i = 0; i < 1024; i++) {
                size = i;
                localStorage.setItem(test, new Array((i + 1) * 65536).join('x'));
            }
        } catch (e) {
            localStorage.removeItem(test);
            return size * 64; // KB
        }
    },

    /**
     * URL Parameter auslesen
     */
    getUrlParam(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    },

    /**
     * Alle URL Parameter auslesen
     */
    getAllUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (let [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Set URL Parameter
     */
    setUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }
};

/**
 * Array Extensions
 */
Object.defineProperty(Array.prototype, 'groupBy', {
    value: function(fn) {
        return this.reduce((result, item) => {
            const key = fn(item);
            if (!result[key]) result[key] = [];
            result[key].push(item);
            return result;
        }, {});
    }
});

/**
 * String Extensions
 */
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
});

Object.defineProperty(String.prototype, 'truncate', {
    value: function(length) {
        return this.length > length ? this.substr(0, length - 1) + '…' : this;
    }
});

/**
 * Notification Service
 */
const Notifications = {
    success(message) {
        Utils.showToast(message, 3000, 'success');
    },

    error(message) {
        Utils.showToast(message, 4000, 'error');
    },

    info(message) {
        Utils.showToast(message, 3000, 'info');
    }
};

/**
 * Analytics/Tracking (lokal, keine externen Daten!)
 */
class LocalAnalytics {
    static logEvent(category, action, label = null) {
        const event = {
            timestamp: new Date().toISOString(),
            category: category,
            action: action,
            label: label
        };
        
        let events = appStorage.get('analytics_events') || [];
        events.push(event);
        
        // Begrenzen auf letzte 1000 Events
        if (events.length > 1000) {
            events = events.slice(-1000);
        }
        
        appStorage.set('analytics_events', events);
        logDebug('Event geloggt', event);
    }

    static getEvents(limit = 100) {
        const events = appStorage.get('analytics_events') || [];
        return events.slice(-limit);
    }

    static getStats() {
        const events = appStorage.get('analytics_events') || [];
        const stats = {
            totalEvents: events.length,
            byCategory: {},
            byAction: {},
            lastEvent: events[events.length - 1] || null
        };

        events.forEach(event => {
            stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;
            stats.byAction[event.action] = (stats.byAction[event.action] || 0) + 1;
        });

        return stats;
    }

    static clear() {
        appStorage.remove('analytics_events');
    }
}

logDebug('Utils Module geladen');
