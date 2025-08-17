// SmartPromptz v2.1 - Custom Templates Storage Manager
// Handles all localStorage operations for custom templates

class CustomTemplateStorage {
  constructor() {
    this.storageKey = 'smartpromptz_custom_templates';
    this.versionKey = 'smartpromptz_version';
    this.statsKey = 'smartpromptz_stats';
    this.currentVersion = '2.1.0';
    this.init();
  }

  init() {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage not available - custom templates will not persist');
      return;
    }
    this.checkVersion();
    if (!localStorage.getItem(this.statsKey)) {
      this.initStats();
    }
  }

  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkVersion() {
    const storedVersion = localStorage.getItem(this.versionKey);
    if (!storedVersion || storedVersion !== this.currentVersion) {
      localStorage.setItem(this.versionKey, this.currentVersion);
    }
  }

  initStats() {
    const stats = {
      templatesCreated: 0,
      templatesUsed: 0,
      lastActivity: new Date().toISOString(),
      favorites: []
    };
    localStorage.setItem(this.statsKey, JSON.stringify(stats));
  }

  getTemplates() {
    try {
      const templates = localStorage.getItem(this.storageKey);
      return templates ? JSON.parse(templates) : {};
    } catch (e) {
      console.error('Error reading custom templates:', e);
      return {};
    }
  }

  saveTemplate(id, template) {
    try {
      const templates = this.getTemplates();
      const now = new Date().toISOString();
      
      template.id = id;
      template.createdAt = template.createdAt || now;
      template.updatedAt = now;
      template.usageCount = template.usageCount || 0;
      
      templates[id] = template;
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
      
      this.updateStats('templatesCreated');
      return true;
    } catch (e) {
      console.error('Error saving template:', e);
      return false;
    }
  }

  deleteTemplate(id) {
    try {
      const templates = this.getTemplates();
      delete templates[id];
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
      return true;
    } catch (e) {
      console.error('Error deleting template:', e);
      return false;
    }
  }

  duplicateTemplate(id) {
    try {
      const templates = this.getTemplates();
      const original = templates[id];
      if (!original) return null;

      const newId = this.generateId();
      const duplicated = {
        ...original,
        name: `${original.name} (Copy)`,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      };

      templates[newId] = duplicated;
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
      return newId;
    } catch (e) {
      console.error('Error duplicating template:', e);
      return null;
    }
  }

  incrementUsage(id) {
    try {
      const templates = this.getTemplates();
      if (templates[id]) {
        templates[id].usageCount = (templates[id].usageCount || 0) + 1;
        templates[id].lastUsed = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(templates));
        this.updateStats('templatesUsed');
      }
    } catch (e) {
      console.error('Error updating template usage:', e);
    }
  }

  updateStats(action) {
    try {
      const stats = JSON.parse(localStorage.getItem(this.statsKey) || '{}');
      if (action && stats[action] !== undefined) {
        stats[action]++;
      }
      stats.lastActivity = new Date().toISOString();
      localStorage.setItem(this.statsKey, JSON.stringify(stats));
    } catch (e) {
      console.error('Error updating stats:', e);
    }
  }

  generateId() {
    return 'tpl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Export functions
  exportAsText() {
    const templates = this.getTemplates();
    const templateCount = Object.keys(templates).length;
    
    if (templateCount === 0) {
      return 'No custom templates to export.';
    }

    let output = `SmartPromptz Custom Templates Export\n`;
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Total Templates: ${templateCount}\n`;
    output += `${'='.repeat(50)}\n\n`;

    Object.values(templates).forEach((template, index) => {
      output += `Template ${index + 1}: ${template.name}\n`;
      output += `Description: ${template.description || 'No description'}\n`;
      output += `Created: ${template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}\n`;
      output += `Used: ${template.usageCount || 0} times\n`;
      output += `${'-'.repeat(30)}\n`;
      
      if (template.role) output += `Role: ${template.role}\n\n`;
      if (template.goal) output += `Goal: ${template.goal}\n\n`;
      if (template.context) output += `Context: ${template.context}\n\n`;
      if (template.tone) output += `Tone: ${template.tone}\n\n`;
      if (template.format) output += `Format: ${template.format}\n\n`;
      if (template.constraints) output += `Constraints: ${template.constraints}\n\n`;
      if (template.examples) output += `Examples: ${template.examples}\n\n`;
      
      output += `${'='.repeat(50)}\n\n`;
    });

    return output;
  }

  exportAsExcel() {
    const templates = this.getTemplates();
    const templateArray = Object.values(templates);
    
    if (templateArray.length === 0) {
      return 'Name,Description,Role,Goal,Context,Tone,Format,Constraints,Examples,Created,Used\n"No templates to export","","","","","","","","","",""';
    }

    // Excel-compatible CSV with UTF-8 BOM
    let csv = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    
    // Headers
    csv += 'Name,Description,Role,Goal,Context,Tone,Format,Constraints,Examples,Created,Used\n';
    
    // Data rows
    templateArray.forEach(template => {
      const row = [
        this.escapeCsvField(template.name || ''),
        this.escapeCsvField(template.description || ''),
        this.escapeCsvField(template.role || ''),
        this.escapeCsvField(template.goal || ''),
        this.escapeCsvField(template.context || ''),
        this.escapeCsvField(template.tone || ''),
        this.escapeCsvField(template.format || ''),
        this.escapeCsvField(template.constraints || ''),
        this.escapeCsvField(template.examples || ''),
        template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '',
        template.usageCount || 0
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  escapeCsvField(field) {
    if (typeof field !== 'string') field = String(field);
    // Escape double quotes and wrap in quotes if contains comma, quote, or newline
    if (field.includes('"') || field.includes(',') || field.includes('\n') || field.includes('\r')) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  }

  // Built-in template export functions
  exportBuiltInTemplatesAsText(categoryTemplates, categoryName) {
    const templateCount = Object.keys(categoryTemplates).length;
    
    if (templateCount === 0) {
      return 'No templates found in this category.';
    }

    let output = `SmartPromptz ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Templates Export\n`;
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Total Templates: ${templateCount}\n`;
    output += `${'='.repeat(50)}\n\n`;

    Object.values(categoryTemplates).forEach((template, index) => {
      output += `Template ${index + 1}: ${template.name}\n`;
      output += `Description: ${template.description || 'No description'}\n`;
      output += `${'-'.repeat(30)}\n`;
      
      if (template.role) output += `Role: ${template.role}\n\n`;
      if (template.goal) output += `Goal: ${template.goal}\n\n`;
      if (template.context) output += `Context: ${template.context}\n\n`;
      if (template.tone) output += `Tone: ${template.tone}\n\n`;
      if (template.format) output += `Format: ${template.format}\n\n`;
      if (template.constraints) output += `Constraints: ${template.constraints}\n\n`;
      if (template.examples) output += `Examples: ${template.examples}\n\n`;
      
      output += `${'='.repeat(50)}\n\n`;
    });

    return output;
  }

  exportBuiltInTemplatesAsExcel(categoryTemplates) {
    const templateArray = Object.values(categoryTemplates);
    
    if (templateArray.length === 0) {
      return 'Name,Description,Role,Goal,Context,Tone,Format,Constraints,Examples\n"No templates in this category","","","","","","","",""';
    }

    // Excel-compatible CSV with UTF-8 BOM
    let csv = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    
    // Headers
    csv += 'Name,Description,Role,Goal,Context,Tone,Format,Constraints,Examples\n';
    
    // Data rows
    templateArray.forEach(template => {
      const row = [
        this.escapeCsvField(template.name || ''),
        this.escapeCsvField(template.description || ''),
        this.escapeCsvField(template.role || ''),
        this.escapeCsvField(template.goal || ''),
        this.escapeCsvField(template.context || ''),
        this.escapeCsvField(template.tone || ''),
        this.escapeCsvField(template.format || ''),
        this.escapeCsvField(template.constraints || ''),
        this.escapeCsvField(template.examples || '')
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomTemplateStorage;
}
