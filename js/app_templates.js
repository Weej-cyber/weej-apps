/**
 * SmartPromptz v2.1 - Template Management Functions
 * Template selection, category switching, template management UI
 * Dependencies: templates.js, storage.js, app-core.js
 */

/**
 * TEMPLATE DISPLAY FUNCTIONS
 */

function displayTemplates() {
    const container = document.getElementById('templatesContainer');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Display built-in templates
    displayBuiltInTemplates(container);
    
    // Display custom templates
    displayCustomTemplates(container);
}

function displayBuiltInTemplates(container) {
    if (!window.templatesByCategory || !window.sectionCategories) {
        console.warn('Built-in templates not loaded');
        return;
    }
    
    const builtInSection = document.createElement('div');
    builtInSection.className = 'template-section built-in-templates';
    builtInSection.innerHTML = `
        <div class="section-header">
            <h3>📚 Built-in Templates</h3>
            <div class="category-tabs" id="categoryTabs">
                ${Object.keys(window.sectionCategories).map(category => 
                    `<button class="category-tab ${category === currentCategory ? 'active' : ''}" 
                             onclick="switchCategory('${category}')" 
                             data-category="${category}">
                        ${window.sectionCategories[category].icon} ${window.sectionCategories[category].name}
                    </button>`
                ).join('')}
            </div>
        </div>
        <div class="templates-grid" id="builtInTemplatesGrid"></div>
    `;
    
    container.appendChild(builtInSection);
    displayCategoryTemplates();
}

