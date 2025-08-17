// SmartPromptz v2.1 - Main Application Logic
// Core functionality and UI management

// Initialize managers
const qualityAnalyzer = new PromptQualityAnalyzer();
const templateStorage = new CustomTemplateStorage();

// Current state
let currentCategory = null;
let currentSection = null;
let selectedTemplate = null;
let isGenerating = false;
let editingTemplateId = null;

// Clear all form fields and reset state
function clearAllFormFields() {
  ['role', 'goal', 'context', 'format', 'tone', 'constraints', 'examples'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = '';
      el.removeAttribute('data-template-value');
    }
  });
  
  selectedTemplate = null;
  document.querySelectorAll('.template-option').forEach(option => {
    option.classList.remove('selected');
  });

  // Hide quality analysis and reset output
  const qualitySection = document.getElementById('promptQualitySection');
  if (qualitySection) qualitySection.classList.remove('show');
  
  const output = document.getElementById('output');
  if (output) output.innerHTML = '<div class="output-placeholder"><i data-lucide="wand-2"></i>Your custom-generated prompt will appear here...</div>';
  
  const instructions = document.getElementById('usage-instructions');
  if (instructions) instructions.style.display = 'none';

  const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');
  if (saveAsTemplateBtn) saveAsTemplateBtn.style.display = 'none';
  
  updateFormStatus();
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Category and template management
function switchCategory(category) {
  clearAllFormFields();
  currentCategory = category;
  
  currentSection = 'content';
  if (sectionCategories.software.includes(category)) {
    currentSection = 'software';
  } else if (sectionCategories.professional.includes(category)) {
    currentSection = 'professional';
  } else if (sectionCategories.custom.includes(category)) {
    currentSection = 'custom';
  }
  
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-pressed', 'false');
  });
  const activeTab = document.querySelector(`[data-category="${category}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-pressed', 'true');
  }
  
  const customSelection = document.getElementById('customTemplateSelection');
  const contentSelection = document.getElementById('contentTemplateSelection');
  const softwareSelection = document.getElementById('softwareTemplateSelection');
  const professionalSelection = document.getElementById('professionalTemplateSelection');
  
  if (customSelection) customSelection.style.display = 'none';
  if (contentSelection) contentSelection.style.display = 'none';
  if (softwareSelection) softwareSelection.style.display = 'none';
  if (professionalSelection) professionalSelection.style.display = 'none';
  
  if (currentSection === 'custom') {
    if (customSelection) customSelection.style.display = 'block';
  } else if (currentSection === 'content') {
    if (contentSelection) contentSelection.style.display = 'block';
  } else if (currentSection === 'professional') {
    if (professionalSelection) professionalSelection.style.display = 'block';
  } else {
    if (softwareSelection) softwareSelection.style.display = 'block';
  }
  
  updateTemplateGrid();
}

function updateTemplateGrid() {
  if (!currentCategory || !currentSection) return;
  
  let gridId, templates;
  
  if (currentSection === 'custom') {
    gridId = 'customTemplateGrid';
    templates = templateStorage.getTemplates();
    updateCustomTemplateGrid(templates);
    return;
  } else if (currentSection === 'content') {
    gridId = 'contentTemplateGrid';
    templates = templatesByCategory[currentCategory] || {};
  } else if (currentSection === 'professional') {
    gridId = 'professionalTemplateGrid';
    templates = templatesByCategory[currentCategory] || {};
  } else {
    gridId = 'softwareTemplateGrid';
    templates = templatesByCategory[currentCategory] || {};
  }
  
  const templateGrid = document.getElementById(gridId);
  if (!templateGrid) return;
  
  templateGrid.innerHTML = '';
  
  Object.keys(templates).forEach(templateId => {
    const template = templates[templateId];
    const templateElement = createTemplateElement(templateId, template, false);
    templateGrid.appendChild(templateElement);
  });
}

function updateCustomTemplateGrid(templates) {
  const templateGrid = document.getElementById('customTemplateGrid');
  if (!templateGrid) return;

  templateGrid.innerHTML = '';
  const templateIds = Object.keys(templates);
  
  if (templateIds.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-state-icon">
        <i data-lucide="plus-circle"></i>
      </div>
      <h3>Create Your First Custom Template</h3>
      <p>Transform any prompt into a reusable template. Save time and maintain consistency across your AI workflows.</p>
      <button class="create-template-btn" onclick="openTemplateEditor()">
        <i data-lucide="plus"></i>
        Create Template
      </button>
    `;
    templateGrid.appendChild(emptyState);
    
    if (window.lucide) {
      lucide.createIcons();
    }
    return;
  }

  templateIds.sort((a, b) => {
    const templateA = templates[a];
    const templateB = templates[b];
    const usageA = templateA.usageCount || 0;
    const usageB = templateB.usageCount || 0;
    if (usageA !== usageB) return usageB - usageA;
    const lastUsedA = new Date(templateA.lastUsed || templateA.createdAt || 0);
    const lastUsedB = new Date(templateB.lastUsed || templateB.createdAt || 0);
    return lastUsedB - lastUsedA;
  });

  templateIds.forEach(templateId => {
    const template = templates[templateId];
    const templateElement = createTemplateElement(templateId, template, true);
    templateGrid.appendChild(templateElement);
  });
}

