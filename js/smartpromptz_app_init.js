/**
 * SmartPromptz v2.1 - Initialization & Event Binding
 * Initialization, event binding, startup logic
 * Dependencies: All other modules (app-core.js, app-templates.js, app-export.js)
 */

/**
 * APPLICATION STATE
 */

const APP_CONFIG = {
    version: '2.1',
    name: 'SmartPromptz',
    defaultCategory: 'business',
    maxHistoryItems: 100,
    autoSaveDelay: 1000,
    toastDuration: 3000
};

let appInitialized = false;
let dependenciesLoaded = false;

/**
 * DEPENDENCY CHECKING
 */

function checkDependencies() {
    const requiredGlobals = [
        'templatesByCategory',
        'sectionCategories', 
        'CustomTemplateStorage',
        'PromptQualityAnalyzer'
    ];
    
    const requiredFunctions = [
        'generatePrompt',
        'clearAllFields',
        'toggleMode',
        'displayTemplates',
        'switchCategory',
        'exportCurrentPrompt'
    ];
    
    // Check global objects from templates.js, storage.js, quality.js
    const missingGlobals = requiredGlobals.filter(name => typeof window[name] === 'undefined');
    
    // Check functions from app-core.js, app-templates.js, app-export.js
    const missingFunctions = requiredFunctions.filter(name => typeof window[name] !== 'function');
    
    if (missingGlobals.length > 0) {
        console.warn('Missing global dependencies:', missingGlobals);
        return false;
    }
    
    if (missingFunctions.length > 0) {
        console.warn('Missing function dependencies:', missingFunctions);
        return false;
    }
    
    return true;
}

function waitForDependencies() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (checkDependencies()) {
                clearInterval(checkInterval);
                dependenciesLoaded = true;
                resolve();
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!dependenciesLoaded) {
                console.error('Timeout waiting for dependencies');
                showFallbackError();
            }
        }, 10000);
    });
}

/**
 * EVENT BINDING FUNCTIONS
 */

function bindFormEvents() {
    const form = document.getElementById('promptForm');
    if (!form) return;
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (typeof generatePrompt === 'function') {
            generatePrompt();
        }
    });
    
    // Form field changes
    const formInputs = form.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            if (typeof updateFormStatus === 'function') {
                updateFormStatus();
            }
        }, 300));
        
        input.addEventListener('blur', (e) => {
            if (typeof validateField === 'function') {
                validateField(e);
            }
        });
    });
    
    console.log('✅ Form events bound');
}

function bindNavigationEvents() {
    // Mode switching tabs
    const templateTab = document.getElementById('templateTab');
    const customTab = document.getElementById('customTab');
    
    if (templateTab) {
        templateTab.addEventListener('click', () => {
            if (typeof toggleMode === 'function') {
                toggleMode('template');
            }
        });
    }
    
    if (customTab) {
        customTab.addEventListener('click', () => {
            if (typeof toggleMode === 'function') {
                toggleMode('custom');
            }
        });
    }
    
    // Navigation buttons
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (typeof generatePrompt === 'function') {
                generatePrompt();
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (typeof clearAllFields === 'function') {
                clearAllFields();
            }
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof showExportModal === 'function') {
                showExportModal();
            }
        });
    }
    
    console.log('✅ Navigation events bound');
}

function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter = Generate prompt
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (typeof generatePrompt === 'function') {
                generatePrompt();
            }
        }
        
        // Ctrl/Cmd + K = Clear fields
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (typeof clearAllFields === 'function') {
                clearAllFields();
            }
        }
        
        // Ctrl/Cmd + E = Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (typeof showExportModal === 'function') {
                showExportModal();
            }
        }
        
        // Escape = Close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + S = Save template (when in template editor)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            const templateModal = document.getElementById('templateModal');
            if (templateModal && templateModal.style.display === 'block') {
                e.preventDefault();
                if (typeof saveTemplate === 'function') {
                    saveTemplate();
                }
            }
        }
    });
    
    console.log('✅ Keyboard shortcuts bound');
}

function bindWindowEvents() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Refresh templates in case they were updated in another tab
            if (typeof displayTemplates === 'function') {
                displayTemplates();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        adjustLayoutForViewport();
    }, 250));
    
    // Handle beforeunload for unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        showToast('Connection restored', 'success', 2000);
    });
    
    window.addEventListener('offline', () => {
        showToast('You are offline. Some features may be limited.', 'warning', 5000);
    });
    
    console.log('✅ Window events bound');
}

function bindTemplateEvents() {
    // Category switching (handled by template system, but we add analytics)
    document.addEventListener('categoryChanged', (e) => {
        const category = e.detail?.category;
        if (category) {
            trackEvent('category_switch', { category });
        }
    });
    
    // Template selection (handled by template system)
    document.addEventListener('templateSelected', (e) => {
        const template = e.detail?.template;
        if (template) {
            trackEvent('template_select', { template: template.name, category: template.category });
        }
    });
    
    console.log('✅ Template events bound');
}

/**
 * INITIALIZATION FUNCTIONS
 */

function initializeUI() {
    // Set initial mode
    if (typeof toggleMode === 'function') {
        toggleMode('template');
    }
    
    // Set initial category
    if (typeof switchCategory === 'function') {
        switchCategory(APP_CONFIG.defaultCategory);
    }
    
    // Initialize form status
    if (typeof updateFormStatus === 'function') {
        updateFormStatus();
    }
    
    // Display templates
    if (typeof displayTemplates === 'function') {
        displayTemplates();
    }
    
    // Adjust layout
    adjustLayoutForViewport();
    
    console.log('✅ UI initialized');
}

