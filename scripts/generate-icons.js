/**
 * 图标生成脚本
 * 用于将 SVG 图标转换为 PNG 格式
 * 
 * 使用方法:
 * 1. npm install sharp
 * 2. node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '..', 'icons');

// SVG 模板函数
function generateSVG(size) {
  const rx = Math.round(size * 0.156); // 圆角比例
  const innerSize = Math.round(size * 0.328); // 内部方块大小
  const gap = Math.round(size * 0.047); // 间距
  const offset = Math.round(size * 0.125); // 偏移量
  const innerRx = Math.max(1, Math.round(size * 0.0625)); // 内部圆角
  
  const pos1 = offset;
  const pos2 = offset + innerSize + gap;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#grad)"/>
  <rect x="${pos1}" y="${pos1}" width="${innerSize}" height="${innerSize}" rx="${innerRx}" fill="white" opacity="0.9"/>
  <rect x="${pos2}" y="${pos1}" width="${innerSize}" height="${innerSize}" rx="${innerRx}" fill="white" opacity="0.7"/>
  <rect x="${pos1}" y="${pos2}" width="${innerSize}" height="${innerSize}" rx="${innerRx}" fill="white" opacity="0.7"/>
  <rect x="${pos2}" y="${pos2}" width="${innerSize}" height="${innerSize}" rx="${innerRx}" fill="white" opacity="0.5"/>
</svg>`;
}

async function generateIcons() {
  console.log('开始生成图标...\n');

  for (const size of sizes) {
    const svgContent = generateSVG(size);
    const outputPath = path.join(iconsDir, `icon${size}.png`);
    
    try {
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(outputPath);
      
      console.log(`✓ 已生成: icon${size}.png`);
    } catch (error) {
      console.error(`✗ 生成 icon${size}.png 失败:`, error.message);
    }
  }

  console.log('\n图标生成完成！');
}

// 检查 icons 目录是否存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

generateIcons().catch(console.error);