function createTemplateElement(templateId, template, isCustom) {
  const templateElement = document.createElement('div');
  let templateClass = 'template-option';
  if (isCustom) {
    templateClass += ' custom-template';
  } else if (currentSection === 'professional') {
    templateClass += ' professional-template';
  }
  
  templateElement.className = templateClass;
  templateElement.setAttribute('data-template', templateId);
  templateElement.setAttribute('tabindex', '0');
  templateElement.setAttribute('role', 'button');
  templateElement.setAttribute('aria-label', `Select ${template.name} template`);
  
  let metadataHtml = '';
  if (isCustom) {
    const createdDate = template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '';
    const usageCount = template.usageCount || 0;
    metadataHtml = `
      <div class="template-metadata">
        <span>Used ${usageCount} times</span>
        <span>Created ${createdDate}</span>
      </div>
    `;
  }
  
  templateElement.innerHTML = `
    <div class="template-name">${template.name}</div>
    <div class="template-desc">${template.description}</div>
    ${metadataHtml}
    ${isCustom ? `
      <div class="template-actions">
        <button class="template-action-btn edit" onclick="editTemplate('${templateId}')" title="Edit template">Ed</button>
        <button class="template-action-btn duplicate" onclick="duplicateTemplate('${templateId}')" title="Copy template">Cp</button>
        <button class="template-action-btn delete" onclick="deleteTemplate('${templateId}')" title="Delete template">Del</button>
      </div>
    ` : ''}
  `;
  
  templateElement.addEventListener('click', (e) => {
    if (e.target.closest('.template-actions')) return;
    selectTemplate(templateId);
  });
  
  templateElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTemplate(templateId);
    }
  });
  
  return templateElement;
}

function selectTemplate(templateId) {
  clearAllFormFields();
  
  document.querySelectorAll('.template-option').forEach(option => {
    option.classList.remove('selected');
  });
  const templateElement = document.querySelector(`[data-template="${templateId}"]`);
  if (templateElement) {
    templateElement.classList.add('selected');
  }
  
  selectedTemplate = templateId;
  
  const formSection = document.querySelector('.form-section');
  const formStatus = document.getElementById('formStatus');
  if (formSection && formSection.classList.contains('template-mode')) {
    formSection.style.display = 'block';
    if (formStatus) formStatus.style.display = 'flex';
  }
  
  let template;
  if (currentSection === 'custom') {
    const customTemplates = templateStorage.getTemplates();
    template = customTemplates[templateId];
    if (template) {
      templateStorage.incrementUsage(templateId);
    }
  } else {
    template = templatesByCategory[currentCategory][templateId];
  }
  
  if (template) {
    applyTemplateData(template);
    showToast(`${template.name} template applied!`, 'success');
  }
}

function applyTemplateData(template) {
  ['role', 'goal', 'context', 'tone', 'format', 'constraints', 'examples'].forEach(field => {
    const element = document.getElementById(field);
    if (element && template[field]) {
      element.value = template[field];
      element.setAttribute('data-template-value', template[field]);
    }
  });
  
  updateFormStatus();
  qualityAnalyzer.updateQualityDisplay();
}