function displayCategoryTemplates() {
    const grid = document.getElementById('builtInTemplatesGrid');
    if (!grid || !window.templatesByCategory) return;
    
    const categoryTemplates = window.templatesByCategory[currentCategory] || [];
    
    if (categoryTemplates.length === 0) {
        grid.innerHTML = `
            <div class="no-templates">
                <p>No templates available in this category yet.</p>
                <button onclick="openTemplateEditor()" class="btn btn-primary">
                    ➕ Create First Template
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = categoryTemplates.map(template => createTemplateCard(template, 'built-in')).join('');
}

function displayCustomTemplates(container) {
    if (!window.templateStorage) {
        console.warn('Template storage not available');
        return;
    }
    
    const customTemplates = templateStorage.getAllTemplates();
    
    const customSection = document.createElement('div');
    customSection.className = 'template-section custom-templates';
    customSection.innerHTML = `
        <div class="section-header">
            <h3>🎨 Custom Templates</h3>
            <div class="section-actions">
                <button onclick="openTemplateEditor()" class="btn btn-primary">
                    ➕ New Template
                </button>
                <button onclick="importTemplates()" class="btn btn-secondary">
                    📁 Import
                </button>
                <button onclick="exportCustomTemplates()" class="btn btn-secondary">
                    💾 Export All
                </button>
            </div>
        </div>
        <div class="templates-grid" id="customTemplatesGrid"></div>
    `;
    
    container.appendChild(customSection);
    
    const customGrid = document.getElementById('customTemplatesGrid');
    
    if (customTemplates.length === 0) {
        customGrid.innerHTML = `
            <div class="no-templates">
                <p>No custom templates yet. Create your own personalized prompts!</p>
                <button onclick="openTemplateEditor()" class="btn btn-primary">
                    🚀 Create Your First Template
                </button>
            </div>
        `;
    } else {
        customGrid.innerHTML = customTemplates.map(template => 
            createTemplateCard(template, 'custom')
        ).join('');
    }
}

function createTemplateCard(template, type) {
    const isSelected = selectedTemplate && selectedTemplate.id === template.id;
    const cardClass = `template-card ${type} ${isSelected ? 'selected' : ''}`;
    
    return `
        <div class="${cardClass}" onclick="selectTemplate('${template.id}', '${type}')" data-template-id="${template.id}">
            <div class="template-header">
                <h4 class="template-title">${escapeHtml(template.name)}</h4>
                ${type === 'custom' ? `
                    <div class="template-actions">
                        <button onclick="event.stopPropagation(); editTemplate('${template.id}')" 
                                class="btn-icon" title="Edit">
                            ✏️
                        </button>
                        <button onclick="event.stopPropagation(); duplicateTemplate('${template.id}')" 
                                class="btn-icon" title="Duplicate">
                            📋
                        </button>
                        <button onclick="event.stopPropagation(); deleteTemplate('${template.id}')" 
                                class="btn-icon delete" title="Delete">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="template-description">
                ${escapeHtml(template.description)}
            </div>
            <div class="template-meta">
                <span class="template-category">${template.category || 'general'}</span>
                ${template.tags ? template.tags.map(tag => `<span class="template-tag">${escapeHtml(tag)}</span>`).join('') : ''}
            </div>
            ${isSelected ? '<div class="selected-indicator">✅ Selected</div>' : ''}
        </div>
    `;
}

/**
 * TEMPLATE SELECTION FUNCTIONS
 */

function selectTemplate(templateId, type) {
    let template = null;
    
    if (type === 'built-in') {
        // Find in built-in templates
        if (window.templatesByCategory) {
            for (const category in window.templatesByCategory) {
                template = window.templatesByCategory[category].find(t => t.id === templateId);
                if (template) break;
            }
        }
    } else if (type === 'custom') {
        // Find in custom templates
        if (window.templateStorage) {
            template = templateStorage.getTemplate(templateId);
        }
    }
    
    if (!template) {
        showToast('Template not found', 'error');
        return;
    }
    
    // Update global state
    window.selectedTemplate = template;
    
    // Update UI
    updateTemplateSelection();
    
    // Apply template data to form (from app-core.js)
    if (typeof applyTemplateData === 'function') {
        applyTemplateData();
    }
    
    // Switch to template mode if not already
    if (typeof toggleMode === 'function') {
        toggleMode('template');
    }
    
    showToast(`Selected: ${template.name}`, 'success', 2000);
}

function updateTemplateSelection() {
    // Remove previous selections
    const allCards = document.querySelectorAll('.template-card');
    allCards.forEach(card => {
        card.classList.remove('selected');
        const indicator = card.querySelector('.selected-indicator');
        if (indicator) indicator.remove();
    });
    
    // Add selection to current template
    if (window.selectedTemplate) {
        const selectedCard = document.querySelector(`[data-template-id="${window.selectedTemplate.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.insertAdjacentHTML('beforeend', '<div class="selected-indicator">✅ Selected</div>');
        }
    }
}

/**
 * CATEGORY MANAGEMENT FUNCTIONS
 */

function switchCategory(category) {
    if (!window.sectionCategories || !window.sectionCategories[category]) {
        showToast('Invalid category', 'error');
        return;
    }
    
    // Update global state
    window.currentCategory = category;
    
    // Update active tab
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // Display templates for new category
    displayCategoryTemplates();
    
    // Update URL hash for bookmarking
    updateUrlHash();
}

function updateUrlHash() {
    const hash = `#category=${window.currentCategory}`;
    if (window.location.hash !== hash) {
        window.history.replaceState(null, null, hash);
    }
}

function loadCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const category = urlParams.get('category');
    
    if (category && window.sectionCategories && window.sectionCategories[category]) {
        switchCategory(category);
    }
}

/**
 * TEMPLATE MODAL FUNCTIONS
 */

function setupTemplateModal() {
    const modal = document.getElementById('templateModal');
    const form = document.getElementById('templateForm');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelTemplate');
    const saveBtn = document.getElementById('saveTemplate');
    
    if (!modal || !form) return;
    
    // Close modal handlers
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        form.reset();
        window.editingTemplateId = null;
    };
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    // Save template handler
    if (saveBtn) {
        saveBtn.onclick = (e) => {
            e.preventDefault();
            saveTemplate();
        };
    }
    
    // Form submission
    form.onsubmit = (e) => {
        e.preventDefault();
        saveTemplate();
    };
}

function saveTemplate() {
    const form = document.getElementById('templateForm');
    if (!form || !window.templateStorage) return;
    
    const formData = new FormData(form);
    
    // Validate required fields
    const name = formData.get('templateName')?.trim();
    const template = formData.get('templateContent')?.trim();
    
    if (!name || !template) {
        showToast('Name and template content are required', 'error');
        return;
    }
    
    // Create template object
    const templateData = {
        id: window.editingTemplateId || undefined,
        name: name,
        description: formData.get('templateDescription')?.trim() || '',
        template: template,
        category: formData.get('templateCategory') || 'general',
        tags: formData.get('templateTags')?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        fields: parseTemplateFields(template),
        createdAt: window.editingTemplateId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        templateStorage.saveTemplate(templateData);
        
        const action = window.editingTemplateId ? 'updated' : 'created';
        showToast(`Template ${action} successfully!`, 'success');
        
        // Close modal
        const modal = document.getElementById('templateModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            form.reset();
            window.editingTemplateId = null;
        }
        
        // Refresh template display
        displayCustomTemplates(document.getElementById('templatesContainer'));
        
    } catch (error) {
        console.error('Error saving template:', error);
        showToast('Failed to save template', 'error');
    }
}

function parseTemplateFields(template) {
    const fieldRegex = /\{([^}]+)\}/g;
    const fields = [];
    const seen = new Set();
    let match;
    
    while ((match = fieldRegex.exec(template)) !== null) {
        const fieldName = match[1].trim();
        if (!seen.has(fieldName)) {
            seen.add(fieldName);
            fields.push({
                id: fieldName,
                label: formatFieldLabel(fieldName),
                type: inferFieldType(fieldName),
                required: true,
                placeholder: `Enter ${formatFieldLabel(fieldName).toLowerCase()}`
            });
        }
    }
    
    return fields;
}

function formatFieldLabel(fieldName) {
    return fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/_/g, ' ');
}

