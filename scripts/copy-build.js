const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(file => {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy frontend build to public
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  copyRecursive(frontendDist, publicDir);
  console.log('✅ Frontend build copied to public directory');
} else {
  console.error('❌ Frontend dist directory not found');
  process.exit(1);
}