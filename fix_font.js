const fs = require('fs');
let c = fs.readFileSync('src/app/analytics/page.tsx', 'utf8');
c = c.replace('.ai-markdown-container {\n            font-family:', "@import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');\n          .ai-markdown-container {\n            font-family:");
fs.writeFileSync('src/app/analytics/page.tsx', c);
console.log('Fixed font');
