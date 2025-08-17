// SmartPromptz v2.1 - Core Application Logic
// Essential functionality: forms, prompt generation, basic UI management

// Initialize core managers and state
const qualityAnalyzer = new PromptQualityAnalyzer();
const templateStorage = new CustomTemplateStorage();

// Application state variables
let currentCategory = null;
let currentSection = null;
let selectedTemplate = null;
let isGenerating = false;
let editingTemplateId = null;

// ============================================================================
// FORM MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Clear all form fields and reset application state
 */
function clearAllFormFields() {
  const fields = ['role', 'goal', 'context', 'format', 'tone', 'constraints', 'examples'];
  
  fields.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = '';
      element.removeAttribute('data-template-value');
    }
  });
  
  // Reset state
  selectedTemplate = null;
  
  // Remove selection from all templates
  document.querySelectorAll('.template-option').forEach(option => {
    option.classList.remove('selected');
  });

  // Hide quality analysis and reset output
  const qualitySection = document.getElementById('promptQualitySection');
  if (qualitySection) qualitySection.classList.remove('show');
  
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = '<div class="output-placeholder"><i data-lucide="wand-2"></i>Your custom-generated prompt will appear here...</div>';
  }
  
  const instructions = document.getElementById('usage-instructions');
  if (instructions) instructions.style.display = 'none';

  const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');
  if (saveAsTemplateBtn) saveAsTemplateBtn.style.display = 'none';
  
  updateFormStatus();
  
  // Refresh Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Update the form status indicator based on current form state
 */
function updateFormStatus() {
  const formStatus = document.getElementById('formStatus');
  if (!formStatus) return;
  
  const goal = document.getElementById('goal');
  const goalValue = goal ? goal.value.trim() : '';
  const emptyFields = checkFormCompleteness();
  
  if (!goalValue) {
    formStatus.className = 'form-status';
    formStatus.innerHTML = '<span class="status-icon">ℹ️</span><span class="status-text">Goal required to generate prompt</span>';
  } else if (emptyFields.length > 4) {
    formStatus.className = 'form-status';
    formStatus.innerHTML = '<span class="status-icon">⚠️</span><span class="status-text">Basic prompt ready - add more details for better results</span>';
  } else if (emptyFields.length > 2) {
    formStatus.className = 'form-status good';
    formStatus.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Good prompt quality - consider adding examples</span>';
  } else {
    formStatus.className = 'form-status ready';
    formStatus.innerHTML = '<span class="status-icon">✨</span><span class="status-text">Prompt ready for generation</span>';
  }
}

/**
 * Check which form fields are empty (only visible fields)
 * @returns {Array} Array of empty field IDs
 */
function checkFormCompleteness() {
  const fields = ['role', 'context', 'format', 'tone', 'constraints', 'examples'];
  const emptyFields = [];
  
  fields.forEach(function(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return;
    
    // Check if field is visible
    const fieldGroup = element.closest('.template-only-fields, .custom-only-fields');
    if (fieldGroup) {
      const computedStyle = window.getComputedStyle(fieldGroup);
      if (computedStyle.display === 'none') {
        return; // Skip hidden fields
      }
    }
    
    const value = element.value.trim();
    if (!value) {
      emptyFields.push(fieldId);
    }
  });
  
  return emptyFields;
}

// ============================================================================
// PROMPT GENERATION FUNCTIONS
// ============================================================================

/**
 * Build the final prompt using visible and hidden template values
 * @returns {string} The complete formatted prompt
 */