// Build prompt using visible + hidden template values
function buildPrompt() {
  const formData = {};
  const fields = ['role', 'goal', 'context', 'format', 'tone', 'constraints', 'examples'];
  
  fields.forEach(field => {
    const element = document.getElementById(field);
    if (!element) return;
    
    const fieldGroup = element.closest('.template-only-fields, .custom-only-fields');
    const isVisible = fieldGroup ? window.getComputedStyle(fieldGroup).display !== 'none' : true;
    
    if (isVisible) {
      formData[field] = element.value.trim();
    } else {
      const templateValue = element.getAttribute('data-template-value');
      formData[field] = templateValue || element.value.trim();
    }
  });
  
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
    formStatus.innerHTML = '<span class="status-icon">✓</span><span class="status-text">Good prompt quality - consider adding examples</span>';
  } else {
    formStatus.className = 'form-status ready';
    formStatus.innerHTML = '<span class="status-icon">✨</span><span class="status-text">Prompt ready for generation</span>';
  }
}

function checkFormCompleteness() {
  const fields = ['role', 'context', 'format', 'tone', 'constraints', 'examples'];
  const emptyFields = [];
  
  fields.forEach(function(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return;
    
    const fieldGroup = element.closest('.template-only-fields, .custom-only-fields');
    if (fieldGroup) {
      const computedStyle = window.getComputedStyle(fieldGroup);
      if (computedStyle.display === 'none') {
        return;
      }
    }
    
    const value = element.value.trim();
    if (!value) {
      emptyFields.push(fieldId);
    }
  });
  
  return emptyFields;
}

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

function showCopySuccess() {
  const successElement = document.getElementById('copy-success');
  if (successElement) {
    successElement.style.display = 'inline';
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 3000);
  }
}

function clearAllFields() {
  if (!confirm('Clear all fields and start over?')) return;
  
  clearAllFormFields();
  showToast('All fields cleared! Ready for a fresh start.', 'success');
}

