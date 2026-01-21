/**
 * My Speed Dial - 设置页面逻辑
 */

class OptionsPage {
  constructor() {
    this.settings = {
      searchEngine: 'google',
      showClock: true,
      showSearch: true,
      columns: 6
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.populateForm();
    this.setupEventListeners();
    this.checkSyncStatus();
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
          this.showSaveStatus('同步失败: ' + chrome.runtime.lastError.message, true);
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
    document.getElementById('searchEngine').value = this.settings.searchEngine;
    document.getElementById('showClock').checked = this.settings.showClock;
    document.getElementById('showSearch').checked = this.settings.showSearch;
    document.getElementById('columns').value = this.settings.columns;
  }

  // 从表单获取设置
  getFormValues() {
    return {
      searchEngine: document.getElementById('searchEngine').value,
      showClock: document.getElementById('showClock').checked,
      showSearch: document.getElementById('showSearch').checked,
      columns: parseInt(document.getElementById('columns').value)
    };
  }

  // 显示保存状态
  showSaveStatus(message = '设置已保存', isError = false) {
    const status = document.getElementById('saveStatus');
    status.textContent = message;
    status.style.background = isError ? '#ff6b6b' : '#4CAF50';
    status.classList.add('show');
    setTimeout(() => {
      status.classList.remove('show');
    }, isError ? 5000 : 2000);
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

    this.showSaveStatus('配置已导出');
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
          alert('导入的数据过大（超过100KB），可能无法完全同步到其他设备。请减少快捷方式数量或简化 SVG 图标。');
        }

        await new Promise((resolve, reject) => {
          chrome.storage.sync.set(data, () => {
            if (chrome.runtime.lastError) {
              // 同步失败，尝试保存到本地
              chrome.storage.local.set(data, () => {
                this.showSaveStatus('同步失败，已保存到本地', true);
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
      await new Promise((resolve) => {
        chrome.storage.local.clear(resolve);
      });

      // 重置为默认设置
      this.settings = {
        searchEngine: 'google',
        showClock: true,
        showSearch: true,
        columns: 6
      };

      this.populateForm();
      this.showSaveStatus('数据已重置');
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
        syncUsageEl.textContent = '获取失败';
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
        localUsageEl.textContent = '获取失败';
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
      statusEl.textContent = '❌ 同步存储访问失败';
      statusEl.style.color = '#ff6b6b';
    } else if (syncData.dials) {
      // 检查 dials 数据大小
      const dialsSize = new Blob([JSON.stringify(syncData.dials)]).size;
      if (dialsSize > SYNC_QUOTA_BYTES_PER_ITEM) {
        statusEl.textContent = `⚠️ 快捷方式数据过大 (${(dialsSize/1024).toFixed(1)}KB > 8KB)，无法同步`;
        statusEl.style.color = '#ff9800';
      } else {
        statusEl.textContent = `✅ 正常 (${syncData.dials.length} 个快捷方式已同步)`;
        statusEl.style.color = '#4CAF50';
      }
    } else {
      statusEl.textContent = '⚠️ 无同步数据，使用默认配置';
      statusEl.style.color = '#ff9800';
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
});
