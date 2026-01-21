/**
 * 构建脚本
 * 生成用于上传到 Chrome Web Store 的 ZIP 文件
 * 
 * 使用方法: npm run build
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// 需要包含在发布包中的文件和文件夹
const includeFiles = [
  'manifest.json',
  'newtab.html',
  'newtab.css',
  'newtab.js',
  'options.html',
  'options.css',
  'options.js'
];

const includeFolders = [
  'icons',
  '_locales'
];

// 读取版本号
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const version = manifest.version;

async function build() {
  console.log(`\n🚀 开始构建 My Speed Dial v${version}...\n`);

  // 确保 dist 目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 检查 PNG 图标是否存在
  const pngIconsExist = ['icon16.png', 'icon48.png', 'icon128.png'].every(
    icon => fs.existsSync(path.join(rootDir, 'icons', icon))
  );

  if (!pngIconsExist) {
    console.log('⚠️  PNG 图标不存在，正在生成...\n');
    try {
      require('./generate-icons');
      // 等待图标生成完成
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('❌ 图标生成失败，请先运行: npm run generate-icons');
      process.exit(1);
    }
  }

  const zipFileName = `my-speed-dial-v${version}.zip`;
  const zipPath = path.join(distDir, zipFileName);

  // 如果已存在同名文件，删除它
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // 创建 ZIP 文件
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const sizeKB = (archive.pointer() / 1024).toFixed(2);
    console.log(`\n✅ 构建完成！`);
    console.log(`📦 输出文件: dist/${zipFileName}`);
    console.log(`📏 文件大小: ${sizeKB} KB\n`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // 添加文件
  for (const file of includeFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
      console.log(`  ✓ ${file}`);
    } else {
      console.warn(`  ⚠ 文件不存在: ${file}`);
    }
  }

  // 添加文件夹
  for (const folder of includeFolders) {
    const folderPath = path.join(rootDir, folder);
    if (fs.existsSync(folderPath)) {
      archive.directory(folderPath, folder);
      console.log(`  ✓ ${folder}/`);
    } else {
      console.warn(`  ⚠ 文件夹不存在: ${folder}`);
    }
  }

  await archive.finalize();
}

build().catch(console.error);