function showToast(message, type = 'success', duration = 4000) {
  const existingToast = document.getElementById('current-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.id = 'current-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'i';
  toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-message">' + message + '</span>';
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Template Management Functions
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

function populateEditorForm(template) {
  document.getElementById('templateName').value = template.name || '';
  document.getElementById('templateDescription').value = template.description || '';
  document.getElementById('templateRole').value = template.role || '';
  document.getElementById('templateGoal').value = template.goal || '';
  document.getElementById('templateContext').value = template.context || '';
  document.getElementById('templateTone').value = template.tone || '';
  document.getElementById('templateFormat').value = template.format || '';
  document.getElementById('templateConstraints').value = template.constraints || '';
  document.getElementById('templateExamples').value = template.examples || '';
}

function populateEditorFromCurrentForm() {
  document.getElementById('templateName').value = '';
  document.getElementById('templateDescription').value = '';
  document.getElementById('templateRole').value = document.getElementById('role').value || '';
  document.getElementById('templateGoal').value = document.getElementById('goal').value || '';
  document.getElementById('templateContext').value = document.getElementById('context').value || '';
  document.getElementById('templateTone').value = document.getElementById('tone').value || '';
  document.getElementById('templateFormat').value = document.getElementById('format').value || '';
  document.getElementById('templateConstraints').value = document.getElementById('constraints').value || '';
  document.getElementById('templateExamples').value = document.getElementById('examples').value || '';
}

function closeTemplateEditor() {
  const modal = document.getElementById('templateEditor');
  modal.classList.remove('show');
  editingTemplateId = null;
  
  // Clear form
  ['templateName', 'templateDescription', 'templateRole', 'templateGoal', 'templateContext', 'templateTone', 'templateFormat', 'templateConstraints', 'templateExamples'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

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
    
    if (currentSection !== 'custom') {
      switchCategory('custom');
    } else {
      updateTemplateGrid();
    }
    
    const action = editingTemplateId ? 'updated' : 'created';
    showToast(`Template "${name}" ${action} successfully!`, 'success');
  } else {
    showToast('Failed to save template. Please try again.', 'error');
  }
}

function editTemplate(templateId) {
  event.stopPropagation();
  openTemplateEditor(templateId);
}

function deleteTemplate(templateId) {
  event.stopPropagation();
  
  const templates = templateStorage.getTemplates();
  const template = templates[templateId];
  if (!template) return;
  
  if (confirm(`Delete template "${template.name}"? This action cannot be undone.`)) {
    const success = templateStorage.deleteTemplate(templateId);
    if (success) {
      updateTemplateGrid();
      showToast(`Template "${template.name}" deleted successfully`, 'success');
      
      if (selectedTemplate === templateId) {
        clearAllFormFields();
      }
    } else {
      showToast('Failed to delete template', 'error');
    }
  }
}

function duplicateTemplate(templateId) {
  event.stopPropagation();
  
  const newId = templateStorage.duplicateTemplate(templateId);
  if (newId) {
    updateTemplateGrid();
    const templates = templateStorage.getTemplates();
    const newTemplate = templates[newId];
    showToast(`Template "${newTemplate.name}" created successfully!`, 'success');
  } else {
    showToast('Failed to duplicate template', 'error');
  }
}

function saveCurrentAsTemplate() {
  const goal = document.getElementById('goal').value.trim();
  if (!goal) {
    showToast('Please generate a prompt first before saving as template', 'error');
    return;
  }
  
  openTemplateEditor();
}

// Export Functions for Built-in Templates
function exportBuiltInTemplatesAsText() {
  const categoryTemplates = templatesByCategory[currentCategory] || {};
  const content = templateStorage.exportBuiltInTemplatesAsText(categoryTemplates, currentCategory);
  const filename = `SmartPromptz_${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}_Templates_${new Date().toISOString().slice(0, 10)}.txt`;
  downloadFile(content, filename, 'text/plain');
}

function exportBuiltInTemplatesAsExcel() {
  const categoryTemplates = templatesByCategory[currentCategory] || {};
  const content = templateStorage.exportBuiltInTemplatesAsExcel(categoryTemplates);
  const filename = `SmartPromptz_${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}_Templates_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(content, filename, 'text/csv');
}

// Universal Export Functions
function exportAsText(section) {
  let btn, content, filename;
  
  if (section === 'custom') {
    btn = document.getElementById('exportTextBtn');
    content = templateStorage.exportAsText();
    filename = `SmartPromptz_Custom_Templates_${new Date().toISOString().slice(0, 10)}.txt`;
  } else {
    btn = document.getElementById(`${section}ExportExcelBtn`);
    content = templateStorage.exportBuiltInTemplatesAsExcel(templatesByCategory[currentCategory] || {});
    filename = `SmartPromptz_${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}_Templates_${new Date().toISOString().slice(0, 10)}.csv`;
  }
  
  if (btn) btn.classList.add('loading');
  
  setTimeout(() => {
    try {
      downloadFile(content, filename, 'text/csv');
      showToast('Templates exported as Excel file successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    } finally {
      if (btn) btn.classList.remove('loading');
    }
  }, 500);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Initialize the app
function initializeApp() {
  try {
    if (window.lucide) {
      lucide.createIcons();
    }
    
    const formSection = document.querySelector('.form-section');
    const formStatus = document.getElementById('formStatus');
    
    if (formSection) formSection.style.display = 'none';
    if (formStatus) formStatus.style.display = 'none';
    
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        if (category) {
          switchCategory(category);
        }
      });
      
      tab.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
    
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
      option.addEventListener('click', function() {
        const mode = this.getAttribute('data-mode');
        if (mode) {
          toggleMode(mode);
        }
      });
      
      option.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
    
    // Template Editor Events
    const modalClose = document.getElementById('modalClose');
    const cancelTemplate = document.getElementById('cancelTemplate');
    const saveTemplateBtn = document.getElementById('saveTemplate');
    
    if (modalClose) modalClose.addEventListener('click', closeTemplateEditor);
    if (cancelTemplate) cancelTemplate.addEventListener('click', closeTemplateEditor);
    if (saveTemplateBtn) saveTemplateBtn.addEventListener('click', saveTemplate);
    
    const templateEditor = document.getElementById('templateEditor');
    if (templateEditor) {
      templateEditor.addEventListener('click', function(e) {
        if (e.target === this) {
          closeTemplateEditor();
        }
      });
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('templateEditor');
        if (modal && modal.classList.contains('show')) {
          closeTemplateEditor();
        }
      }
    });
    
    // Export button events for ALL categories
    const exportTextBtn = document.getElementById('exportTextBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const contentExportTextBtn = document.getElementById('contentExportTextBtn');
    const contentExportExcelBtn = document.getElementById('contentExportExcelBtn');
    const softwareExportTextBtn = document.getElementById('softwareExportTextBtn');
    const softwareExportExcelBtn = document.getElementById('softwareExportExcelBtn');
    const professionalExportTextBtn = document.getElementById('professionalExportTextBtn');
    const professionalExportExcelBtn = document.getElementById('professionalExportExcelBtn');
    
    if (exportTextBtn) exportTextBtn.addEventListener('click', () => exportAsText('custom'));
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => exportAsExcel('custom'));
    if (contentExportTextBtn) contentExportTextBtn.addEventListener('click', () => exportAsText('content'));
    if (contentExportExcelBtn) contentExportExcelBtn.addEventListener('click', () => exportAsExcel('content'));
    if (softwareExportTextBtn) softwareExportTextBtn.addEventListener('click', () => exportAsText('software'));
    if (softwareExportExcelBtn) softwareExportExcelBtn.addEventListener('click', () => exportAsExcel('software'));
    if (professionalExportTextBtn) professionalExportTextBtn.addEventListener('click', () => exportAsText('professional'));
    if (professionalExportExcelBtn) professionalExportExcelBtn.addEventListener('click', () => exportAsExcel('professional'));
    
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', generatePrompt);
    }

    const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');
    if (saveAsTemplateBtn) {
      saveAsTemplateBtn.addEventListener('click', saveCurrentAsTemplate);
    }
    
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyPromptToClipboard);
    }
    
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearAllFields);
    }
    
    const formFields = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    formFields.forEach(field => {
      field.addEventListener('input', () => {
        updateFormStatus();
        qualityAnalyzer.updateQualityDisplay();
      });
      field.addEventListener('change', () => {
        updateFormStatus();
        qualityAnalyzer.updateQualityDisplay();
      });
    });
    
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isGenerating) {
        e.preventDefault();
        generatePrompt();
      }
    });
    
    setTimeout(() => {
      const templateCount = Object.keys(templateStorage.getTemplates()).length;
      let welcomeMessage = 'SmartPromptz v2.1 loaded! 🚀 Now with prompt quality analysis and consistent export functionality.';
      
      if (templateCount > 0) {
        welcomeMessage += ` You have ${templateCount} custom template${templateCount === 1 ? '' : 's'}.`;
      }
      
      showToast(welcomeMessage, 'success', 6000);
    }, 1000);
    
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('App loaded with some limitations. Basic functionality should work.', 'error');
  }
}

// Make functions globally available
window.openTemplateEditor = openTemplateEditor;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.duplicateTemplate = duplicateTemplate;

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}getElementById(`${section}ExportTextBtn`);
    content = templateStorage.exportBuiltInTemplatesAsText(templatesByCategory[currentCategory] || {}, currentCategory);
    filename = `SmartPromptz_${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}_Templates_${new Date().toISOString().slice(0, 10)}.txt`;
  }
  
  if (btn) btn.classList.add('loading');
  
  setTimeout(() => {
    try {
      downloadFile(content, filename, 'text/plain');
      showToast('Templates exported as text file successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    } finally {
      if (btn) btn.classList.remove('loading');
    }
  }, 500);
}

function exportAsExcel(section) {
  let btn, content, filename;
  
  if (section === 'custom') {
    btn = document.getElementById('exportExcelBtn');
    content = templateStorage.exportAsExcel();
    filename = `SmartPromptz_Custom_Templates_${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    btn = document.
