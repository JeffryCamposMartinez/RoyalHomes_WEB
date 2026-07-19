const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && (filePath.endsWith('.jsx') || filePath.endsWith('.js'))) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

const API_BASE = "`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`";
const API_BASE_NO_QUOTES = "(import.meta.env.VITE_API_URL || 'http://localhost:3001')";

walkSync(srcDir, function(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace template literals: `http://localhost:3001${something}`
    // We change `http://localhost:3001 to ${import.meta.env.VITE_API_URL || 'http://localhost:3001'}
    content = content.replace(/`http:\/\/localhost:3001([^`]*)`/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:3001\'}$1`');
    
    // Replace strings: 'http://localhost:3001/api/...'
    // We change to: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/...`
    content = content.replace(/'http:\/\/localhost:3001([^']*)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:3001\'}$1`');
    
    // Replace double quotes just in case: "http://localhost:3001/api/..."
    content = content.replace(/"http:\/\/localhost:3001([^"]*)"/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:3001\'}$1`');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
});
console.log('Replacement complete.');
