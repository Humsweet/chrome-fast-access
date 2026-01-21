/**
 * fast-access - 新标签页主逻辑
 * 使用 Chrome Storage Sync API 同步配置
 */

// 默认 SVG 图标 - 用于没有自定义图标的网页
const DEFAULT_ICON_SVG = `<svg width="800px" height="800px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg">
<style type="text/css">
	.st0{fill:#333333;}
</style>
<g>
<path class="st0" d="M393.87,74.21H118.13c-24.25,0-43.91,19.66-43.91,43.91v275.74c0,24.25,19.66,43.91,43.91,43.91h275.74    c24.25,0,43.91-19.66,43.91-43.91V118.13C437.79,93.87,418.13,74.21,393.87,74.21z M354.04,272H272v82.04c0,8.84-7.16,16-16,16    s-16-7.16-16-16V272h-82.04c-8.84,0-16-7.16-16-16s7.16-16,16-16H240v-82.04c0-8.84,7.16-16,16-16s16,7.16,16,16V240h82.04    c8.84,0,16,7.16,16,16S362.88,272,354.04,272z"/>
</g>
</svg>`;

class SpeedDial {
  constructor() {
    this.dials = [];
    this.settings = {
      columns: 6,
      language: 'zh-CN'
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
    const columns = this.settings.columns || 6;
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
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

    // 设置按钮
    document.getElementById('settingsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.hideContextMenu();
      }
    });
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