function inferFieldType(fieldName) {
    const field = fieldName.toLowerCase();
    
    if (field.includes('email')) return 'email';
    if (field.includes('url') || field.includes('link') || field.includes('website')) return 'url';
    if (field.includes('phone') || field.includes('number')) return 'tel';
    if (field.includes('date')) return 'date';
    if (field.includes('description') || field.includes('details') || field.includes('content')) return 'textarea';
    
    return 'text';
}

/**
 * IMPORT/EXPORT FUNCTIONS
 */

function importTemplates() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = handleTemplateImport;
    input.click();
}

function handleTemplateImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const templates = JSON.parse(e.target.result);
            
            if (!Array.isArray(templates)) {
                throw new Error('Invalid template file format');
            }
            
            let imported = 0;
            templates.forEach(template => {
                try {
                    templateStorage.saveTemplate(template);
                    imported++;
                } catch (error) {
                    console.warn('Failed to import template:', template.name, error);
                }
            });
            
            showToast(`Imported ${imported} templates successfully!`, 'success');
            displayCustomTemplates(document.getElementById('templatesContainer'));
            
        } catch (error) {
            console.error('Import error:', error);
            showToast('Failed to import templates. Invalid file format.', 'error');
        }
    };
    
    reader.readAsText(file);
}

function exportCustomTemplates() {
    if (!window.templateStorage) return;
    
    const templates = templateStorage.getAllTemplates();
    
    if (templates.length === 0) {
        showToast('No custom templates to export', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `smartpromptz-custom-templates-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Exported ${templates.length} templates`, 'success');
}

/**
 * SEARCH AND FILTER FUNCTIONS
 */

function setupTemplateSearch() {
    const searchInput = document.getElementById('templateSearch');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterTemplates(e.target.value);
        }, 300);
    });
}

function filterTemplates(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const cards = document.querySelectorAll('.template-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.template-title')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.template-description')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.template-category')?.textContent.toLowerCase() || '';
        
        const matches = !term || 
            title.includes(term) || 
            description.includes(term) || 
            category.includes(term);
        
        card.style.display = matches ? 'block' : 'none';
    });
    
    // Show/hide "no results" message
    updateNoResultsMessage(term);
}

function updateNoResultsMessage(searchTerm) {
    const containers = document.querySelectorAll('.templates-grid');
    
    containers.forEach(container => {
        const visibleCards = container.querySelectorAll('.template-card[style=""], .template-card:not([style])');
        const noResults = container.querySelector('.no-search-results');
        
        if (searchTerm && visibleCards.length === 0) {
            if (!noResults) {
                const message = document.createElement('div');
                message.className = 'no-search-results';
                message.innerHTML = `
                    <p>No templates found for "${escapeHtml(searchTerm)}"</p>
                    <button onclick="clearTemplateSearch()" class="btn btn-secondary">Clear Search</button>
                `;
                container.appendChild(message);
            }
        } else if (noResults) {
            noResults.remove();
        }
    });
}

function clearTemplateSearch() {
    const searchInput = document.getElementById('templateSearch');
    if (searchInput) {
        searchInput.value = '';
        filterTemplates('');
    }
}

/**
 * UTILITY FUNCTIONS
 */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for HTML onclick handlers
window.switchCategory = switchCategory;
window.selectTemplate = selectTemplate;
window.importTemplates = importTemplates;
window.exportCustomTemplates = exportCustomTemplates;
window.clearTemplateSearch = clearTemplateSearch;

/**
 * INITIALIZATION
 */

function initializeTemplates() {
    // Load category from URL
    loadCategoryFromUrl();
    
    // Setup modal
    setupTemplateModal();
    
    // Setup search
    setupTemplateSearch();
    
    // Display templates
    displayTemplates();
    
    // Handle URL hash changes
    window.addEventListener('hashchange', loadCategoryFromUrl);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTemplates);
} else {
    initializeTemplates();
}

// Export functions for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        displayTemplates,
        displayCustomTemplates,
        selectTemplate,
        switchCategory,
        saveTemplate,
        importTemplates,
        exportCustomTemplates,
        filterTemplates
    };
}
