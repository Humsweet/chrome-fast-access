/**
 * My Speed Dial - 设置页面逻辑
 */

class OptionsPage {
  constructor() {
    this.settings = {
      searchEngine: 'google',
      showClock: true,
      showSearch: true,
      columns: 6,
      backgroundColor: '#1a1a2e',
      backgroundImage: ''
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.populateForm();
    this.setupEventListeners();
  }

  // 加载设置
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['settings'], (result) => {
        if (result.settings) {
          this.settings = { ...this.settings, ...result.settings };
        }
        resolve();
      });
    });
  }

  // 保存设置
  async saveSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ settings: this.settings }, resolve);
    });
  }

  // 填充表单
  populateForm() {
    document.getElementById('searchEngine').value = this.settings.searchEngine;
    document.getElementById('showClock').checked = this.settings.showClock;
    document.getElementById('showSearch').checked = this.settings.showSearch;
    document.getElementById('columns').value = this.settings.columns;
    document.getElementById('backgroundColor').value = this.settings.backgroundColor;
    document.getElementById('backgroundImage').value = this.settings.backgroundImage || '';
  }

  // 从表单获取设置
  getFormValues() {
    return {
      searchEngine: document.getElementById('searchEngine').value,
      showClock: document.getElementById('showClock').checked,
      showSearch: document.getElementById('showSearch').checked,
      columns: parseInt(document.getElementById('columns').value),
      backgroundColor: document.getElementById('backgroundColor').value,
      backgroundImage: document.getElementById('backgroundImage').value.trim()
    };
  }

  // 显示保存状态
  showSaveStatus(message = '设置已保存') {
    const status = document.getElementById('saveStatus');
    status.textContent = message;
    status.classList.add('show');
    setTimeout(() => {
      status.classList.remove('show');
    }, 2000);
  }

  // 设置事件监听
  setupEventListeners() {
    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', async () => {
      this.settings = this.getFormValues();
      await this.saveSettings();
      this.showSaveStatus();
    });

    // 导出配置
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportData();
    });

    // 导入配置
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });

    // 重置数据
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetData();
    });
  }

  // 导出数据
  async exportData() {
    const data = await new Promise((resolve) => {
      chrome.storage.sync.get(null, resolve);
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `speed-dial-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showSaveStatus('配置已导出');
  }

  // 导入数据
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        await new Promise((resolve) => {
          chrome.storage.sync.set(data, resolve);
        });

        if (data.settings) {
          this.settings = data.settings;
          this.populateForm();
        }

        this.showSaveStatus('配置已导入');
      } catch (err) {
        alert('导入失败：无效的配置文件');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  }

  // 重置数据
  async resetData() {
    if (confirm('确定要重置所有数据吗？这将删除所有快捷方式和设置。')) {
      await new Promise((resolve) => {
        chrome.storage.sync.clear(resolve);
      });

      // 重置为默认设置
      this.settings = {
        searchEngine: 'google',
        showClock: true,
        showSearch: true,
        columns: 6,
        backgroundColor: '#1a1a2e',
        backgroundImage: ''
      };

      this.populateForm();
      this.showSaveStatus('数据已重置');
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
});
