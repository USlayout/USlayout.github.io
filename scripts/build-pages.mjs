import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const siteDir = path.resolve(process.argv[2] || '_site');
const templatesDir = path.join(siteDir, 'templates');

async function listDatedPages(folder, pattern) {
  const files = await readdir(folder, { withFileTypes: true });
  const pages = [];

  for (const entry of files) {
    if (!entry.isFile() || !pattern.test(entry.name)) continue;
    const date = entry.name.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (!date) continue;

    const html = await readFile(path.join(folder, entry.name), 'utf8');
    const subtitle = html.match(/<p\b[^>]*class=["'][^"']*article-subtitle[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';
    const title = subtitle.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    pages.push({ file: entry.name, date, title });
  }

  return pages.sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));
}

const rpr = await listDatedPages(path.join(templatesDir, 'rpr'), /^rpr_\d{4}-\d{2}-\d{2}\.html$/);
const ep = await listDatedPages(path.join(templatesDir, 'ep'), /^ep_\d{4}-\d{2}-\d{2}.*\.html$/);
await writeFile(path.join(templatesDir, 'reports.json'), JSON.stringify({ rpr, ep }, null, 2) + '\n', 'utf8');

for (const folderName of ['rpr', 'ep']) {
  const folder = path.join(templatesDir, folderName);
  const files = await readdir(folder, { withFileTypes: true });
  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const fullPath = path.join(folder, entry.name);
    let html = await readFile(fullPath, 'utf8');
    html = html.replace(/\s*<meta\s+name=["']robots["']\s+content=["']noindex,\s*nofollow["']\s*\/?>/i, '');
    html = html.replace(/\s*<!--\s*このファイルは公開用ではありません。[\s\S]*?-->/, '');
    html = html.replace(/<strong>卒業研究<\/strong>/g, '<strong>研究ノート</strong>');
    html = html.replace(/\s*<script\s+src=["']\.\.\/\.\.\/static\/js\/archive\.js["'][^>]*><\/script>\s*/gi, '\n');
    html = html.replace(/<\/head>/i, '  <script src="../../static/js/archive.js" defer></script>\n</head>');
    await writeFile(fullPath, html, 'utf8');
  }
}
