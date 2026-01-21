/**
 * fast-access - 国际化模块
 * 支持 5 种语言：英语、简体中文、繁體中文、日语、西班牙语
 */

const i18n = {
  // 当前语言
  currentLang: 'zh-CN',

  // 翻译数据
  translations: {
    'en': {
      // 新标签页
      newTab: 'New Tab',
      addShortcut: 'Add Shortcut',
      editShortcut: 'Edit Shortcut',
      name: 'Name',
      url: 'URL',
      namePlaceholder: 'e.g., Google',
      urlPlaceholder: 'https://www.google.com',
      iconLabel: 'Icon (Optional, SVG code only)',
      iconPlaceholder: 'Paste SVG code, leave empty to use default icon',
      iconHint: 'Tip: Get brand SVG icons from',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      settings: 'Settings',
      confirmDelete: 'Are you sure you want to delete this shortcut?',

      // 设置页面
      settingsTitle: 'fast-access Settings',
      displaySettings: 'Display Settings',
      columnsPerRow: 'Items per row',
      items: 'items',
      languageSettings: 'Language',
      language: 'Language',
      dataManagement: 'Data Management',
      exportConfig: 'Export',
      importConfig: 'Import',
      resetAll: 'Reset All',
      confirmReset: 'Are you sure you want to reset all data? This will delete all shortcuts and settings.',
      syncStatus: 'Sync Status',
      syncUsage: 'Sync storage usage:',
      localUsage: 'Local storage usage:',
      syncState: 'Sync status:',
      checking: 'Checking...',
      syncTip: 'Tip: Chrome sync storage limit is 100KB, max 8KB per item. Only SVG icons are supported for sync.',
      checkSync: 'Check Sync',
      about: 'About',
      description: 'A clean and efficient new tab speed dial extension',
      changelog: 'Changelog',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved, please refresh the new tab to see changes',
      configExported: 'Configuration exported',
      configImported: 'Configuration imported',
      importFailed: 'Import failed: Invalid configuration file',
      dataReset: 'Data reset',
      syncFailed: 'Sync failed: ',
      savedToLocal: 'Sync failed, saved locally',
      getFailed: 'Failed to get',
      syncNormal: 'Normal',
      shortcutsSynced: 'shortcuts synced',
      noSyncData: 'No sync data, using defaults',
      dataTooLarge: 'Shortcut data too large',
      cannotSync: 'cannot sync',
      syncAccessFailed: 'Sync storage access failed',
      fillNameUrl: 'Please fill in name and URL',
      invalidIcon: 'Invalid icon format! Only SVG code is supported.\n\nPlease paste SVG code starting with <svg, or leave empty to use default icon.',
      importDataTooLarge: 'Imported data is too large (over 100KB), may not fully sync to other devices. Please reduce shortcuts or simplify SVG icons.',

      // 更新日志
      v110Changes: 'v1.1.0 Changes:',
      v110Change1: 'Removed search bar, focus on shortcuts',
      v110Change2: 'Removed clock display, cleaner interface',
      v110Change3: 'Fixed items per row setting not working',
      v110Change4: 'Optimized settings page layout',
      v120Changes: 'v1.2.0 Changes:',
      v120Change1: 'Added multi-language support (5 languages)'
    },

    'zh-CN': {
      // 新标签页
      newTab: '新标签页',
      addShortcut: '添加快捷方式',
      editShortcut: '编辑快捷方式',
      name: '名称',
      url: '网址',
      namePlaceholder: '例如：Google',
      urlPlaceholder: 'https://www.google.com',
      iconLabel: '图标 (可选，仅支持 SVG 代码)',
      iconPlaceholder: '粘贴 SVG 代码，留空将使用默认图标',
      iconHint: '提示：可从以下网站获取品牌 SVG 图标',
      cancel: '取消',
      save: '保存',
      edit: '编辑',
      delete: '删除',
      settings: '设置',
      confirmDelete: '确定要删除这个快捷方式吗？',

      // 设置页面
      settingsTitle: 'fast-access 设置',
      displaySettings: '显示设置',
      columnsPerRow: '每行显示数量',
      items: '个',
      languageSettings: '语言设置',
      language: '语言',
      dataManagement: '数据管理',
      exportConfig: '导出配置',
      importConfig: '导入配置',
      resetAll: '重置所有数据',
      confirmReset: '确定要重置所有数据吗？这将删除所有快捷方式和设置。',
      syncStatus: '同步状态',
      syncUsage: '同步存储使用量:',
      localUsage: '本地存储使用量:',
      syncState: '同步状态:',
      checking: '检测中...',
      syncTip: '提示: Chrome 同步存储限制为 100KB，单项最大 8KB。图标仅支持 SVG 格式以确保同步正常工作。',
      checkSync: '检查同步状态',
      about: '关于',
      description: '简洁高效的新标签页快速拨号扩展',
      changelog: '更新日志',
      saveSettings: '保存设置',
      settingsSaved: '设置已保存，请刷新新标签页以查看更改',
      configExported: '配置已导出',
      configImported: '配置已导入',
      importFailed: '导入失败：无效的配置文件',
      dataReset: '数据已重置',
      syncFailed: '同步失败: ',
      savedToLocal: '同步失败，已保存到本地',
      getFailed: '获取失败',
      syncNormal: '正常',
      shortcutsSynced: '个快捷方式已同步',
      noSyncData: '无同步数据，使用默认配置',
      dataTooLarge: '快捷方式数据过大',
      cannotSync: '无法同步',
      syncAccessFailed: '同步存储访问失败',
      fillNameUrl: '请填写名称和网址',
      invalidIcon: '图标格式无效！只支持 SVG 代码。\n\n请粘贴以 <svg 开头的 SVG 代码，或留空使用默认图标。',
      importDataTooLarge: '导入的数据过大（超过100KB），可能无法完全同步到其他设备。请减少快捷方式数量或简化 SVG 图标。',

      // 更新日志
      v110Changes: 'v1.1.0 更新内容：',
      v110Change1: '移除搜索栏功能，专注于快捷方式',
      v110Change2: '移除时钟显示，界面更简洁',
      v110Change3: '修复每行显示数量设置不生效的问题',
      v110Change4: '优化设置页面布局，更加紧凑',
      v120Changes: 'v1.2.0 更新内容：',
      v120Change1: '新增多语言支持（5种语言）'
    },

    'zh-TW': {
      // 新标签页
      newTab: '新分頁',
      addShortcut: '新增捷徑',
      editShortcut: '編輯捷徑',
      name: '名稱',
      url: '網址',
      namePlaceholder: '例如：Google',
      urlPlaceholder: 'https://www.google.com',
      iconLabel: '圖示 (選填，僅支援 SVG 代碼)',
      iconPlaceholder: '貼上 SVG 代碼，留空將使用預設圖示',
      iconHint: '提示：可從以下網站取得品牌 SVG 圖示',
      cancel: '取消',
      save: '儲存',
      edit: '編輯',
      delete: '刪除',
      settings: '設定',
      confirmDelete: '確定要刪除這個捷徑嗎？',

      // 设置页面
      settingsTitle: 'fast-access 設定',
      displaySettings: '顯示設定',
      columnsPerRow: '每列顯示數量',
      items: '個',
      languageSettings: '語言設定',
      language: '語言',
      dataManagement: '資料管理',
      exportConfig: '匯出設定',
      importConfig: '匯入設定',
      resetAll: '重置所有資料',
      confirmReset: '確定要重置所有資料嗎？這將刪除所有捷徑和設定。',
      syncStatus: '同步狀態',
      syncUsage: '同步儲存使用量:',
      localUsage: '本機儲存使用量:',
      syncState: '同步狀態:',
      checking: '偵測中...',
      syncTip: '提示: Chrome 同步儲存限制為 100KB，單項最大 8KB。圖示僅支援 SVG 格式以確保同步正常運作。',
      checkSync: '檢查同步狀態',
      about: '關於',
      description: '簡潔高效的新分頁快速撥號擴充功能',
      changelog: '更新日誌',
      saveSettings: '儲存設定',
      settingsSaved: '設定已儲存，請重新整理新分頁以查看更改',
      configExported: '設定已匯出',
      configImported: '設定已匯入',
      importFailed: '匯入失敗：無效的設定檔',
      dataReset: '資料已重置',
      syncFailed: '同步失敗: ',
      savedToLocal: '同步失敗，已儲存至本機',
      getFailed: '取得失敗',
      syncNormal: '正常',
      shortcutsSynced: '個捷徑已同步',
      noSyncData: '無同步資料，使用預設設定',
      dataTooLarge: '捷徑資料過大',
      cannotSync: '無法同步',
      syncAccessFailed: '同步儲存存取失敗',
      fillNameUrl: '請填寫名稱和網址',
      invalidIcon: '圖示格式無效！僅支援 SVG 代碼。\n\n請貼上以 <svg 開頭的 SVG 代碼，或留空使用預設圖示。',
      importDataTooLarge: '匯入的資料過大（超過100KB），可能無法完全同步至其他裝置。請減少捷徑數量或簡化 SVG 圖示。',

      // 更新日志
      v110Changes: 'v1.1.0 更新內容：',
      v110Change1: '移除搜尋列功能，專注於捷徑',
      v110Change2: '移除時鐘顯示，介面更簡潔',
      v110Change3: '修復每列顯示數量設定不生效的問題',
      v110Change4: '優化設定頁面佈局，更加緊湊',
      v120Changes: 'v1.2.0 更新內容：',
      v120Change1: '新增多語言支援（5種語言）'
    },

    'ja': {
      // 新标签页
      newTab: '新しいタブ',
      addShortcut: 'ショートカットを追加',
      editShortcut: 'ショートカットを編集',
      name: '名前',
      url: 'URL',
      namePlaceholder: '例：Google',
      urlPlaceholder: 'https://www.google.com',
      iconLabel: 'アイコン（任意、SVGコードのみ）',
      iconPlaceholder: 'SVGコードを貼り付け、空欄でデフォルトアイコンを使用',
      iconHint: 'ヒント：以下のサイトからブランドSVGアイコンを取得できます',
      cancel: 'キャンセル',
      save: '保存',
      edit: '編集',
      delete: '削除',
      settings: '設定',
      confirmDelete: 'このショートカットを削除してもよろしいですか？',

      // 设置页面
      settingsTitle: 'fast-access 設定',
      displaySettings: '表示設定',
      columnsPerRow: '1行あたりの表示数',
      items: '個',
      languageSettings: '言語設定',
      language: '言語',
      dataManagement: 'データ管理',
      exportConfig: 'エクスポート',
      importConfig: 'インポート',
      resetAll: 'すべてリセット',
      confirmReset: 'すべてのデータをリセットしてもよろしいですか？すべてのショートカットと設定が削除されます。',
      syncStatus: '同期状態',
      syncUsage: '同期ストレージ使用量:',
      localUsage: 'ローカルストレージ使用量:',
      syncState: '同期状態:',
      checking: '確認中...',
      syncTip: 'ヒント: Chrome同期ストレージの制限は100KB、1アイテム最大8KBです。同期を正常に動作させるため、SVG形式のアイコンのみサポートしています。',
      checkSync: '同期状態を確認',
      about: 'について',
      description: 'シンプルで効率的な新しいタブのスピードダイヤル拡張機能',
      changelog: '更新履歴',
      saveSettings: '設定を保存',
      settingsSaved: '設定を保存しました。変更を確認するには新しいタブを更新してください',
      configExported: '設定をエクスポートしました',
      configImported: '設定をインポートしました',
      importFailed: 'インポート失敗：無効な設定ファイル',
      dataReset: 'データをリセットしました',
      syncFailed: '同期失敗: ',
      savedToLocal: '同期失敗、ローカルに保存しました',
      getFailed: '取得失敗',
      syncNormal: '正常',
      shortcutsSynced: '個のショートカットが同期済み',
      noSyncData: '同期データなし、デフォルト設定を使用',
      dataTooLarge: 'ショートカットデータが大きすぎます',
      cannotSync: '同期できません',
      syncAccessFailed: '同期ストレージへのアクセス失敗',
      fillNameUrl: '名前とURLを入力してください',
      invalidIcon: 'アイコン形式が無効です！SVGコードのみサポートしています。\n\n<svgで始まるSVGコードを貼り付けるか、空欄にしてデフォルトアイコンを使用してください。',
      importDataTooLarge: 'インポートデータが大きすぎます（100KB超）。他のデバイスに完全に同期できない可能性があります。ショートカットを減らすか、SVGアイコンを簡略化してください。',

      // 更新日志
      v110Changes: 'v1.1.0 更新内容：',
      v110Change1: '検索バーを削除、ショートカットに集中',
      v110Change2: '時計表示を削除、インターフェースをシンプルに',
      v110Change3: '1行あたりの表示数設定が機能しない問題を修正',
      v110Change4: '設定ページのレイアウトを最適化',
      v120Changes: 'v1.2.0 更新内容：',
      v120Change1: '多言語サポートを追加（5言語）'
    },

    'es': {
      // 新标签页
      newTab: 'Nueva pestaña',
      addShortcut: 'Añadir acceso directo',
      editShortcut: 'Editar acceso directo',
      name: 'Nombre',
      url: 'URL',
      namePlaceholder: 'Ej: Google',
      urlPlaceholder: 'https://www.google.com',
      iconLabel: 'Icono (Opcional, solo código SVG)',
      iconPlaceholder: 'Pega el código SVG, déjalo vacío para usar el icono predeterminado',
      iconHint: 'Consejo: Obtén iconos SVG de marcas en',
      cancel: 'Cancelar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      settings: 'Configuración',
      confirmDelete: '¿Estás seguro de que quieres eliminar este acceso directo?',

      // 设置页面
      settingsTitle: 'Configuración de fast-access',
      displaySettings: 'Configuración de visualización',
      columnsPerRow: 'Elementos por fila',
      items: '',
      languageSettings: 'Idioma',
      language: 'Idioma',
      dataManagement: 'Gestión de datos',
      exportConfig: 'Exportar',
      importConfig: 'Importar',
      resetAll: 'Restablecer todo',
      confirmReset: '¿Estás seguro de que quieres restablecer todos los datos? Esto eliminará todos los accesos directos y configuraciones.',
      syncStatus: 'Estado de sincronización',
      syncUsage: 'Uso de almacenamiento sincronizado:',
      localUsage: 'Uso de almacenamiento local:',
      syncState: 'Estado de sincronización:',
      checking: 'Verificando...',
      syncTip: 'Consejo: El límite de almacenamiento sincronizado de Chrome es 100KB, máximo 8KB por elemento. Solo se admiten iconos SVG para la sincronización.',
      checkSync: 'Verificar sincronización',
      about: 'Acerca de',
      description: 'Una extensión de marcación rápida limpia y eficiente para nuevas pestañas',
      changelog: 'Registro de cambios',
      saveSettings: 'Guardar configuración',
      settingsSaved: 'Configuración guardada, actualiza la nueva pestaña para ver los cambios',
      configExported: 'Configuración exportada',
      configImported: 'Configuración importada',
      importFailed: 'Error de importación: Archivo de configuración no válido',
      dataReset: 'Datos restablecidos',
      syncFailed: 'Error de sincronización: ',
      savedToLocal: 'Error de sincronización, guardado localmente',
      getFailed: 'Error al obtener',
      syncNormal: 'Normal',
      shortcutsSynced: 'accesos directos sincronizados',
      noSyncData: 'Sin datos de sincronización, usando configuración predeterminada',
      dataTooLarge: 'Datos de accesos directos demasiado grandes',
      cannotSync: 'no se puede sincronizar',
      syncAccessFailed: 'Error de acceso al almacenamiento sincronizado',
      fillNameUrl: 'Por favor, completa el nombre y la URL',
      invalidIcon: '¡Formato de icono no válido! Solo se admite código SVG.\n\nPega código SVG que comience con <svg, o déjalo vacío para usar el icono predeterminado.',
      importDataTooLarge: 'Los datos importados son demasiado grandes (más de 100KB), puede que no se sincronicen completamente con otros dispositivos. Reduce los accesos directos o simplifica los iconos SVG.',

      // 更新日志
      v110Changes: 'Cambios en v1.1.0:',
      v110Change1: 'Eliminada la barra de búsqueda, enfocado en accesos directos',
      v110Change2: 'Eliminado el reloj, interfaz más limpia',
      v110Change3: 'Corregido el problema de elementos por fila que no funcionaba',
      v110Change4: 'Optimizado el diseño de la página de configuración',
      v120Changes: 'Cambios en v1.2.0:',
      v120Change1: 'Añadido soporte multiidioma (5 idiomas)'
    }
  },

  // 语言名称映射
  languageNames: {
    'en': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ja': '日本語',
    'es': 'Español'
  },

  // 初始化
  async init() {
    // 从存储加载语言设置
    return new Promise((resolve) => {
      chrome.storage.sync.get(['settings'], (result) => {
        if (result.settings && result.settings.language) {
          this.currentLang = result.settings.language;
        } else {
          // 尝试使用浏览器语言
          const browserLang = navigator.language;
          if (this.translations[browserLang]) {
            this.currentLang = browserLang;
          } else if (browserLang.startsWith('zh')) {
            this.currentLang = browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN';
          } else if (browserLang.startsWith('ja')) {
            this.currentLang = 'ja';
          } else if (browserLang.startsWith('es')) {
            this.currentLang = 'es';
          } else {
            this.currentLang = 'en';
          }
        }
        resolve();
      });
    });
  },

  // 获取翻译文本
  t(key) {
    const translations = this.translations[this.currentLang] || this.translations['en'];
    return translations[key] || this.translations['en'][key] || key;
  },

  // 设置语言
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
    }
  },

  // 获取当前语言
  getLanguage() {
    return this.currentLang;
  },

  // 获取所有支持的语言
  getSupportedLanguages() {
    return Object.keys(this.translations);
  }
};