function buildPrompt() {
  const formData = {};
  const fields = ['role', 'goal', 'context', 'format', 'tone', 'constraints', 'examples'];
  
  // Collect form data (visible or template values)
  fields.forEach(field => {
    const element = document.getElementById(field);
    if (!element) return;
    
    const fieldGroup = element.closest('.template-only-fields, .custom-only-fields');
    const isVisible = fieldGroup ? window.getComputedStyle(fieldGroup).display !== 'none' : true;
    
    if (isVisible) {
      // Use visible field value
      formData[field] = element.value.trim();
    } else {
      // Use hidden template value if available
      const templateValue = element.getAttribute('data-template-value');
      formData[field] = templateValue || element.value.trim();
    }
  });
  
  // Build the structured prompt
  let prompt = "";
  
  if (formData.role) {
    prompt += formData.role + '\n\n';
  }
  
  if (formData.goal) {
    prompt += 'Your task: ' + formData.goal + '\n\n';
  }
  
  if (formData.context) {
    prompt += 'Context: ' + formData.context + '\n\n';
  }
  
  if (formData.format) {
    const formatMap = {
      'paragraph': 'Provide your response in well-structured paragraphs',
      'list': 'Format your response as a clear, numbered or bulleted list',
      'table': 'Present information in a structured table format',
      'code': 'Provide code examples with proper formatting and comments',
      'dialogue': 'Write in dialogue or conversation format',
      'step-by-step': 'Break down your response into clear, sequential steps'
    };
    
    prompt += 'Format: ' + (formatMap[formData.format] || formData.format) + '\n\n';
  }
  
  if (formData.tone) {
    prompt += 'Tone and style: ' + formData.tone + '\n\n';
  }
  
  if (formData.constraints) {
    prompt += 'Important constraints: ' + formData.constraints + '\n\n';
  }
  
  if (formData.examples) {
    prompt += 'Examples of desired output:\n' + formData.examples + '\n\n';
  }
  
  prompt += "Please provide your response following all the above guidelines and requirements.";
  
  return prompt;
}

/**
 * Generate the final prompt and display it
 */
