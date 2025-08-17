/**
 * SmartPromptz v2.1 - Core Application Functions
 * Essential functionality: forms, prompt generation, basic UI management
 * Dependencies: templates.js, storage.js, quality.js
 */

// Core instances and state variables - INITIALIZE LATER
let qualityAnalyzer = null;
let templateStorage = null;
let currentCategory = 'business';
let currentSection = null;
let selectedTemplate = null;
let isGenerating = false;
let editingTemplateId = null;

// Initialize core instances once dependencies are loaded
function initializeCore() {
    try {
        if (typeof PromptQualityAnalyzer !== 'undefined') {
            qualityAnalyzer = new PromptQualityAnalyzer();
            console.log('✅ PromptQualityAnalyzer initialized');
        }
        
        if (typeof CustomTemplateStorage !== 'undefined') {
            templateStorage = new CustomTemplateStorage();
            console.log('✅ CustomTemplateStorage initialized');
        }
        
        console.log('✅ Core initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing core:', error);
    }
}

// Wait for dependencies and initialize
function waitForDependencies() {
    const checkDependencies = () => {
        if (typeof PromptQualityAnalyzer !== 'undefined' && 
            typeof CustomTemplateStorage !== 'undefined') {
            initializeCore();
            return true;
        }
        return false;
    };
    
    // Try immediately
    if (checkDependencies()) return;
    
    // If not ready, wait
    const interval = setInterval(() => {
        if (checkDependencies()) {
            clearInterval(interval);
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(interval);
        console.warn('⚠️ Timeout waiting for dependencies');
    }, 5000);
}

// Start dependency check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
} else {
    waitForDependencies();
}

/**
 * FORM MANAGEMENT FUNCTIONS
 */

function clearAllFormFields() {
    const form = document.getElementById('promptForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea, select');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });
    
    // Clear any error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    updateFormStatus();
}

function updateFormStatus() {
    const form = document.getElementById('promptForm');
    if (!form) return;
    
    const isComplete = checkFormCompleteness();
    const generateBtn = document.getElementById('generateBtn');
    
    if (generateBtn) {
        generateBtn.disabled = !isComplete || isGenerating;
        generateBtn.textContent = isGenerating ? 'Generating...' : 'Generate Prompt';
    }
    
    // Update form visual state
    form.classList.toggle('form-complete', isComplete);
}

function checkFormCompleteness() {
    const form = document.getElementById('promptForm');
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            return false;
        }
    }
    
    return requiredFields.length > 0;
}

/**
 * PROMPT GENERATION FUNCTIONS
 */

