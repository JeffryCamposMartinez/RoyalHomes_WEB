const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.jsx') || filepath.endsWith('.js'))) {
      callback(filepath);
    }
  });
}

// Regex to find: `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${variable}`
// and replace it with: variable (if it's inside an img tag, we want src={variable})
// Actually, let's just use a simpler approach. We know the exact string that is causing trouble.

const badPattern1 = "`\\$\\{import.meta.env.VITE_API_URL || \\`\\$\\{import.meta.env.VITE_API_URL || 'http://localhost:3001'\\}\\`\\}\\}\\$\\{";
const badPattern2 = "`\\$\\{import.meta.env.VITE_API_URL || 'http://localhost:3001'\\}\\$\\{";

walkSync(path.join(__dirname, '../frontend/src'), (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let newContent = content;

  // Replace src={`${import...}${c.imagen_url}`} with src={c.imagen_url}
  // The full string looks like: src={`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${c.imagen_url}`}
  
  // Use a regex that matches src={`...${variable}`}
  const regex1 = /src=\{\`\$\{import\.meta\.env\.VITE_API_URL \|\| \`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001'\}\`\}\}\$\{([^\}]+)\}\`\}/g;
  const regex2 = /src=\{\`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001'\}\}\$\{([^\}]+)\}\`\}/g;
  
  newContent = newContent.replace(regex1, 'src={$1}');
  newContent = newContent.replace(regex2, 'src={$1}');

  if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Fixed src tags in:', filepath);
  }
});
