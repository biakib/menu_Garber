const assert = require('assert/strict');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { root, node, context, recipes } = require('./runtime.cjs')();
assert.equal(new Set(recipes.map(r => r.id)).size, recipes.length, 'Duplicate recipe IDs');
for (const r of recipes) {
  assert.ok(r.title && r.category && r.ingredients.length && r.steps.length);
  for (const ingredient of r.ingredients) assert.ok(Number.isFinite(ingredient[1]) && ingredient[1] >= 0);
  vm.runInContext(`selectRecipe(${JSON.stringify(r.id)})`, context);
  for (const text of [r.title, 'Ингредиенты', 'Приготовление', 'Оригинал']) assert.ok(node('#card').innerHTML.includes(text));
}
function search(query) { node('#search').value = query; node('#search').oninput(); }
search('банан');
assert.ok(node('#card').innerHTML.includes('Смузи «Яблоко'));
assert.equal(node('#search-status').textContent, 'Найдено блюд: 1');
node('#factor').value = '2'; node('#factor').onchange();
assert.ok(node('#card').innerHTML.includes('240 г'));
search('сельдерей'); assert.equal(node('#search-status').textContent, 'Найдено блюд: 2');
search('ЗЕЛЕНАЯ САЛЬСА'); assert.ok(!node('#card').hidden);
search('несуществующееблюдо'); assert.ok(node('#card').hidden && node('#recipe-picker').disabled);
search(''); assert.ok(!node('#card').hidden);
for (const file of ['styles.css', 'app.js', 'data/recipes.js', 'source.jpeg', 'source-02.jpeg']) assert.ok(fs.existsSync(path.join(root, file)));
console.log(`Checked ${recipes.length} recipes, search and quantity calculation. Browser layout is not tested by this script.`);
