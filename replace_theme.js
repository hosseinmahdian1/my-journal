const fs = require('fs');
let c = fs.readFileSync('src/app/analytics/page.tsx', 'utf8');

c = c.replace(
  'className="rounded-3xl border border-zinc-800 bg-black p-6 sm:p-10 font-persian text-right text-slate-100 shadow-2xl space-y-10 dir-rtl"',
  'className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-6 sm:p-10 font-persian text-right text-slate-800 dark:text-slate-100 shadow-xl space-y-10 dir-rtl backdrop-blur-md"'
);

c = c.replace(/border-zinc-800/g, 'border-slate-200 dark:border-white/10');
c = c.replace(/text-zinc-400/g, 'text-slate-500 dark:text-slate-400');
c = c.replace(/text-zinc-200/g, 'text-slate-800 dark:text-zinc-200');
c = c.replace(/text-zinc-300/g, 'text-slate-700 dark:text-zinc-300');

fs.writeFileSync('src/app/analytics/page.tsx', c);
console.log('Fixed theme colors');
