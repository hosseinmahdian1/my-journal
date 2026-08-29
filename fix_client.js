const fs = require('fs');
let c = fs.readFileSync('src/app/analytics/page.tsx', 'utf8');
c = c.replace('import { marked } from "marked";\n"use client";', '"use client";\nimport { marked } from "marked";');
fs.writeFileSync('src/app/analytics/page.tsx', c);
console.log('Fixed use client');
