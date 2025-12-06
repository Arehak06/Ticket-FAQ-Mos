const fs = require('fs');
const path = require('path');

console.log('📁 Копирование ресурсов в docs-html...');

// Function to copy files recursively
function copyFileSync(source, target) {
  const targetFile = target;
  
  // If target is a directory, a file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

// Function to copy directory recursively
function copyFolderRecursiveSync(source, target) {
  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

// Function to find and copy PDF files
function copyPDFFiles() {
  const docsDir = path.join(__dirname, '..', 'docs');
  const docsHtmlDir = path.join(__dirname, '..', 'docs-html');
  
  if (!fs.existsSync(docsHtmlDir)) {
    console.log('❌ docs-html каталог не найден. Run build:docs first.');
    return;
  }

  // Copy PDF files from docs to docs-html
  function findAndCopyPDFs(dir, targetDir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const targetSubDir = path.join(targetDir, item);
        if (!fs.existsSync(targetSubDir)) {
          fs.mkdirSync(targetSubDir, { recursive: true });
        }
        findAndCopyPDFs(itemPath, targetSubDir);
      } else if (item.toLowerCase().endsWith('.pdf')) {
        const targetPath = path.join(targetDir, item);
        fs.copyFileSync(itemPath, targetPath);
        console.log(`📄 Copied: ${item} -> ${targetPath}`);
      }
    });
  }

  findAndCopyPDFs(docsDir, docsHtmlDir);
}

// Function to create .nojekyll file
function createNoJekyllFile() {
  const nojekyllPath = path.join(__dirname, '..', 'docs-html', '.nojekyll');
  fs.writeFileSync(nojekyllPath, '# This file tells GitHub Pages not to process this directory with Jekyll');
  console.log('✅ Создан .nojekyll файл');
}

// Main execution
try {
  copyPDFFiles();
  createNoJekyllFile();
  console.log('🎉 Активы успешно скопированы!');
} catch (error) {
  console.error('❌ Ошибка при копировании ресурсов:', error.message);
  process.exit(1);
}
