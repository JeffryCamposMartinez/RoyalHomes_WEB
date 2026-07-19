const fs = require('fs');
const path = require('path');
const https = require('https');

const uploadsDir = path.join(__dirname, '..', 'frontend', 'public', 'uploads');

async function fixImages() {
  const files = fs.readdirSync(uploadsDir);
  let count = 0;
  
  for (const file of files) {
    const filepath = path.join(uploadsDir, file);
    const stats = fs.statSync(filepath);
    
    if (stats.size === 0) {
      console.log(`Fixing ${file}...`);
      try {
        const response = await fetch('https://loremflickr.com/800/800/furniture?random=' + Math.random());
        if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filepath, buffer);
        count++;
      } catch (err) {
        console.error(`Failed to download for ${file}:`, err);
      }
    }
  }
  
  console.log(`Fixed ${count} images.`);
}

fixImages();
