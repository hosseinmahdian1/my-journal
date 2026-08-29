const fs = require('fs');
let c = fs.readFileSync('src/app/analytics/page.tsx', 'utf8');

if (!c.includes("import { marked }")) {
  c = 'import { marked } from "marked";\n' + c;
}

const startMarker = '  const renderMarkdown = (md: string) => {';
const endMarker = '  useEffect(() => {';

const idx1 = c.indexOf(startMarker);
const idx2 = c.indexOf(endMarker, idx1);

if (idx1 > -1 && idx2 > -1) {
  const newFunc = `  const renderMarkdown = (md: string) => {
    const rawHtml = marked.parse(md, { async: false }) as string;
    return (
      <div className="ai-markdown-container">
        <style dangerouslySetInnerHTML={{__html: \`
          .ai-markdown-container {
            font-family: 'Vazirmatn', system-ui, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 2;
          }
          .ai-markdown-container * {
            unicode-bidi: isolate;
          }
          .ai-markdown-container p { margin-bottom: 1rem; color: inherit; }
          .ai-markdown-container h1, .ai-markdown-container h2, .ai-markdown-container h3 {
            color: #0284c7; font-weight: 900; margin-top: 2rem; margin-bottom: 1rem;
          }
          :is(.dark .ai-markdown-container h1, .dark .ai-markdown-container h2, .dark .ai-markdown-container h3) {
            color: #38bdf8;
          }
          .ai-markdown-container strong, .ai-markdown-container b {
            color: #d97706; font-weight: 900;
          }
          :is(.dark .ai-markdown-container strong, .dark .ai-markdown-container b) {
            color: #fbbf24;
          }
          .ai-markdown-container ul { list-style-type: disc; padding-right: 1.5rem; margin-bottom: 1rem; }
          .ai-markdown-container ol { list-style-type: decimal; padding-right: 1.5rem; margin-bottom: 1rem; }
          .ai-markdown-container li { margin-bottom: 0.5rem; }
          .ai-markdown-container code, .ai-markdown-container .dir-ltr {
            direction: ltr !important; text-align: left !important;
            font-family: monospace; display: inline-block;
            background: rgba(125,125,125,0.1); padding: 0.1rem 0.3rem; border-radius: 0.25rem;
          }
        \`}} />
        <div dangerouslySetInnerHTML={{ __html: rawHtml }} className="text-slate-800 dark:text-slate-200" />
      </div>
    );
  };
`;
  c = c.substring(0, idx1) + newFunc + c.substring(idx2);
  fs.writeFileSync('src/app/analytics/page.tsx', c);
  console.log("Successfully replaced renderMarkdown");
} else {
  console.log("Could not find bounds");
}
