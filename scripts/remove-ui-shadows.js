const fs = require('fs');
const path = require('path');

function removeShadows(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') removeShadows(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // Remove shadow properties
      content = content.replace(/shadowColor:\s*['"][^'"]+['"],?\s*/g, '');
      content = content.replace(/shadowOffset:\s*\{\s*width:\s*-?\d+,\s*height:\s*-?\d+\s*\},?\s*/g, '');
      content = content.replace(/shadowOpacity:\s*[0-9.]+,?\s*/g, '');
      content = content.replace(/shadowRadius:\s*[0-9.]+,?\s*/g, '');
      content = content.replace(/elevation:\s*\d+,?\s*/g, '');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated shadows in ${fullPath}`);
      }
    }
  }
}

function removeEmojis() {
  const files = [
    'd:/WrenlyAI/app/(student)/classroom/[id].tsx',
    'd:/WrenlyAI/app/(student)/dashboard.tsx',
    'd:/WrenlyAI/app/(student)/join.tsx',
    'd:/WrenlyAI/app/(teacher)/dashboard.tsx',
    'd:/WrenlyAI/components/ClassroomCard.tsx',
  ];
  
  for (const fullPath of files) {
    if (!fs.existsSync(fullPath)) continue;
    let content = fs.readFileSync(fullPath, 'utf8');
    const original = content;
    
    // Manual emoji replacements based on previous find
    content = content.replace(/👤 /g, '');
    content = content.replace(/ \{greeting\} 👋/g, ' {greeting}');
    content = content.replace(/You're in! 🎉/g, "You're in!");
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content);
      console.log(`Removed emojis in ${fullPath}`);
    }
  }
}

removeShadows('d:/WrenlyAI/app');
removeShadows('d:/WrenlyAI/components');
removeEmojis();