function initializeStorage() {
    // Initialize custom template storage
    if (typeof CustomTemplateStorage !== 'undefined' && !window.templateStorage) {
        window.templateStorage = new CustomTemplateStorage();
    }
    
    // Initialize quality analyzer
    if (typeof PromptQualityAnalyzer !== 'undefined' && !window.qualityAnalyzer) {
        window.qualityAnalyzer = new PromptQualityAnalyzer();
    }
    
    // Load user preferences
    loadUserPreferences();
    
    console.log('✅ Storage initialized');
}

function initializeAnalytics() {
    // Track app startup
    trackEvent('app_start', {
        version: APP_CONFIG.version,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    });
    
    // Track performance
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        trackEvent('app_performance', {
            loadTime: loadTime,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart
        });
    }
    
    console.log('✅ Analytics initialized');
}

/**
 * UTILITY FUNCTIONS
 */

function adjustLayoutForViewport() {
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // Add responsive classes
    document.body.classList.toggle('mobile', viewport.width < 768);
    document.body.classList.toggle('tablet', viewport.width >= 768 && viewport.width < 1024);
    document.body.classList.toggle('desktop', viewport.width >= 1024);
    
    // Adjust modal sizes on mobile
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (viewport.width < 768) {
            modal.style.width = '95%';
            modal.style.height = '90%';
        } else {
            modal.style.width = '';
            modal.style.height = '';
        }
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

function hasUnsavedChanges() {
    const templateModal = document.getElementById('templateModal');
    const templateForm = document.getElementById('templateForm');
    
    if (templateModal && templateModal.style.display === 'block' && templateForm) {
        const formData = new FormData(templateForm);
        return Array.from(formData.values()).some(value => value.trim() !== '');
    }
    
    return false;
}

function loadUserPreferences() {
    try {
        const prefs = JSON.parse(localStorage.getItem('smartpromptz_preferences') || '{}');
        
        // Apply theme preference
        if (prefs.theme) {
            document.body.classList.add(`theme-${prefs.theme}`);
        }
        
        // Apply category preference
        if (prefs.defaultCategory && typeof switchCategory === 'function') {
            switchCategory(prefs.defaultCategory);
        }
        
        // Apply other preferences
        if (prefs.autoSave !== undefined) {
            APP_CONFIG.autoSaveDelay = prefs.autoSave ? 1000 : 0;
        }
        
        console.log('✅ User preferences loaded');
        
    } catch (error) {
        console.warn('Failed to load user preferences:', error);
    }
}

function saveUserPreferences(prefs) {
    try {
        const currentPrefs = JSON.parse(localStorage.getItem('smartpromptz_preferences') || '{}');
        const updatedPrefs = { ...currentPrefs, ...prefs };
        localStorage.setItem('smartpromptz_preferences', JSON.stringify(updatedPrefs));
    } catch (error) {
        console.warn('Failed to save user preferences:', error);
    }
}

function trackEvent(eventName, data = {}) {
    // Simple analytics tracking - can be extended with real analytics
    const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        data: data
    };
    
    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('📊 Event:', event);
    }
    
    // Store in localStorage for analytics
    try {
        const events = JSON.parse(localStorage.getItem('smartpromptz_events') || '[]');
        events.push(event);
        
        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }
        
        localStorage.setItem('smartpromptz_events', JSON.stringify(events));
    } catch (error) {
        console.warn('Failed to store analytics event:', error);
    }
}

function showFallbackError() {
    const errorHTML = `
        <div class="fallback-error">
            <h2>⚠️ Loading Error</h2>
            <p>Some application components failed to load properly.</p>
            <p>Please try refreshing the page, or check the browser console for details.</p>
            <button onclick="window.location.reload()" class="btn btn-primary">
                🔄 Refresh Page
            </button>
        </div>
    `;
    
    document.body.innerHTML = errorHTML;
}

function displayLoadingScreen() {
    const loadingHTML = `
        <div class="loading-screen">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>Loading SmartPromptz...</h2>
                <p>Initializing application components</p>
            </div>
        </div>
    `;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = loadingHTML;
    loadingDiv.id = 'loadingScreen';
    document.body.appendChild(loadingDiv);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.remove();
        }, 300);
    }
}

/**
 * MAIN INITIALIZATION FUNCTION
 */

async function initializeApp() {
    if (appInitialized) {
        console.warn('App already initialized');
        return;
    }
    
    console.log('🚀 Starting SmartPromptz v' + APP_CONFIG.version);
    
    try {
        // Show loading screen
        displayLoadingScreen();
        
        // Wait for all dependencies to load
        console.log('⏳ Waiting for dependencies...');
        await waitForDependencies();
        
        if (!dependenciesLoaded) {
            throw new Error('Dependencies failed to load');
        }
        
        console.log('✅ Dependencies loaded');
        
        // Initialize components in order
        initializeStorage();
        initializeUI();
        
        // Bind all events
        bindFormEvents();
        bindNavigationEvents();
        bindKeyboardShortcuts();
        bindWindowEvents();
        bindTemplateEvents();
        
        // Initialize analytics last
        initializeAnalytics();
        
        // Hide loading screen
        hideLoadingScreen();
        
        // Mark as initialized
        appInitialized = true;
        
        // Show success message
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast('SmartPromptz ready! 🎉', 'success', 2000);
            }
        }, 500);
        
        console.log('🎉 SmartPromptz initialized successfully!');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('smartpromptzReady', {
            detail: { version: APP_CONFIG.version }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        hideLoadingScreen();
        showFallbackError();
    }
}

/**
 * UTILITY HELPERS
 */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available
window.initializeApp = initializeApp;
window.trackEvent = trackEvent;
window.saveUserPreferences = saveUserPreferences;

/**
 * AUTO-INITIALIZATION
 */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM already loaded, initialize immediately
    initializeApp();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        checkDependencies,
        trackEvent,
        APP_CONFIG
    };
}