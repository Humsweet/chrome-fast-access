# Chrome Web Store 发布指南

本文档将引导您完成将 **fast-access** 扩展发布到 Chrome Web Store 的完整流程。

---

## 📋 目录

1. [发布前准备](#1-发布前准备)
2. [注册开发者账号](#2-注册开发者账号)
3. [生成发布包](#3-生成发布包)
4. [创建商店素材](#4-创建商店素材)
5. [上传扩展](#5-上传扩展)
6. [填写商店信息](#6-填写商店信息)
7. [提交审核](#7-提交审核)
8. [审核后操作](#8-审核后操作)
9. [常见问题](#9-常见问题)

---

## 1. 发布前准备

### 1.1 检查清单

在开始之前，请确保您已准备好以下内容：

| 项目 | 状态 | 说明 |
|------|------|------|
| ✅ manifest.json | 已完成 | 已配置为 Manifest V3 |
| ✅ PNG 图标 | 需生成 | 16x16, 48x48, 128x128 像素 |
| ✅ 多语言支持 | 已完成 | 英文和简体中文 |
| ⬜ 开发者账号 | 待注册 | 需支付 $5 注册费 |
| ⬜ 商店截图 | 待创建 | 至少 1 张，建议 3-5 张 |
| ⬜ 隐私政策 | 可选 | 如果收集用户数据则必需 |

### 1.2 系统要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

---

## 2. 注册开发者账号

### 2.1 访问 Chrome 开发者控制台

1. 打开浏览器，访问 [Chrome 开发者控制台](https://chrome.google.com/webstore/devconsole)

2. 使用您的 Google 账号登录（建议使用专门的开发者账号）

### 2.2 支付注册费

1. 首次访问时，系统会提示您支付 **一次性 $5 美元** 的开发者注册费

2. 点击 **"Pay this fee now"** 或 **"立即支付此费用"**

3. 选择支付方式：
   - 信用卡 / 借记卡（推荐）
   - Google Pay

4. 完成支付后，等待 1-2 分钟让系统处理

> ⚠️ **注意**: 注册费不可退还。请确保您使用正确的 Google 账号。

### 2.3 填写开发者信息

支付成功后，您需要填写开发者资料：

1. **开发者名称**: 这将显示在商店中（如：Your Name 或 Company Name）
2. **邮箱地址**: 用于接收审核通知和用户反馈
3. **网站**（可选）: 您的个人或公司网站

---

## 3. 生成发布包

### 3.1 安装依赖

在项目根目录打开终端，运行：

```bash
npm install
```

这将安装必要的构建工具（sharp 用于图标转换，archiver 用于打包）。

### 3.2 生成 PNG 图标

Chrome Web Store **不支持 SVG 图标**，必须使用 PNG 格式：

```bash
npm run generate-icons
```

成功后会看到：
```
开始生成图标...

✓ 已生成: icon16.png
✓ 已生成: icon48.png
✓ 已生成: icon128.png

图标生成完成！
```

### 3.3 构建发布包

运行构建命令生成 ZIP 文件：

```bash
npm run build
```

成功后会看到：
```
🚀 开始构建 fast-access v1.0.0...

   ✓ manifest.json
   ✓ newtab.html
   ✓ newtab.css
   ✓ newtab.js
   ✓ options.html
   ✓ options.css
   ✓ options.js
   ✓ icons/
   ✓ _locales/

✅ 构建完成！
📦 输出文件: dist/fast-access-v1.0.0.zip
📏 文件大小: XX.XX KB
```

生成的 ZIP 文件位于 `dist/fast-access-v1.0.0.zip`

---

## 4. 创建商店素材

### 4.1 必需的素材

| 素材 | 尺寸 | 格式 | 说明 |
|------|------|------|------|
| 商店图标 | 128x128 px | PNG | 已包含在项目中 |
| 截图 | 1280x800 或 640x400 px | PNG/JPEG | 至少 1 张，最多 5 张 |
| 宣传图（小） | 440x280 px | PNG/JPEG | 可选，但推荐 |

### 4.2 创建截图

#### 方法一：使用浏览器截图

1. 在 Chrome 中加载您的扩展（开发者模式）
2. 打开新标签页查看扩展效果
3. 按 `F12` 打开开发者工具
4. 按 `Ctrl + Shift + M` 进入响应式设计模式
5. 设置尺寸为 **1280 x 800**
6. 按 `Ctrl + Shift + P`，输入 "screenshot"
7. 选择 **"Capture screenshot"**

#### 方法二：使用截图工具

1. 使用 Windows 截图工具 (`Win + Shift + S`)
2. 截取扩展界面
3. 使用图片编辑器调整到 1280x800 像素

### 4.3 截图建议内容

建议创建以下截图：

1. **主界面截图**: 展示新标签页的整体外观
2. **快捷方式编辑**: 展示添加/编辑快捷方式的功能
3. **设置页面**: 展示自定义选项
4. **深色模式**（如有）: 展示深色主题效果

### 4.4 创建宣传图

使用图片编辑工具（如 Figma、Canva、Photoshop）创建 440x280 像素的宣传图：

1. 使用扩展图标作为主视觉
2. 添加简短的功能描述
3. 使用吸引眼球的配色

---

## 5. 上传扩展

### 5.1 进入开发者控制台

1. 访问 [Chrome 开发者控制台](https://chrome.google.com/webstore/devconsole)
2. 点击右上角的 **"新建项目"** 或 **"+ New Item"**

### 5.2 上传 ZIP 文件

1. 将 `dist/fast-access-v1.0.0.zip` 文件拖拽到上传区域
   
   或点击 **"选择文件"** 手动选择

2. 等待上传和验证完成（通常需要 10-30 秒）

3. 如果出现错误，请查看 [常见问题](#9-常见问题) 部分

---

## 6. 填写商店信息

上传成功后，您需要填写以下信息：

### 6.1 商品详情 (Store Listing)

#### 语言设置

选择 **英语（美国）** 作为默认语言，然后可添加 **简体中文** 翻译。

#### 商品名称

```
fast-access
```

#### 简短描述（最多 132 字符）

英文版本：
```
A clean and efficient new tab speed dial. Customize your shortcuts for quick access to your favorite sites.
```

中文版本：
```
简洁高效的新标签页快速拨号。自定义快捷方式，快速访问您最常用的网站。
```

#### 详细描述（最多 16,000 字符）

英文版本：
```
fast-access transforms your new tab page into a beautiful and efficient speed dial.

✨ FEATURES:

• Quick Access - Add your favorite websites as visual shortcuts
• Clean Design - Minimalist interface that doesn't distract
• Customizable - Edit names, URLs, and icons easily
• Search Integration - Search Google, Bing, Baidu, or DuckDuckGo directly
• Clock Display - Optional time and date display
• Sync Support - Your shortcuts sync across devices with Chrome Sync
• Lightweight - Fast loading, no bloat

🎨 PERSONALIZATION:

• Choose your preferred search engine
• Show or hide the clock and search bar
• Customize the number of shortcuts per row

🔒 PRIVACY:

• No data collection
• All data stored locally or in your Chrome Sync
• No analytics or tracking

Perfect for users who want a fast, clean new tab experience without unnecessary features.
```

中文版本：
```
fast-access 将您的新标签页转变为美观高效的快速拨号界面。

✨ 功能特点：

• 快速访问 - 将常用网站添加为可视化快捷方式
• 简洁设计 - 极简界面，不会分散注意力
• 自由定制 - 轻松编辑名称、网址和图标
• 搜索集成 - 直接搜索 Google、Bing、百度或 DuckDuckGo
• 时钟显示 - 可选的时间和日期显示
• 同步支持 - 通过 Chrome 同步功能跨设备同步快捷方式
• 轻量快速 - 加载迅速，无冗余功能

🎨 个性化设置：

• 选择您偏好的搜索引擎
• 显示或隐藏时钟和搜索栏
• 自定义每行显示的快捷方式数量

🔒 隐私保护：

• 不收集任何数据
• 所有数据存储在本地或您的 Chrome 同步账户中
• 无分析或追踪

适合希望获得快速、简洁新标签页体验的用户。
```

### 6.2 上传图片资源

1. **商店图标**: 系统会自动从您的扩展包中提取 128x128 图标

2. **截图**: 点击 **"添加截图"**，上传您在第 4 步创建的截图
   - 至少上传 1 张
   - 建议上传 3-5 张展示不同功能

3. **宣传图**（可选）: 上传 440x280 像素的宣传图

### 6.3 隐私权标签页 (Privacy Tab)

#### 单一用途描述

```
This extension replaces the new tab page with a customizable speed dial interface, allowing users to quickly access their favorite websites.
```

#### 权限说明

| 权限 | 用途说明 |
|------|----------|
| storage | 保存用户的快捷方式和设置 |
| topSites | 显示用户最常访问的网站作为建议 |
| favicon | 获取网站图标用于显示 |

#### 数据使用声明

勾选以下选项：
- ✅ 我的扩展不会收集或使用用户数据

### 6.4 分发设置 (Distribution)

#### 可见性

选择以下之一：
- **公开 (Public)**: 所有人都可以在商店找到并安装
- **不公开 (Unlisted)**: 只有知道链接的人才能安装
- **私有 (Private)**: 仅限特定用户（需要设置群组）

对于一般发布，选择 **公开**。

#### 地区

选择 **所有地区** 或根据需要选择特定国家/地区。

---

## 7. 提交审核

### 7.1 最终检查

在提交前，确保：

- [x] 所有必填字段已填写
- [x] 截图已上传
- [x] 隐私设置已完成
- [x] 预览看起来正确

### 7.2 提交审核

1. 点击页面右上角的 **"提交审核"** 或 **"Submit for Review"**

2. 确认提交

3. 您会看到状态变为 **"待审核"** 或 **"Pending Review"**

### 7.3 审核时间

- **首次提交**: 通常需要 1-3 个工作日
- **更新提交**: 通常需要 1-2 个工作日
- **复杂扩展**: 可能需要更长时间

您会收到邮件通知审核结果。

---

## 8. 审核后操作

### 8.1 审核通过 ✅

恭喜！您的扩展已发布。您可以：

1. 在商店搜索您的扩展名称
2. 复制商店链接分享给他人
3. 等待 Chrome 同步功能生效（可能需要几小时）

### 8.2 审核被拒 ❌

如果被拒，您会收到说明原因的邮件。常见原因和解决方法：

| 拒绝原因 | 解决方法 |
|----------|----------|
| 权限过多 | 移除不必要的权限 |
| 描述不准确 | 修改描述使其更准确 |
| 缺少隐私政策 | 添加隐私政策页面 |
| 功能问题 | 修复 bug 后重新提交 |

### 8.3 发布更新

要发布新版本：

1. 修改 `manifest.json` 中的 `version` 字段（如 `1.0.1`）
2. 重新运行 `npm run build`
3. 在开发者控制台上传新的 ZIP 文件
4. 重新提交审核

---

## 9. 常见问题

### Q1: 上传时提示 "manifest.json not found"

**原因**: ZIP 文件结构不正确，manifest.json 不在根目录。

**解决**: 确保使用 `npm run build` 生成的 ZIP 文件，不要手动压缩。

### Q2: 提示图标格式错误

**原因**: 使用了 SVG 格式的图标。

**解决**: 运行 `npm run generate-icons` 生成 PNG 图标。

### Q3: 审核时间过长

**原因**: 首次提交或扩展较复杂。

**解决**: 耐心等待，或检查邮箱是否有补充信息的要求。

### Q4: 同步功能不工作

**原因**: 扩展刚发布，需要时间生效。

**解决**: 等待 24-48 小时后再测试同步功能。

### Q5: 需要隐私政策吗？

**回答**: 对于本扩展，由于不收集用户数据，隐私政策是**可选的**。但如果您将来添加任何数据收集功能，则必须提供。

### Q6: 可以修改已发布的扩展吗？

**回答**: 可以。在开发者控制台中上传新版本的 ZIP 文件（记得更新版本号），然后重新提交审核。

---

## 📞 获取帮助

- [Chrome 扩展开发者文档](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store 开发者支持](https://support.google.com/chrome_webstore/contact/developer_support)
- [Chrome 扩展开发者论坛](https://groups.google.com/a/chromium.org/g/chromium-extensions)

---

## ✅ 快速命令参考

```bash
# 安装依赖
npm install

# 生成 PNG 图标
npm run generate-icons

# 构建发布包
npm run build

# 清理构建产物
npm run clean
```

---

祝您发布顺利！🎉
