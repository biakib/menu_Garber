const fs = require('fs');
const path = require('path');
const { root, node } = require('./runtime.cjs')();
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
for (const [selector, pattern, tag] of [
  ['#list', /(<nav id="list"[^>]*>)[\s\S]*?<\/nav>/, 'nav'],
  ['#card', /(<article class="sheet" id="card"[^>]*>)[\s\S]*?<\/article>/, 'article'],
  ['#recipe-picker', /(<select id="recipe-picker">)[\s\S]*?<\/select>/, 'select']
]) html = html.replace(pattern, (_, opening) => opening + node(selector).innerHTML + `</${tag}>`);
fs.writeFileSync(file, html);
console.log('Updated initial HTML from recipe data.');
