const fs = require('fs');
const path = require('path');
const regex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F773}\u{1F780}-\u{1F7D8}\u{1F7E0}-\u{1F7EB}\u{1F800}-\u{1F80B}\u{1F810}-\u{1F847}\u{1F850}-\u{1F859}\u{1F860}-\u{1F887}\u{1F890}-\u{1F8AD}\u{1F8B0}-\u{1F8B1}\u{1F900}-\u{1F978}\u{1F97A}-\u{1F9CB}\u{1F9CD}-\u{1F9FF}\u{1FA00}-\u{1FA6D}\u{1FA70}-\u{1FA74}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA86}\u{1FA90}-\u{1FAA8}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}]/gu;

function findEmojis(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') findEmojis(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (regex.test(content)) {
        console.log(fullPath);
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (regex.test(line)) console.log(`  Line ${i+1}: ${line.trim()}`);
        });
      }
    }
  }
}
findEmojis('d:/WrenlyAI/app');
findEmojis('d:/WrenlyAI/components');
