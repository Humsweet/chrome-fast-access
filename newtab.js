/**
 * fast-access - 新标签页主逻辑
 * 使用 Chrome Storage Sync API 同步配置
 */

// 默认 SVG 图标 - 用于没有自定义图标的网页
const DEFAULT_ICON_SVG = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.15" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#000000"/>
<path d="M12 17V16.9929M12 14.8571C12 11.6429 15 12.3571 15 9.85714C15 8.27919 13.6568 7 12 7C10.6567 7 9.51961 7.84083 9.13733 9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

class SpeedDial {
  constructor() {
    this.dials = [];
    this.settings = {
      columns: 4,
      language: 'zh-CN',
      iconScale: 1
    };
    this.editingIndex = null;
    this.init();
  }

  async init() {
    await i18n.init();
    await this.loadData();
    this.applyI18n();
    this.renderDials();
    this.applySettings();
    this.setupEventListeners();
  }

  // 应用国际化
  applyI18n() {
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = i18n.t(key);
    });
    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = i18n.t(key);
    });
    // 更新 title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = i18n.t(key);
    });
    // 更新页面标题
    document.title = i18n.t('newTab');
  }

  // 加载数据
  async loadData() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['dials', 'settings'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('加载同步数据失败:', chrome.runtime.lastError.message);
          // 尝试从本地存储加载
          chrome.storage.local.get(['dials', 'settings'], (localResult) => {
            this.loadFromResult(localResult);
            resolve();
          });
          return;
        }
        this.loadFromResult(result);
        resolve();
      });
    });
  }

  // 从结果加载数据
  loadFromResult(result) {
    if (result.dials) {
      this.dials = result.dials;
    } else {
      // 默认快捷方式
      this.dials = [
        { name: 'Google', url: 'https://www.google.com', icon: '' },
        { name: 'YouTube', url: 'https://www.youtube.com', icon: '' },
        { name: 'GitHub', url: 'https://www.github.com', icon: '' },
        { name: 'Twitter', url: 'https://www.twitter.com', icon: '' }
      ];
    }
    if (result.settings) {
      this.settings = { ...this.settings, ...result.settings };
    }
  }

  // 保存数据
  async saveData() {
    const data = {
      dials: this.dials,
      settings: this.settings
    };

    // 检查数据大小
    const dataSize = new Blob([JSON.stringify(data)]).size;
    const SYNC_QUOTA_BYTES = 102400; // 100KB
    const SYNC_QUOTA_BYTES_PER_ITEM = 8192; // 8KB

    // 检查单项大小
    const dialsSize = new Blob([JSON.stringify(this.dials)]).size;
    if (dialsSize > SYNC_QUOTA_BYTES_PER_ITEM) {
      console.warn(`快捷方式数据 (${(dialsSize/1024).toFixed(1)}KB) 超出同步限制 (8KB)，将仅保存到本地`);
      this.showSyncWarning('数据过大，仅保存到本地。请减少快捷方式数量或简化 SVG 图标。');
      return this.saveToLocalOnly(data);
    }

    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('同步保存失败:', chrome.runtime.lastError.message);
          this.showSyncWarning('同步失败: ' + chrome.runtime.lastError.message);
          // 回退到本地存储
          this.saveToLocalOnly(data).then(resolve);
        } else {
          // 同时保存到本地作为备份
          chrome.storage.local.set(data, () => {
            console.log('数据已同步保存');
            resolve();
          });
        }
      });
    });
  }

  // 仅保存到本地存储
  async saveToLocalOnly(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('本地保存也失败:', chrome.runtime.lastError.message);
        }
        resolve();
      });
    });
  }

  // 显示同步警告
  showSyncWarning(message) {
    // 检查是否已存在警告元素
    let warning = document.getElementById('syncWarning');
    if (!warning) {
      warning = document.createElement('div');
      warning.id = 'syncWarning';
      warning.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(warning);
    }
    warning.textContent = message;
    setTimeout(() => warning.remove(), 5000);
  }

  // 渲染快捷方式
  renderDials() {
    const grid = document.getElementById('dialsGrid');
    grid.innerHTML = '';

    // 应用列数设置
    this.applySettings();

    this.dials.forEach((dial, index) => {
      const dialEl = this.createDialElement(dial, index);
      grid.appendChild(dialEl);
    });

    // 添加"添加"按钮
    const addBtn = document.createElement('div');
    addBtn.className = 'dial-item dial-add';
    addBtn.innerHTML = `
      <div class="add-icon">+</div>
      <span class="dial-name">${i18n.t('addShortcut')}</span>
    `;
    addBtn.addEventListener('click', () => this.openModal());
    grid.appendChild(addBtn);
  }

  // 创建快捷方式元素
  createDialElement(dial, index) {
    const el = document.createElement('a');
    el.className = 'dial-item';
    el.href = dial.url;
    el.draggable = true;
    el.dataset.index = index;

    const iconHtml = this.getIconHtml(dial);
    
    el.innerHTML = `
      <div class="dial-icon">${iconHtml}</div>
      <span class="dial-name">${this.escapeHtml(dial.name)}</span>
    `;

    // 右键菜单
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, index);
    });

    // 拖拽事件
    el.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
    el.addEventListener('dragover', (e) => this.handleDragOver(e));
    el.addEventListener('drop', (e) => this.handleDrop(e, index));
    el.addEventListener('dragend', () => this.handleDragEnd());

    return el;
  }

  // 获取图标 HTML
  getIconHtml(dial) {
    if (dial.icon) {
      // 只支持 SVG 代码
      if (dial.icon.trim().startsWith('<svg')) {
        return dial.icon;
      }
      // 非 SVG 格式，忽略并使用默认
    }

    // 使用默认 SVG 图标
    return DEFAULT_ICON_SVG;
  }

  // 获取字母图标
  getLetterIcon(name) {
    const letter = name.charAt(0).toUpperCase();
    const color = '#9ba3af'; // 统一的浅蓝灰色
    return `<div class="letter-icon" style="background: ${color}">${letter}</div>`;
  }

  // 应用设置
  applySettings() {
    const grid = document.getElementById('dialsGrid');
    const columns = this.settings.columns || 4;
    const scale = this.settings.iconScale || 1;

    // 基础尺寸（1x 时的大小）
    const baseIconSize = 96;
    const baseCardSize = 200;
    const baseGap = 32;
    const baseMargin = 20;
    const baseFontSize = 18;

    const scaledIconSize = baseIconSize * scale;
    const scaledCardSize = baseCardSize * scale;
    const scaledGap = baseGap * scale;
    const scaledMargin = baseMargin * scale;
    const scaledFontSize = baseFontSize * scale;

    document.documentElement.style.setProperty('--icon-size', `${scaledIconSize}px`);
    document.documentElement.style.setProperty('--card-size', `${scaledCardSize}px`);
    document.documentElement.style.setProperty('--gap-size', `${scaledGap}px`);
    document.documentElement.style.setProperty('--icon-margin', `${scaledMargin}px`);
    document.documentElement.style.setProperty('--font-size', `${scaledFontSize}px`);

    // 计算网格宽度以控制每行数量
    const gridWidth = (scaledCardSize * columns) + (scaledGap * (columns - 1));
    grid.style.width = `${gridWidth}px`;
    grid.style.maxWidth = '100%';
  }

  // 设置事件监听
  setupEventListeners() {
    // 弹窗相关
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
    document.getElementById('modalSave').addEventListener('click', () => this.saveDial());

    // 点击弹窗外部关闭
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') this.closeModal();
    });

    // 隐藏右键菜单
    document.addEventListener('click', () => this.hideContextMenu());

    // 设置按钮 - 打开设置弹窗
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettingsModal();
    });

    // 设置弹窗相关
    this.setupSettingsModalListeners();

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeSettingsModal();
        this.hideContextMenu();
      }
    });
  }

  // 设置弹窗事件监听
  setupSettingsModalListeners() {
    // 关闭按钮
    document.getElementById('settingsClose').addEventListener('click', () => {
      this.closeSettingsModal();
    });

    // 点击弹窗外部关闭
    document.getElementById('settingsModal').addEventListener('click', (e) => {
      if (e.target.id === 'settingsModal') this.closeSettingsModal();
    });

    // 导航切换
    document.querySelectorAll('.settings-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        this.switchSettingsSection(section);
      });
    });

    // 图标缩放滑块
    document.getElementById('iconScaleSettings').addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById('scaleValue').textContent = `${value}x`;
    });

    // 语言选择变化时实时预览
    document.getElementById('languageSettings').addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
      this.applyI18n();
    });

    // 保存设置按钮
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettingsFromModal();
    });

    // 导出配置
    document.getElementById('exportBtnSettings').addEventListener('click', () => {
      this.exportData();
    });

    // 导入配置
    document.getElementById('importBtnSettings').addEventListener('click', () => {
      document.getElementById('importFileSettings').click();
    });

    document.getElementById('importFileSettings').addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });

    // 重置数据
    document.getElementById('resetBtnSettings').addEventListener('click', () => {
      this.resetData();
    });

    // 检查同步状态
    document.getElementById('checkSyncBtnSettings').addEventListener('click', () => {
      this.checkSyncStatus();
    });
  }

  // 打开设置弹窗
  openSettingsModal() {
    const modal = document.getElementById('settingsModal');

    // 填充当前设置
    document.getElementById('columnsSettings').value = this.settings.columns || 6;
    document.getElementById('iconScaleSettings').value = this.settings.iconScale || 1;
    document.getElementById('scaleValue').textContent = `${this.settings.iconScale || 1}x`;
    document.getElementById('languageSettings').value = this.settings.language || i18n.getLanguage();

    // 检查同步状态
    this.checkSyncStatus();

    modal.classList.remove('hidden');
  }

  // 关闭设置弹窗
  closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
  }

  // 切换设置分区
  switchSettingsSection(sectionName) {
    // 更新导航
    document.querySelectorAll('.settings-nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-section') === sectionName);
    });

    // 更新内容
    document.querySelectorAll('.settings-section').forEach(section => {
      section.classList.toggle('active', section.getAttribute('data-section') === sectionName);
    });
  }

  // 从弹窗保存设置
  async saveSettingsFromModal() {
    this.settings.columns = parseInt(document.getElementById('columnsSettings').value);
    this.settings.iconScale = parseFloat(document.getElementById('iconScaleSettings').value);
    this.settings.language = document.getElementById('languageSettings').value;

    await this.saveData();

    // 应用设置
    i18n.setLanguage(this.settings.language);
    this.applyI18n();
    this.applySettings();
    this.renderDials();

    // 关闭弹窗
    this.closeSettingsModal();
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
  }

  // 检测是否为 Speed Dial 2 配置格式
  isSpeedDial2Format(data) {
    // Speed Dial 2 格式包含 dials 数组，且每个 dial 有 title 和 url（而不是 name）
    if (data.dials && Array.isArray(data.dials) && data.dials.length > 0) {
      const firstDial = data.dials[0];
      // Speed Dial 2 使用 title，我们的格式使用 name
      if (firstDial.title !== undefined && firstDial.url !== undefined && firstDial.name === undefined) {
        return true;
      }
    }
    return false;
  }

  // 从 Speed Dial 2 格式转换数据
  convertFromSpeedDial2(data) {
    return data.dials.map(dial => ({
      name: dial.title || '',
      url: dial.url || '',
      icon: '' // 使用默认图标
    }));
  }

  // 显示导入选项对话框
  showImportDialog(convertedDials) {
    return new Promise((resolve) => {
      const message = `${i18n.t('speedDial2Detected')}\n\n` +
        `• ${i18n.t('addToExisting')}\n` +
        `• ${i18n.t('replaceAll')}`;

      // 使用自定义对话框
      const result = confirm(message + '\n\n' + i18n.t('addToExisting') + '? (OK=' + i18n.t('addToExisting') + ', Cancel=' + i18n.t('replaceAll') + ')');
      resolve(result ? 'add' : 'replace');
    });
  }

  // 导入数据
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // 检测是否为 Speed Dial 2 格式
        if (this.isSpeedDial2Format(data)) {
          const convertedDials = this.convertFromSpeedDial2(data);
          const action = await this.showImportDialog(convertedDials);

          if (action === 'add') {
            // 追加到现有快捷方式
            this.dials = [...this.dials, ...convertedDials];
          } else {
            // 替换全部
            this.dials = convertedDials;
          }

          await this.saveData();

          // 显示导入成功消息
          alert(`${convertedDials.length} ${i18n.t('importedCount')}`);
        } else {
          // 原有格式的导入逻辑
          // 检查数据大小
          const dataSize = new Blob([JSON.stringify(data)]).size;
          if (dataSize > 102400) {
            alert(i18n.t('importDataTooLarge'));
          }

          await new Promise((resolve) => {
            chrome.storage.sync.set(data, () => {
              if (chrome.runtime.lastError) {
                // 同步失败，尝试保存到本地
                chrome.storage.local.set(data, () => {
                  alert(i18n.t('savedToLocal'));
                  resolve();
                });
              } else {
                // 同时保存到本地
                chrome.storage.local.set(data, resolve);
              }
            });
          });

          // 重新加载数据
          await this.loadData();
        }

        // 更新设置弹窗表单
        document.getElementById('columnsSettings').value = this.settings.columns || 6;
        document.getElementById('iconScaleSettings').value = this.settings.iconScale || 1;
        document.getElementById('scaleValue').textContent = `${this.settings.iconScale || 1}x`;
        document.getElementById('languageSettings').value = this.settings.language || i18n.getLanguage();

        // 应用设置
        i18n.setLanguage(this.settings.language);
        this.applyI18n();
        this.applySettings();
        this.renderDials();

        // 关闭弹窗
        this.closeSettingsModal();
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
        columns: 4,
        language: 'zh-CN',
        iconScale: 1
      };

      // 重置为默认快捷方式
      this.dials = [
        { name: 'Google', url: 'https://www.google.com', icon: '' },
        { name: 'YouTube', url: 'https://www.youtube.com', icon: '' },
        { name: 'GitHub', url: 'https://www.github.com', icon: '' },
        { name: 'Twitter', url: 'https://www.twitter.com', icon: '' }
      ];

      // 应用设置
      i18n.setLanguage(this.settings.language);
      this.applyI18n();
      this.applySettings();
      this.renderDials();

      // 关闭弹窗
      this.closeSettingsModal();
    }
  }

  // 检查同步状态
  async checkSyncStatus() {
    const SYNC_QUOTA_BYTES = 102400; // 100KB
    const SYNC_QUOTA_BYTES_PER_ITEM = 8192; // 8KB

    // 获取同步存储使用量
    chrome.storage.sync.getBytesInUse(null, (syncBytes) => {
      const syncUsageEl = document.getElementById('syncUsageSettings');
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
      const localUsageEl = document.getElementById('localUsageSettings');
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

    const statusEl = document.getElementById('syncStatusTextSettings');
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

  // 打开弹窗
  openModal(index = null) {
    this.editingIndex = index;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const nameInput = document.getElementById('dialName');
    const urlInput = document.getElementById('dialUrl');
    const iconInput = document.getElementById('dialIcon');

    if (index !== null) {
      // 编辑模式
      const dial = this.dials[index];
      title.textContent = i18n.t('editShortcut');
      nameInput.value = dial.name;
      urlInput.value = dial.url;
      iconInput.value = dial.icon || '';
    } else {
      // 新增模式
      title.textContent = i18n.t('addShortcut');
      nameInput.value = '';
      urlInput.value = '';
      iconInput.value = '';
    }

    modal.classList.remove('hidden');
    nameInput.focus();
  }

  // 关闭弹窗
  closeModal() {
    document.getElementById('modal').classList.add('hidden');
    this.editingIndex = null;
  }

  // 保存快捷方式
  async saveDial() {
    const name = document.getElementById('dialName').value.trim();
    let url = document.getElementById('dialUrl').value.trim();
    const iconInput = document.getElementById('dialIcon').value.trim();

    if (!name || !url) {
      alert(i18n.t('fillNameUrl'));
      return;
    }

    // 验证图标格式：只允许 SVG 或空
    let icon = '';
    if (iconInput) {
      if (!this.isValidSvg(iconInput)) {
        alert(i18n.t('invalidIcon'));
        return;
      }
      icon = iconInput;
    }

    // 自动补全 URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const dial = { name, url, icon };

    if (this.editingIndex !== null) {
      this.dials[this.editingIndex] = dial;
    } else {
      this.dials.push(dial);
    }

    await this.saveData();
    this.renderDials();
    this.closeModal();
  }

  // 验证是否为有效的 SVG
  isValidSvg(str) {
    const trimmed = str.trim();
    // 必须以 <svg 开头，以 </svg> 结尾
    if (!trimmed.startsWith('<svg') || !trimmed.endsWith('</svg>')) {
      return false;
    }
    // 基本的 XSS 防护：不允许 script 标签和事件处理器
    const dangerous = /<script|on\w+\s*=/i;
    if (dangerous.test(trimmed)) {
      return false;
    }
    return true;
  }

  // 删除快捷方式
  async deleteDial(index) {
    if (confirm(i18n.t('confirmDelete'))) {
      this.dials.splice(index, 1);
      await this.saveData();
      this.renderDials();
    }
  }

  // 显示右键菜单
  showContextMenu(e, index) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.classList.remove('hidden');

    // 绑定菜单操作
    menu.querySelector('[data-action="edit"]').onclick = () => {
      this.openModal(index);
      this.hideContextMenu();
    };
    menu.querySelector('[data-action="delete"]').onclick = () => {
      this.deleteDial(index);
      this.hideContextMenu();
    };
  }

  // 隐藏右键菜单
  hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
  }

  // 拖拽开始
  handleDragStart(e, index) {
    e.dataTransfer.setData('text/plain', index);
    e.target.classList.add('dragging');
  }

  // 拖拽经过
  handleDragOver(e) {
    e.preventDefault();
    e.target.closest('.dial-item')?.classList.add('drag-over');
  }

  // 放下
  async handleDrop(e, targetIndex) {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex !== targetIndex) {
      const [removed] = this.dials.splice(sourceIndex, 1);
      this.dials.splice(targetIndex, 0, removed);
      await this.saveData();
      this.renderDials();
    }
  }

  // 拖拽结束
  handleDragEnd() {
    document.querySelectorAll('.dial-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
  }

  // HTML 转义
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new SpeedDial();
});
