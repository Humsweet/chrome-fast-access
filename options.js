/**
 * My Speed Dial - 设置页面逻辑
 */

class OptionsPage {
  constructor() {
    this.settings = {
      columns: 6,
      language: 'zh-CN'
    };
    this.init();
  }

  async init() {
    await i18n.init();
    await this.loadSettings();
    this.applyI18n();
    this.populateForm();
    this.setupEventListeners();
    this.checkSyncStatus();
  }

  // 应用国际化
  applyI18n() {
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = i18n.t(key);
    });
    // 更新页面标题
    document.title = i18n.t('settingsTitle');
  }

  // 加载设置
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['settings'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('加载同步设置失败:', chrome.runtime.lastError.message);
          // 尝试从本地存储加载
          chrome.storage.local.get(['settings'], (localResult) => {
            if (localResult.settings) {
              this.settings = { ...this.settings, ...localResult.settings };
            }
            resolve();
          });
          return;
        }
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
      chrome.storage.sync.set({ settings: this.settings }, () => {
        if (chrome.runtime.lastError) {
          console.error('同步保存失败:', chrome.runtime.lastError.message);
          this.showSaveStatus(i18n.t('syncFailed') + chrome.runtime.lastError.message, true);
          // 保存到本地作为备份
          chrome.storage.local.set({ settings: this.settings }, resolve);
        } else {
          // 同时保存到本地作为备份
          chrome.storage.local.set({ settings: this.settings }, () => {
            resolve();
          });
        }
      });
    });
  }

  // 填充表单
  populateForm() {
    document.getElementById('columns').value = this.settings.columns;
    document.getElementById('language').value = this.settings.language || i18n.getLanguage();
  }

  // 从表单获取设置
  getFormValues() {
    return {
      columns: parseInt(document.getElementById('columns').value),
      language: document.getElementById('language').value
    };
  }

  // 显示保存状态
  showSaveStatus(message, isError = false) {
    const status = document.getElementById('saveStatus');
    status.textContent = message;
    status.style.background = isError ? '#ff6b6b' : '#4CAF50';
    status.classList.add('show');
    setTimeout(() => {
      status.classList.remove('show');
    }, isError ? 5000 : 3000);
  }

  // 设置事件监听
  setupEventListeners() {
    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', async () => {
      this.settings = this.getFormValues();
      await this.saveSettings();
      // 应用新语言
      i18n.setLanguage(this.settings.language);
      this.applyI18n();
      this.showSaveStatus(i18n.t('settingsSaved'));
    });

    // 语言选择变化时实时预览
    document.getElementById('language').addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
      this.applyI18n();
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

    // 检查同步状态
    document.getElementById('checkSyncBtn').addEventListener('click', () => {
      this.checkSyncStatus();
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

    this.showSaveStatus(i18n.t('configExported'));
  }

  // 导入数据
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // 检查数据大小
        const dataSize = new Blob([JSON.stringify(data)]).size;
        if (dataSize > 102400) {
          alert(i18n.t('importDataTooLarge'));
        }

        await new Promise((resolve, reject) => {
          chrome.storage.sync.set(data, () => {
            if (chrome.runtime.lastError) {
              // 同步失败，尝试保存到本地
              chrome.storage.local.set(data, () => {
                this.showSaveStatus(i18n.t('savedToLocal'), true);
                resolve();
              });
            } else {
              // 同时保存到本地
              chrome.storage.local.set(data, resolve);
            }
          });
        });

        if (data.settings) {
          this.settings = data.settings;
          this.populateForm();
          // 应用导入的语言设置
          if (data.settings.language) {
            i18n.setLanguage(data.settings.language);
            this.applyI18n();
          }
        }

        this.showSaveStatus(i18n.t('configImported'));
      } catch (err) {
        alert(i18n.t('importFailed'));
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  }

  // 重置数据
  async resetData() {
    if (confirm(i18n.t('confirmReset'))) {
      await new Promise((resolve) => {
        chrome.storage.sync.clear(resolve);
      });
      await new Promise((resolve) => {
        chrome.storage.local.clear(resolve);
      });

      // 重置为默认设置
      this.settings = {
        columns: 6,
        language: 'zh-CN'
      };

      this.populateForm();
      this.showSaveStatus(i18n.t('dataReset'));
      this.checkSyncStatus();
    }
  }

  // 检查同步状态
  async checkSyncStatus() {
    const SYNC_QUOTA_BYTES = 102400; // 100KB
    const SYNC_QUOTA_BYTES_PER_ITEM = 8192; // 8KB
    
    // 获取同步存储使用量
    chrome.storage.sync.getBytesInUse(null, (syncBytes) => {
      const syncUsageEl = document.getElementById('syncUsage');
      if (chrome.runtime.lastError) {
        syncUsageEl.textContent = i18n.t('getFailed');
        syncUsageEl.style.color = '#ff6b6b';
      } else {
        const percentage = ((syncBytes / SYNC_QUOTA_BYTES) * 100).toFixed(1);
        syncUsageEl.textContent = `${(syncBytes / 1024).toFixed(2)} KB / 100 KB (${percentage}%)`;
        syncUsageEl.style.color = syncBytes > SYNC_QUOTA_BYTES * 0.8 ? '#ff6b6b' : '#4CAF50';
      }
    });

    // 获取本地存储使用量
    chrome.storage.local.getBytesInUse(null, (localBytes) => {
      const localUsageEl = document.getElementById('localUsage');
      if (chrome.runtime.lastError) {
        localUsageEl.textContent = i18n.t('getFailed');
      } else {
        localUsageEl.textContent = `${(localBytes / 1024).toFixed(2)} KB`;
      }
    });

    // 检查同步数据完整性
    const syncData = await new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });

    const statusEl = document.getElementById('syncStatusText');
    if (syncData === null) {
      statusEl.textContent = `❌ ${i18n.t('syncAccessFailed')}`;
      statusEl.style.color = '#ff6b6b';
    } else if (syncData.dials) {
      // 检查 dials 数据大小
      const dialsSize = new Blob([JSON.stringify(syncData.dials)]).size;
      if (dialsSize > SYNC_QUOTA_BYTES_PER_ITEM) {
        statusEl.textContent = `⚠️ ${i18n.t('dataTooLarge')} (${(dialsSize/1024).toFixed(1)}KB > 8KB), ${i18n.t('cannotSync')}`;
        statusEl.style.color = '#ff9800';
      } else {
        statusEl.textContent = `✅ ${i18n.t('syncNormal')} (${syncData.dials.length} ${i18n.t('shortcutsSynced')})`;
        statusEl.style.color = '#4CAF50';
      }
    } else {
      statusEl.textContent = `⚠️ ${i18n.t('noSyncData')}`;
      statusEl.style.color = '#ff9800';
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
});