function buildPrompt() {
    if (!selectedTemplate) {
        showToast('Please select a template first', 'error');
        return null;
    }
    
    const form = document.getElementById('promptForm');
    if (!form) return null;
    
    let prompt = selectedTemplate.template;
    const formData = new FormData(form);
    
    // Replace placeholders with form values
    for (let [key, value] of formData.entries()) {
        if (value.trim()) {
            const placeholder = `{${key}}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            prompt = prompt.replace(regex, value.trim());
        }
    }
    
    // Clean up any remaining placeholders
    prompt = prompt.replace(/\{[^}]+\}/g, '[PLACEHOLDER]');
    
    return prompt;
}

async function generatePrompt() {
    if (isGenerating) return;
    
    const form = document.getElementById('promptForm');
    const outputContainer = document.getElementById('promptOutput');
    
    if (!form || !outputContainer) {
        showToast('Required elements not found', 'error');
        return;
    }
    
    if (!checkFormCompleteness()) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    setLoadingState(true, 'generateBtn');
    
    try {
        const prompt = buildPrompt();
        
        if (!prompt) {
            throw new Error('Failed to build prompt');
        }
        
        // Display the generated prompt
        outputContainer.innerHTML = `
            <div class="prompt-result">
                <div class="prompt-header">
                    <h3>Generated Prompt</h3>
                    <div class="prompt-actions">
                        <button onclick="copyPromptToClipboard()" class="btn btn-primary" id="copyBtn">
                            📋 Copy to Clipboard
                        </button>
                    </div>
                </div>
                <div class="prompt-content">
                    <pre>${prompt}</pre>
                </div>
            </div>
        `;
        
        // Run quality analysis if available
        if (qualityAnalyzer) {
            try {
                const analysis = qualityAnalyzer.analyzePrompt(prompt);
                displayQualityAnalysis(analysis);
            } catch (error) {
                console.warn('Quality analysis failed:', error);
            }
        }
        
        // Show output section
        outputContainer.style.display = 'block';
        outputContainer.scrollIntoView({ behavior: 'smooth' });
        
        showToast('Prompt generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating prompt:', error);
        showToast('Failed to generate prompt. Please try again.', 'error');
    } finally {
        setLoadingState(false, 'generateBtn');
    }
}

function applyTemplateData() {
    if (!selectedTemplate) return;
    
    const form = document.getElementById('promptForm');
    if (!form) return;
    
    // Update form title and description
    const formTitle = document.querySelector('.form-title');
    const formDescription = document.querySelector('.form-description');
    
    if (formTitle) formTitle.textContent = selectedTemplate.name;
    if (formDescription) formDescription.textContent = selectedTemplate.description;
    
    // Generate form fields based on template
    generateFormFields();
    updateFormStatus();
}

function generateFormFields() {
    if (!selectedTemplate || !selectedTemplate.fields) return;
    
    const fieldsContainer = document.getElementById('formFields');
    if (!fieldsContainer) return;
    
    fieldsContainer.innerHTML = '';
    
    selectedTemplate.fields.forEach(field => {
        const fieldHTML = createFieldHTML(field);
        fieldsContainer.appendChild(fieldHTML);
    });
    
    // Add event listeners to new fields
    const inputs = fieldsContainer.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', updateFormStatus);
        input.addEventListener('blur', validateField);
    });
}

function createFieldHTML(field) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-group';
    
    const label = document.createElement('label');
    label.textContent = field.label + (field.required ? ' *' : '');
    label.setAttribute('for', field.id);
    
    let input;
    
    switch (field.type) {
        case 'textarea':
            input = document.createElement('textarea');
            input.rows = field.rows || 3;
            break;
        case 'select':
            input = document.createElement('select');
            field.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.label;
                input.appendChild(opt);
            });
            break;
        default:
            input = document.createElement('input');
            input.type = field.type || 'text';
    }
    
    input.id = field.id;
    input.name = field.id;
    input.placeholder = field.placeholder || '';
    
    if (field.required) {
        input.required = true;
    }
    
    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    
    return fieldDiv;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Validate required fields
    if (field.required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Validate email fields
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Validate URL fields
    if (field.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            showFieldError(field, 'Please enter a valid URL');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

/**
 * UI MANAGEMENT FUNCTIONS
 */

function toggleMode(mode) {
    const modes = ['template', 'custom'];
    const currentMode = modes.includes(mode) ? mode : 'template';
    
    modes.forEach(m => {
        const element = document.getElementById(`${m}Mode`);
        if (element) {
            element.style.display = m === currentMode ? 'block' : 'none';
        }
    });
    
    // Update active tab
    modes.forEach(m => {
        const tab = document.getElementById(`${m}Tab`);
        if (tab) {
            tab.classList.toggle('active', m === currentMode);
        }
    });
    
    // Update state
    document.body.setAttribute('data-mode', currentMode);
    
    if (currentMode === 'template' && selectedTemplate) {
        applyTemplateData();
    }
}

function setLoadingState(loading, buttonId = null) {
    isGenerating = loading;
    
    if (buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = loading;
            if (loading) {
                button.setAttribute('data-original-text', button.textContent);
                button.textContent = 'Loading...';
            } else {
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.textContent = originalText;
                    button.removeAttribute('data-original-text');
                }
            }
        }
    }
    
    // Update form status
    updateFormStatus();
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = getToastContainer();
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, duration);
}

function getToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * COPY & CLEAR FUNCTIONS
 */

async function copyPromptToClipboard() {
    const promptContent = document.querySelector('.prompt-content pre');
    if (!promptContent) {
        showToast('No prompt to copy', 'error');
        return;
    }
    
    const text = promptContent.textContent;
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            fallbackCopy(text);
        }
        showCopySuccess();
    } catch (error) {
        console.error('Failed to copy:', error);
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess();
        } else {
            throw new Error('Copy command failed');
        }
    } catch (error) {
        console.error('Fallback copy failed:', error);
        showToast('Failed to copy to clipboard', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

function showCopySuccess() {
    showToast('Prompt copied to clipboard!', 'success');
    
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }
}

function clearAllFields() {
    clearAllFormFields();
    
    const outputContainer = document.getElementById('promptOutput');
    if (outputContainer) {
        outputContainer.style.display = 'none';
        outputContainer.innerHTML = '';
    }
    
    showToast('All fields cleared', 'info');
}

/**
 * QUALITY ANALYSIS DISPLAY
 */

function displayQualityAnalysis(analysis) {
    if (!analysis) return;
    
    const outputContainer = document.getElementById('promptOutput');
    if (!outputContainer) return;
    
    const analysisHTML = `
        <div class="quality-analysis">
            <h4>Prompt Quality Analysis</h4>
            <div class="quality-score">
                <span class="score-label">Overall Score:</span>
                <span class="score-value ${getScoreClass(analysis.score)}">${analysis.score}/100</span>
            </div>
            <div class="quality-details">
                ${analysis.suggestions.map(suggestion => 
                    `<div class="suggestion ${suggestion.type}">
                        <strong>${suggestion.category}:</strong> ${suggestion.message}
                    </div>`
                ).join('')}
            </div>
        </div>
    `;
    
    outputContainer.insertAdjacentHTML('beforeend', analysisHTML);
}

function getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
}

/**
 * TEMPLATE EDITOR FUNCTIONS (Global for HTML onclick handlers)
 */

function openTemplateEditor() {
    editingTemplateId = null;
    const modal = document.getElementById('templateModal');
    const form = document.getElementById('templateForm');
    
    if (modal && form) {
        form.reset();
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function editTemplate(templateId) {
    if (!templateStorage) {
        showToast('Template storage not available', 'error');
        return;
    }
    
    const template = templateStorage.getTemplate(templateId);
    if (!template) {
        showToast('Template not found', 'error');
        return;
    }
    
    editingTemplateId = templateId;
    const modal = document.getElementById('templateModal');
    const form = document.getElementById('templateForm');
    
    if (modal && form) {
        // Populate form with template data
        form.templateName.value = template.name;
        form.templateDescription.value = template.description;
        form.templateContent.value = template.template;
        form.templateCategory.value = template.category;
        
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function deleteTemplate(templateId) {
    if (!templateStorage) {
        showToast('Template storage not available', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this template?')) {
        return;
    }
    
    try {
        templateStorage.deleteTemplate(templateId);
        showToast('Template deleted successfully', 'success');
        
        // Refresh template display if function exists
        if (typeof displayCustomTemplates === 'function') {
            displayCustomTemplates();
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        showToast('Failed to delete template', 'error');
    }
}

function duplicateTemplate(templateId) {
    if (!templateStorage) {
        showToast('Template storage not available', 'error');
        return;
    }
    
    const template = templateStorage.getTemplate(templateId);
    if (!template) {
        showToast('Template not found', 'error');
        return;
    }
    
    try {
        const duplicatedTemplate = {
            ...template,
            name: template.name + ' (Copy)',
            id: undefined // Let storage generate new ID
        };
        
        templateStorage.saveTemplate(duplicatedTemplate);
        showToast('Template duplicated successfully', 'success');
        
        // Refresh template display if function exists
        if (typeof displayCustomTemplates === 'function') {
            displayCustomTemplates();
        }
    } catch (error) {
        console.error('Error duplicating template:', error);
        showToast('Failed to duplicate template', 'error');
    }
}

// Make functions globally available for HTML onclick handlers
window.openTemplateEditor = openTemplateEditor;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.duplicateTemplate = duplicateTemplate;
window.generatePrompt = generatePrompt;
window.copyPromptToClipboard = copyPromptToClipboard;
window.clearAllFields = clearAllFields;
window.toggleMode = toggleMode;

/**
 * UTILITY FUNCTIONS
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

// Export functions for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        clearAllFormFields,
        updateFormStatus,
        checkFormCompleteness,
        buildPrompt,
        generatePrompt,
        applyTemplateData,
        toggleMode,
        setLoadingState,
        showToast,
        copyPromptToClipboard,
        clearAllFields,
        openTemplateEditor,
        editTemplate,
        deleteTemplate,
        duplicateTemplate
    };
}
