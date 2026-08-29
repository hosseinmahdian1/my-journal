const fs = require('fs');
let c = fs.readFileSync('src/app/analytics/page.tsx', 'utf8');
const start = '        {/* Clean Black Text Document Content */}';
const end = '      </div>\n    </div>\n  );\n}';
const idx1 = c.indexOf(start);
const idx2 = c.indexOf(end, idx1);

if (idx1 > 0 && idx2 > 0) {
  const newStr = start + `
        <div className="space-y-12 text-sm leading-8 text-zinc-200 min-h-[400px]">
          {aiReport ? (
            renderMarkdown(aiReport)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Brain className="h-16 w-16 mb-4 text-sky-400" />
              <p className="text-center max-w-md">
                برای دریافت تحلیل فوق‌حرفه‌ای و بی‌رحمانه از عملکرد خود در این حساب روی دکمه «به‌روزرسانی تحلیل» کلیک کنید.
              </p>
            </div>
          )}
        </div>
`;
  c = c.substring(0, idx1) + newStr + end;
  fs.writeFileSync('src/app/analytics/page.tsx', c);
  console.log('Replaced successfully');
} else {
  console.log('Could not find indices', idx1, idx2);
}
