/**
 * My Speed Dial - 新标签页主逻辑
 * 使用 Chrome Storage Sync API 同步配置
 */

class SpeedDial {
  constructor() {
    this.dials = [];
    this.settings = {
      columns: 6,
      showClock: true,
      showSearch: true,
      searchEngine: 'google'
    };
    this.editingIndex = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.renderDials();
    this.setupClock();
    this.setupSearch();
    this.setupEventListeners();
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

    this.dials.forEach((dial, index) => {
      const dialEl = this.createDialElement(dial, index);
      grid.appendChild(dialEl);
    });

    // 添加"添加"按钮
    const addBtn = document.createElement('div');
    addBtn.className = 'dial-item dial-add';
    addBtn.innerHTML = `
      <div class="add-icon">+</div>
      <span class="dial-name">添加快捷方式</span>
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

    // 使用 Google Favicon 服务
    try {
      const url = new URL(dial.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
      return `<img src="${faviconUrl}" alt="${this.escapeHtml(dial.name)}" onerror="this.parentElement.innerHTML='${this.getLetterIcon(dial.name)}'">`;
    } catch {
      return this.getLetterIcon(dial.name);
    }
  }

  // 获取字母图标
  getLetterIcon(name) {
    const letter = name.charAt(0).toUpperCase();
    const color = '#9ba3af'; // 统一的浅蓝灰色
    return `<div class="letter-icon" style="background: ${color}">${letter}</div>`;
  }

  // 设置时钟
  setupClock() {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('clock').textContent = `${hours}:${minutes}`;

      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById('date').textContent = now.toLocaleDateString('zh-CN', options);
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  // 设置搜索
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          let searchUrl;
          // 检测是否为 URL
          if (this.isValidUrl(query)) {
            searchUrl = query.startsWith('http') ? query : `https://${query}`;
          } else {
            // 使用搜索引擎
            const engines = {
              google: 'https://www.google.com/search?q=',
              bing: 'https://www.bing.com/search?q=',
              baidu: 'https://www.baidu.com/s?wd=',
              duckduckgo: 'https://duckduckgo.com/?q='
            };
            searchUrl = engines[this.settings.searchEngine] + encodeURIComponent(query);
          }
          window.location.href = searchUrl;
        }
      }
    });
  }

  // 检测是否为有效 URL
  isValidUrl(str) {
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return urlPattern.test(str);
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
      title.textContent = '编辑快捷方式';
      nameInput.value = dial.name;
      urlInput.value = dial.url;
      iconInput.value = dial.icon || '';
    } else {
      // 新增模式
      title.textContent = '添加快捷方式';
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
      alert('请填写名称和网址');
      return;
    }

    // 验证图标格式：只允许 SVG 或空
    let icon = '';
    if (iconInput) {
      if (!this.isValidSvg(iconInput)) {
        alert('图标格式无效！只支持 SVG 代码。\n\n请粘贴以 <svg 开头的 SVG 代码，或留空使用默认图标。');
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
    if (confirm('确定要删除这个快捷方式吗？')) {
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
