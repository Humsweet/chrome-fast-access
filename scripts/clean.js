/**
 * 清理脚本
 * 删除构建产物
 * 
 * 使用方法: npm run clean
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('\n🧹 清理构建产物...\n');

// 删除 dist 目录
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log('  ✓ 已删除 dist/');
}

// 删除生成的 PNG 图标（可选，保留 SVG）
const iconsDir = path.join(rootDir, 'icons');
const pngIcons = ['icon16.png', 'icon48.png', 'icon128.png'];

for (const icon of pngIcons) {
  const iconPath = path.join(iconsDir, icon);
  if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath);
    console.log(`  ✓ 已删除 icons/${icon}`);
  }
}

console.log('\n✅ 清理完成！\n');