function generatePrompt() {
  if (isGenerating) return;
  
  const goal = document.getElementById('goal');
  const goalValue = goal ? goal.value.trim() : '';
  
  if (!goalValue) {
    showToast('Please enter a goal for your prompt first.', 'error');
    if (goal) goal.focus();
    return;
  }
  
  setLoadingState(true);
  
  setTimeout(() => {
    try {
      const prompt = buildPrompt();
      
      const outputElement = document.getElementById('output');
      if (outputElement) {
        outputElement.textContent = prompt;
        outputElement.classList.remove('output-placeholder');
      }
      
      const instructionsElement = document.getElementById('usage-instructions');
      if (instructionsElement) {
        instructionsElement.style.display = 'block';
      }

      const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');
      if (saveAsTemplateBtn && document.querySelector('.form-section').classList.contains('custom-mode')) {
        saveAsTemplateBtn.style.display = 'flex';
      }
      
      // Smooth scroll to output
      setTimeout(() => {
        const outputSection = outputElement.closest('.output-section');
        if (outputSection) {
          outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
      showToast('Professional prompt generated successfully! Ready to copy and use in any AI assistant.');
      
    } catch (error) {
      console.error('Error generating prompt:', error);
      showToast('Error generating prompt. Please try again.', 'error');
    } finally {
      setLoadingState(false);
    }
  }, 800);
}

/**
 * Apply template data to form fields
 * @param {Object} template - Template object with field values
 */
function applyTemplateData(template) {
  const fields = ['role', 'goal', 'context', 'tone', 'format', 'constraints', 'examples'];
  
  fields.forEach(field => {
    const element = document.getElementById(field);
    if (element && template[field]) {
      element.value = template[field];
      element.setAttribute('data-template-value', template[field]);
    }
  });
  
  updateFormStatus();
  qualityAnalyzer.updateQualityDisplay();
}

// ============================================================================
// UI MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Toggle between template and custom modes
 * @param {string} mode - 'template' or 'custom'
 */
function toggleMode(mode) {
  const templateCategories = document.getElementById('templateCategories');
  const formSection = document.querySelector('.form-section');
  const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');
  const formStatus = document.getElementById('formStatus');
  
  clearAllFormFields();
  
  if (mode === 'template') {
    templateCategories.classList.add('show');
    if (formSection) {
      formSection.classList.remove('custom-mode');
      formSection.classList.add('template-mode');
      formSection.style.display = 'none';
    }
    if (formStatus) formStatus.style.display = 'none';
    if (saveAsTemplateBtn) saveAsTemplateBtn.style.display = 'none';
  } else {
    templateCategories.classList.remove('show');
    if (formSection) {
      formSection.classList.remove('template-mode');
      formSection.classList.add('custom-mode');
      formSection.style.display = 'block';
    }
    if (formStatus) formStatus.style.display = 'flex';
    if (saveAsTemplateBtn) saveAsTemplateBtn.style.display = 'flex';
  }
  
  // Update radio button states
  const radioOptions = document.querySelectorAll('.radio-option');
  const radioInputs = document.querySelectorAll('input[name="mode"]');
  
  radioOptions.forEach(option => {
    option.classList.remove('active');
    option.setAttribute('aria-pressed', 'false');
  });
  
  radioInputs.forEach(input => {
    if (input.value === mode) {
      input.checked = true;
      const option = input.closest('.radio-option');
      if (option) {
        option.classList.add('active');
        option.setAttribute('aria-pressed', 'true');
      }
    }
  });
  
  updateFormStatus();
}

/**
 * Set loading state for buttons
 * @param {boolean} isLoading - Whether to show loading state
 * @param {string} buttonId - ID of button to update (default: 'generateBtn')
 */
function setLoadingState(isLoading, buttonId = 'generateBtn') {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  isGenerating = isLoading;
  
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const span = button.querySelector('span');
    if (span) span.style.opacity = '0';
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    button.setAttribute('aria-busy', 'false');
    const span = button.querySelector('span');
    if (span) span.style.opacity = '1';
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'success', duration = 4000) {
  // Remove existing toast
  const existingToast = document.getElementById('current-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.id = 'current-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-message">' + message + '</span>';
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================================
// COPY & CLEAR FUNCTIONS
// ============================================================================

/**
 * Copy the generated prompt to clipboard
 */
function copyPromptToClipboard() {
  const outputElement = document.getElementById('output');
  if (!outputElement) {
    showToast('Output element not found.', 'error');
    return;
  }
  
  const promptText = outputElement.textContent;
  
  if (!promptText || promptText.includes('Your custom-generated prompt will appear here')) {
    showToast('Please generate a prompt first.', 'error');
    return;
  }
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(promptText).then(() => {
      showCopySuccess();
      showToast('Copied to clipboard! Ready to paste into ChatGPT, Claude, or any AI assistant.');
    }).catch(() => {
      fallbackCopy(promptText);
    });
  } else {
    fallbackCopy(promptText);
  }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, text.length);
  
  const success = document.execCommand('copy');
  document.body.removeChild(textArea);
  
  if (success) {
    showCopySuccess();
    showToast('Copied to clipboard! Ready to paste into ChatGPT, Claude, or any AI assistant.');
  } else {
    showToast('Please manually select the text above and press Ctrl+C (Cmd+C on Mac).', 'error');
  }
}

/**
 * Show copy success message
 */
function showCopySuccess() {
  const successElement = document.getElementById('copy-success');
  if (successElement) {
    successElement.style.display = 'inline';
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 3000);
  }
}

/**
 * Clear all fields with confirmation
 */
function clearAllFields() {
  if (!confirm('Clear all fields and start over?')) return;
  
  clearAllFormFields();
  showToast('All fields cleared! Ready for a fresh start.', 'success');
}

// ============================================================================
// TEMPLATE MODAL FUNCTIONS (Global scope for HTML onclick handlers)
// ============================================================================

/**
 * Open template editor modal
 * @param {string|null} templateId - ID of template to edit, null for new
 */
function openTemplateEditor(templateId = null) {
  editingTemplateId = templateId;
  const modal = document.getElementById('templateEditor');
  const modalTitle = document.getElementById('modalTitle');
  
  if (templateId) {
    const templates = templateStorage.getTemplates();
    const template = templates[templateId];
    if (!template) return;
    
    modalTitle.innerHTML = '<i data-lucide="edit"></i>Edit Custom Template';
    populateEditorForm(template);
  } else {
    modalTitle.innerHTML = '<i data-lucide="plus-circle"></i>Create Custom Template';
    populateEditorFromCurrentForm();
  }
  
  modal.classList.add('show');
  document.getElementById('templateName').focus();
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Populate editor form with template data
 * @param {Object} template - Template object
 */
function populateEditorForm(template) {
  const fields = {
    'templateName': 'name',
    'templateDescription': 'description',
    'templateRole': 'role',
    'templateGoal': 'goal',
    'templateContext': 'context',
    'templateTone': 'tone',
    'templateFormat': 'format',
    'templateConstraints': 'constraints',
    'templateExamples': 'examples'
  };
  
  Object.keys(fields).forEach(fieldId => {
    const element = document.getElementById(fieldId);
    const templateField = fields[fieldId];
    if (element) {
      element.value = template[templateField] || '';
    }
  });
}

/**
 * Populate editor form from current form values
 */
function populateEditorFromCurrentForm() {
  const formFields = {
    'templateName': '',
    'templateDescription': '',
    'templateRole': 'role',
    'templateGoal': 'goal',
    'templateContext': 'context',
    'templateTone': 'tone',
    'templateFormat': 'format',
    'templateConstraints': 'constraints',
    'templateExamples': 'examples'
  };
  
  Object.keys(formFields).forEach(fieldId => {
    const element = document.getElementById(fieldId);
    const sourceField = formFields[fieldId];
    
    if (element) {
      if (sourceField) {
        const sourceElement = document.getElementById(sourceField);
        element.value = sourceElement ? sourceElement.value || '' : '';
      } else {
        element.value = '';
      }
    }
  });
}

/**
 * Close template editor modal
 */
function closeTemplateEditor() {
  const modal = document.getElementById('templateEditor');
  modal.classList.remove('show');
  editingTemplateId = null;
  
  // Clear form
  const fields = ['templateName', 'templateDescription', 'templateRole', 'templateGoal', 
                 'templateContext', 'templateTone', 'templateFormat', 'templateConstraints', 'templateExamples'];
  fields.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = '';
  });
}

/**
 * Save the current template
 */
function saveTemplate() {
  const name = document.getElementById('templateName').value.trim();
  const description = document.getElementById('templateDescription').value.trim();
  
  if (!name) {
    showToast('Please enter a template name', 'error');
    document.getElementById('templateName').focus();
    return;
  }

  const goal = document.getElementById('templateGoal').value.trim();
  if (!goal) {
    showToast('Please enter a goal for your template', 'error');
    document.getElementById('templateGoal').focus();
    return;
  }
  
  const template = {
    name: name,
    description: description,
    role: document.getElementById('templateRole').value.trim(),
    goal: goal,
    context: document.getElementById('templateContext').value.trim(),
    tone: document.getElementById('templateTone').value.trim(),
    format: document.getElementById('templateFormat').value,
    constraints: document.getElementById('templateConstraints').value.trim(),
    examples: document.getElementById('templateExamples').value.trim()
  };
  
  const templateId = editingTemplateId || templateStorage.generateId();
  const success = templateStorage.saveTemplate(templateId, template);
  
  if (success) {
    closeTemplateEditor();
    
    // If not in custom section, switch to it
    if (currentSection !== 'custom') {
      // This will be handled by app-templates.js
      if (window.switchCategory) {
        window.switchCategory('custom');
      }
    } else {
      // Update grid if already in custom section
      if (window.updateTemplateGrid) {
        window.updateTemplateGrid();
      }
    }
    
    const action = editingTemplateId ? 'updated' : 'created';
    showToast(`Template "${name}" ${action} successfully!`, 'success');
  } else {
    showToast('Failed to save template. Please try again.', 'error');
  }
}

/**
 * Save current form as template
 */
function saveCurrentAsTemplate() {
  const goal = document.getElementById('goal').value.trim();
  if (!goal) {
    showToast('Please generate a prompt first before saving as template', 'error');
    return;
  }
  
  openTemplateEditor();
}

// ============================================================================
// GLOBAL SCOPE ASSIGNMENTS (for HTML onclick handlers)
// ============================================================================

// Make functions globally available for HTML onclick handlers
window.openTemplateEditor = openTemplateEditor;
window.closeTemplateEditor = closeTemplateEditor;
window.saveTemplate = saveTemplate;
window.saveCurrentAsTemplate = saveCurrentAsTemplate;
window.generatePrompt = generatePrompt;
window.copyPromptToClipboard = copyPromptToClipboard;
window.clearAllFields = clearAllFields;
window.toggleMode = toggleMode;

// Export functions for other modules
window.SmartPromptzCore = {
  // State
  getCurrentCategory: () => currentCategory,
  getCurrentSection: () => currentSection,
  getSelectedTemplate: () => selectedTemplate,
  
  // State setters
  setCurrentCategory: (category) => { currentCategory = category; },
  setCurrentSection: (section) => { currentSection = section; },
  setSelectedTemplate: (template) => { selectedTemplate = template; },
  
  // Core functions
  clearAllFormFields,
  updateFormStatus,
  applyTemplateData,
  buildPrompt,
  showToast,
  setLoadingState,
  
  // Instances
  qualityAnalyzer,
  templateStorage
};