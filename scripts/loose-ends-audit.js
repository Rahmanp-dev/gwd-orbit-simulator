const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const patterns = [
  { name: 'TODO/FIXME', regex: /(TODO|FIXME)/i },
  { name: 'Hardcoded localhost API', regex: /http:\/\/localhost:3000\/api/i },
  { name: 'Console Log (API/Components)', regex: /console\.log\(/ },
  { name: 'Missing Key Prop Pattern', regex: /\.map\(\s*\([^)]*\)\s*=>\s*(<[A-Za-z]+(?![^>]*key=))/ }
];

let issues = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        for (const p of patterns) {
          if (p.regex.test(line)) {
            // Ignore console.log in seed-data.js, index-warmer.ts, or generic catch blocks if we want
            if (p.name === 'Console Log (API/Components)' && (fullPath.includes('index-warmer.ts') || fullPath.includes('seed-data.ts'))) {
                continue; 
            }
            console.log(`[${p.name}] ${fullPath}:${index + 1}`);
            console.log(`  > ${line.trim()}`);
            issues++;
          }
        }
      });
    }
  }
}

console.log('=== Starting Loose Ends Audit ===');
walk(srcDir);
console.log(`=== Audit Complete. Found ${issues} potential issues. ===`);
