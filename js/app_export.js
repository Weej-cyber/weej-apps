/**
 * SmartPromptz v2.1 - Export Functions
 * All export functionality (text, Excel) for all categories
 * Dependencies: storage.js, templates.js, app-core.js
 */

/**
 * EXPORT CONFIGURATION
 */

const EXPORT_FORMATS = {
    TEXT: 'text',
    JSON: 'json',
    EXCEL: 'excel',
    CSV: 'csv'
};

const EXPORT_TYPES = {
    CURRENT_PROMPT: 'current',
    ALL_TEMPLATES: 'all_templates',
    CATEGORY_TEMPLATES: 'category',
    CUSTOM_TEMPLATES: 'custom',
    PROMPT_HISTORY: 'history'
};

/**
 * MAIN EXPORT FUNCTIONS
 */

function exportCurrentPrompt(format = EXPORT_FORMATS.TEXT) {
    const promptContent = getCurrentPromptContent();
    
    if (!promptContent) {
        showToast('No prompt to export. Generate a prompt first.', 'warning');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `smartpromptz-prompt-${timestamp}`;
    
    switch (format) {
        case EXPORT_FORMATS.TEXT:
            exportAsText(promptContent, filename);
            break;
        case EXPORT_FORMATS.JSON:
            exportPromptAsJSON(promptContent, filename);
            break;
        case EXPORT_FORMATS.EXCEL:
            exportPromptAsExcel(promptContent, filename);
            break;
        default:
            exportAsText(promptContent, filename);
    }
    
    showToast(`Prompt exported as ${format.toUpperCase()}`, 'success');
}

function exportTemplates(type = EXPORT_TYPES.ALL_TEMPLATES, format = EXPORT_FORMATS.JSON) {
    let templates = [];
    let filename = 'smartpromptz-templates';
    
    switch (type) {
        case EXPORT_TYPES.ALL_TEMPLATES:
            templates = getAllTemplatesForExport();
            filename = 'smartpromptz-all-templates';
            break;
        case EXPORT_TYPES.CATEGORY_TEMPLATES:
            templates = getCategoryTemplatesForExport();
            filename = `smartpromptz-${window.currentCategory}-templates`;
            break;
        case EXPORT_TYPES.CUSTOM_TEMPLATES:
            templates = getCustomTemplatesForExport();
            filename = 'smartpromptz-custom-templates';
            break;
        default:
            templates = getAllTemplatesForExport();
    }
    
    if (templates.length === 0) {
        showToast('No templates to export', 'warning');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}`;
    
    switch (format) {
        case EXPORT_FORMATS.JSON:
            exportAsJSON(templates, fullFilename);
            break;
        case EXPORT_FORMATS.EXCEL:
            exportTemplatesAsExcel(templates, fullFilename);
            break;
        case EXPORT_FORMATS.CSV:
            exportTemplatesAsCSV(templates, fullFilename);
            break;
        default:
            exportAsJSON(templates, fullFilename);
    }
    
    showToast(`${templates.length} templates exported as ${format.toUpperCase()}`, 'success');
}

function exportPromptHistory(format = EXPORT_FORMATS.JSON) {
    const history = getPromptHistory();
    
    if (history.length === 0) {
        showToast('No prompt history to export', 'warning');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `smartpromptz-history-${timestamp}`;
    
    switch (format) {
        case EXPORT_FORMATS.JSON:
            exportAsJSON(history, filename);
            break;
        case EXPORT_FORMATS.EXCEL:
            exportHistoryAsExcel(history, filename);
            break;
        case EXPORT_FORMATS.CSV:
            exportHistoryAsCSV(history, filename);
            break;
        default:
            exportAsJSON(history, filename);
    }
    
    showToast(`Prompt history exported as ${format.toUpperCase()}`, 'success');
}

/**
 * DATA COLLECTION FUNCTIONS
 */

function getCurrentPromptContent() {
    const promptElement = document.querySelector('.prompt-content pre');
    if (!promptElement) return null;
    
    const content = promptElement.textContent.trim();
    if (!content || content === '[PLACEHOLDER]') return null;
    
    return {
        content: content,
        template: window.selectedTemplate ? window.selectedTemplate.name : 'Custom',
        category: window.currentCategory || 'general',
        timestamp: new Date().toISOString(),
        formData: getFormData()
    };
}

function getFormData() {
    const form = document.getElementById('promptForm');
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

function getAllTemplatesForExport() {
    const templates = [];
    
    // Add built-in templates
    if (window.templatesByCategory) {
        for (const category in window.templatesByCategory) {
            window.templatesByCategory[category].forEach(template => {
                templates.push({
                    ...template,
                    type: 'built-in',
                    category: category
                });
            });
        }
    }
    
    // Add custom templates
    if (window.templateStorage) {
        const customTemplates = templateStorage.getAllTemplates();
        customTemplates.forEach(template => {
            templates.push({
                ...template,
                type: 'custom'
            });
        });
    }
    
    return templates;
}

function getCategoryTemplatesForExport() {
    if (!window.templatesByCategory || !window.currentCategory) return [];
    
    const categoryTemplates = window.templatesByCategory[window.currentCategory] || [];
    return categoryTemplates.map(template => ({
        ...template,
        type: 'built-in',
        category: window.currentCategory
    }));
}

function getCustomTemplatesForExport() {
    if (!window.templateStorage) return [];
    
    return templateStorage.getAllTemplates().map(template => ({
        ...template,
        type: 'custom'
    }));
}

function getPromptHistory() {
    // This would typically come from localStorage or a history system
    // For now, return empty array - implement based on your history tracking
    const history = JSON.parse(localStorage.getItem('smartpromptz_history') || '[]');
    return history;
}

/**
 * TEXT EXPORT FUNCTIONS
 */

function exportAsText(content, filename) {
    let textContent;
    
    if (typeof content === 'string') {
        textContent = content;
    } else if (content.content) {
        textContent = `SmartPromptz Generated Prompt
Generated: ${new Date(content.timestamp).toLocaleString()}
Template: ${content.template}
Category: ${content.category}

${'-'.repeat(50)}

${content.content}

${'-'.repeat(50)}

Form Data:
${Object.entries(content.formData || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}
`;
    } else {
        textContent = JSON.stringify(content, null, 2);
    }
    
    downloadFile(textContent, `${filename}.txt`, 'text/plain');
}

function exportAsJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * EXCEL EXPORT FUNCTIONS
 */

function exportPromptAsExcel(promptData, filename) {
    const workbook = createWorkbook();
    const worksheet = workbook.addWorksheet('Prompt Details');
    
    // Add headers
    worksheet.addRow(['Property', 'Value']);
    
    // Add prompt data
    worksheet.addRow(['Generated', new Date(promptData.timestamp).toLocaleString()]);
    worksheet.addRow(['Template', promptData.template]);
    worksheet.addRow(['Category', promptData.category]);
    worksheet.addRow(['Content', promptData.content]);
    
    // Add form data
    if (promptData.formData && Object.keys(promptData.formData).length > 0) {
        worksheet.addRow(['', '']); // Empty row
        worksheet.addRow(['Form Field', 'Value']);
        
        Object.entries(promptData.formData).forEach(([key, value]) => {
            worksheet.addRow([key, value]);
        });
    }
    
    // Style the headers
    styleWorksheetHeaders(worksheet);
    
    // Auto-fit columns
    autoFitColumns(worksheet);
    
    downloadExcelFile(workbook, `${filename}.xlsx`);
}

function exportTemplatesAsExcel(templates, filename) {
    const workbook = createWorkbook();
    const worksheet = workbook.addWorksheet('Templates');
    
    // Add headers
    const headers = ['Name', 'Description', 'Category', 'Type', 'Template Content', 'Tags', 'Created', 'Updated'];
    worksheet.addRow(headers);
    
    // Add template data
    templates.forEach(template => {
        worksheet.addRow([
            template.name || '',
            template.description || '',
            template.category || '',
            template.type || '',
            template.template || '',
            Array.isArray(template.tags) ? template.tags.join(', ') : '',
            template.createdAt ? new Date(template.createdAt).toLocaleString() : '',
            template.updatedAt ? new Date(template.updatedAt).toLocaleString() : ''
        ]);
    });
    
    styleWorksheetHeaders(worksheet);
    autoFitColumns(worksheet);
    
    downloadExcelFile(workbook, `${filename}.xlsx`);
}

function exportHistoryAsExcel(history, filename) {
    const workbook = createWorkbook();
    const worksheet = workbook.addWorksheet('Prompt History');
    
    const headers = ['Date', 'Template', 'Category', 'Content Preview'];
    worksheet.addRow(headers);
    
    history.forEach(item => {
        worksheet.addRow([
            new Date(item.timestamp).toLocaleString(),
            item.template || '',
            item.category || '',
            item.content ? item.content.substring(0, 100) + '...' : ''
        ]);
    });
    
    styleWorksheetHeaders(worksheet);
    autoFitColumns(worksheet);
    
    downloadExcelFile(workbook, `${filename}.xlsx`);
}

/**
 * CSV EXPORT FUNCTIONS
 */

function exportTemplatesAsCSV(templates, filename) {
    const headers = ['Name', 'Description', 'Category', 'Type', 'Template Content', 'Tags', 'Created', 'Updated'];
    const csvContent = [headers];
    
    templates.forEach(template => {
        csvContent.push([
            escapeCsvField(template.name || ''),
            escapeCsvField(template.description || ''),
            escapeCsvField(template.category || ''),
            escapeCsvField(template.type || ''),
            escapeCsvField(template.template || ''),
            escapeCsvField(Array.isArray(template.tags) ? template.tags.join(', ') : ''),
            template.createdAt ? new Date(template.createdAt).toLocaleString() : '',
            template.updatedAt ? new Date(template.updatedAt).toLocaleString() : ''
        ]);
    });
    
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadFile(csvString, `${filename}.csv`, 'text/csv');
}

function exportHistoryAsCSV(history, filename) {
    const headers = ['Date', 'Template', 'Category', 'Content Preview'];
    const csvContent = [headers];
    
    history.forEach(item => {
        csvContent.push([
            new Date(item.timestamp).toLocaleString(),
            escapeCsvField(item.template || ''),
            escapeCsvField(item.category || ''),
            escapeCsvField(item.content ? item.content.substring(0, 100) + '...' : '')
        ]);
    });
    
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadFile(csvString, `${filename}.csv`, 'text/csv');
}

function escapeCsvField(field) {
    if (typeof field !== 'string') return field;
    
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

/**
 * EXCEL UTILITY FUNCTIONS
 */

function createWorkbook() {
    // Simple workbook implementation
    return {
        worksheets: [],
        addWorksheet: function(name) {
            const worksheet = {
                name: name,
                rows: [],
                addRow: function(data) {
                    this.rows.push(data);
                }
            };
            this.worksheets.push(worksheet);
            return worksheet;
        }
    };
}

function styleWorksheetHeaders(worksheet) {
    // This would apply styling to the first row in a real implementation
    // For now, this is a placeholder for the interface
}

function autoFitColumns(worksheet) {
    // This would auto-fit column widths in a real implementation
    // For now, this is a placeholder for the interface
}

function downloadExcelFile(workbook, filename) {
    // Convert workbook to Excel format
    const excelData = convertWorkbookToExcel(workbook);
    downloadFile(excelData, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

function convertWorkbookToExcel(workbook) {
    // Simple CSV-like conversion for compatibility
    // In a real implementation, this would use a library like SheetJS
    let content = '';
    
    workbook.worksheets.forEach((worksheet, index) => {
        if (index > 0) content += '\n\n';
        content += `Sheet: ${worksheet.name}\n`;
        content += worksheet.rows.map(row => 
            row.map(cell => escapeCsvField(String(cell))).join(',')
        ).join('\n');
    });
    
    return content;
}

/**
 * FILE DOWNLOAD UTILITIES
 */

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * EXPORT UI FUNCTIONS
 */

function showExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function hideExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function setupExportModal() {
    const modal = document.getElementById('exportModal');
    const closeBtn = modal?.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelExport');
    
    if (!modal) return;
    
    // Close modal handlers
    const closeModal = () => hideExportModal();
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    // Export type change handler
    const exportTypeSelect = document.getElementById('exportType');
    if (exportTypeSelect) {
        exportTypeSelect.onchange = updateExportOptions;
    }
}

function updateExportOptions() {
    const exportType = document.getElementById('exportType')?.value;
    const formatSelect = document.getElementById('exportFormat');
    
    if (!formatSelect) return;
    
    // Update available formats based on export type
    if (exportType === EXPORT_TYPES.CURRENT_PROMPT) {
        formatSelect.innerHTML = `
            <option value="${EXPORT_FORMATS.TEXT}">Text (.txt)</option>
            <option value="${EXPORT_FORMATS.JSON}">JSON (.json)</option>
            <option value="${EXPORT_FORMATS.EXCEL}">Excel (.xlsx)</option>
        `;
    } else {
        formatSelect.innerHTML = `
            <option value="${EXPORT_FORMATS.JSON}">JSON (.json)</option>
            <option value="${EXPORT_FORMATS.EXCEL}">Excel (.xlsx)</option>
            <option value="${EXPORT_FORMATS.CSV}">CSV (.csv)</option>
        `;
    }
}

function handleExport() {
    const exportType = document.getElementById('exportType')?.value;
    const exportFormat = document.getElementById('exportFormat')?.value;
    
    if (!exportType || !exportFormat) {
        showToast('Please select export type and format', 'error');
        return;
    }
    
    try {
        switch (exportType) {
            case EXPORT_TYPES.CURRENT_PROMPT:
                exportCurrentPrompt(exportFormat);
                break;
            case EXPORT_TYPES.ALL_TEMPLATES:
                exportTemplates(EXPORT_TYPES.ALL_TEMPLATES, exportFormat);
                break;
            case EXPORT_TYPES.CATEGORY_TEMPLATES:
                exportTemplates(EXPORT_TYPES.CATEGORY_TEMPLATES, exportFormat);
                break;
            case EXPORT_TYPES.CUSTOM_TEMPLATES:
                exportTemplates(EXPORT_TYPES.CUSTOM_TEMPLATES, exportFormat);
                break;
            case EXPORT_TYPES.PROMPT_HISTORY:
                exportPromptHistory(exportFormat);
                break;
            default:
                throw new Error('Invalid export type');
        }
        
        hideExportModal();
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed. Please try again.', 'error');
    }
}

/**
 * HISTORY MANAGEMENT
 */

function savePromptToHistory(promptData) {
    if (!promptData) return;
    
    try {
        const history = JSON.parse(localStorage.getItem('smartpromptz_history') || '[]');
        
        // Add new prompt to beginning of history
        history.unshift({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            content: promptData.content,
            template: promptData.template,
            category: promptData.category,
            formData: promptData.formData
        });
        
        // Keep only last 100 entries
        if (history.length > 100) {
            history.splice(100);
        }
        
        localStorage.setItem('smartpromptz_history', JSON.stringify(history));
        
    } catch (error) {
        console.error('Failed to save prompt to history:', error);
    }
}

function clearPromptHistory() {
    if (confirm('Are you sure you want to clear all prompt history?')) {
        localStorage.removeItem('smartpromptz_history');
        showToast('Prompt history cleared', 'success');
    }
}

// Make functions globally available for HTML onclick handlers
window.showExportModal = showExportModal;
window.hideExportModal = hideExportModal;
window.handleExport = handleExport;
window.exportCurrentPrompt = exportCurrentPrompt;
window.exportTemplates = exportTemplates;
window.exportPromptHistory = exportPromptHistory;
window.clearPromptHistory = clearPromptHistory;

/**
 * INITIALIZATION
 */

function initializeExport() {
    setupExportModal();
    updateExportOptions();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExport);
} else {
    initializeExport();
}

// Export functions for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exportCurrentPrompt,
        exportTemplates,
        exportPromptHistory,
        savePromptToHistory,
        clearPromptHistory,
        EXPORT_FORMATS,
        EXPORT_TYPES
    };
}
