const assert = require('assert/strict');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { root, node, context, recipes } = require('./runtime.cjs')();
assert.equal(new Set(recipes.map(r => r.id)).size, recipes.length, 'Duplicate recipe IDs');
for (const r of recipes) {
  assert.ok(r.title && r.category && r.ingredients.length && Array.isArray(r.steps));
  for (const ingredient of r.ingredients) assert.ok((Number.isFinite(ingredient[1]) && ingredient[1] >= 0) || (ingredient[1] === null && ingredient[2]));
  vm.runInContext(`selectRecipe(${JSON.stringify(r.id)})`, context);
  for (const text of [r.title, 'Ингредиенты', 'Приготовление', 'Оригинал']) assert.ok(node('#card').innerHTML.includes(text));
}
function search(query) { node('#search').value = query; node('#search').oninput(); }
search('банан');
assert.ok(node('#card').innerHTML.includes('Смузи «Яблоко'));
assert.equal(node('#search-status').textContent, 'Найдено блюд: '+recipes.filter(r=>r.title.toLowerCase().includes('банан')||r.ingredients.some(i=>i[0].toLowerCase().includes('банан'))).length);
node('#factor').value = '2'; node('#factor').onchange();
assert.ok(node('#card').innerHTML.includes('240 г'));
search('сельдерей'); assert.ok(Number(node('#search-status').textContent.split(': ')[1]) >= 2);
search('ЗЕЛЕНАЯ САЛЬСА'); assert.ok(!node('#card').hidden);
search('несуществующееблюдо'); assert.ok(node('#card').hidden && node('#recipe-picker').disabled);
search(''); assert.ok(!node('#card').hidden);
for (const file of ['styles.css', 'app.js', 'data/recipes.js', 'source.jpeg', 'source-02.jpeg']) assert.ok(fs.existsSync(path.join(root, file)));
console.log(`Checked ${recipes.length} recipes, search and quantity calculation. Browser layout is not tested by this script.`);

assert.equal(recipes.filter(r=>r.source==='book').length,91);
for(const r of recipes.filter(r=>r.source==='book'))assert.ok(fs.existsSync(path.join(root,'sources/book/page-'+String(r.pdfPage).padStart(2,'0')+'.jpg')));
assert.equal(vm.runInContext("ingredientAmount(recipes.find(r=>r.id==='book-009').ingredients[0],2)",context),'400 МЛ');
assert.equal(vm.runInContext("ingredientAmount(recipes.find(r=>r.id==='book-009').ingredients[2],2)",context),'2 СТ.Л');
node('#source-filter').value='book'; search('');assert.equal(node('#search-status').textContent,'Блюд в разделе: 91');
node('#source-filter').value='garber';search('');assert.equal(node('#search-status').textContent,'Блюд в разделе: 75');

assert.equal(recipes.length,166);
for(const r of recipes.filter(r=>r.sourceImages))for(const p of r.sourceImages)assert.ok(fs.existsSync(path.join(root,p.file)),p.file);
for(const [id,count,pages] of [['tomato',7,[2639,2640]],['garber-6',15,[2641,2642]],['garber-10',6,[2642,2643]],['garber-12',3,[2643]],['garber-16',4,[2644,2645]],['garber-49',7,[2701,2702]]]){const r=recipes.find(r=>r.id===id);assert.equal(r.ingredients.length,count);assert.deepEqual(Array.from(r.pages),pages);assert.ok(r.steps.length);}

assert.equal(recipes.filter(r=>r.title==='Салат из бланшированных овощей с томатной сальсой').length,1);
const categories=new Set(fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/data-filter="([^"]+)"/g));
for(const r of recipes)assert.ok([...categories].some(m=>m[1]===r.category),r.category);

// Quantity updates preserve the existing card instead of replacing focused controls.
vm.runInContext("selectRecipe('garber-6')",context);
const minestrone=recipes.find(r=>r.id==='garber-6');
let flashes=0;
const quantityCells=minestrone.ingredients.map(i=>({textContent:vm.runInContext(`ingredientAmount(${JSON.stringify(i)},1)`,context),animate(){flashes++;},getAnimations(){return[];}}));
const cardBefore=node('#card').innerHTML;
node('#card').querySelectorAll=()=>quantityCells;
context.window.matchMedia=()=>({matches:false});
vm.runInContext('updateQuantity(2)',context);
assert.equal(node('#card').innerHTML,cardBefore);
assert.equal(quantityCells[7].textContent,'500 г');
assert.equal(quantityCells[6].textContent,'1 г ±');
assert.equal(quantityCells[10].textContent,'20 (без единицы)');
assert.equal(flashes,13);
context.window.matchMedia=()=>({matches:true});
vm.runInContext('updateQuantity(3)',context);
assert.equal(flashes,13,'Reduced motion must skip animations');
assert.equal(quantityCells[7].textContent,'750 г');

for(const r of recipes){
  for(const [index,target] of Object.entries(r.ingredientLinks||{})){
    assert.ok(r.ingredients[Number(index)],'Invalid linked ingredient');
    for(const id of Array.isArray(target)?target:[target])assert.ok(id!==r.id&&recipes.some(t=>t.id===id),'Invalid preparation link');
  }
}
context.window.location={hash:'#recipe=garber-12'};
context.window.history={pushState(_state,_title,hash){context.window.location.hash=hash;},replaceState(_state,_title,hash){context.window.location.hash=hash;}};
assert.equal(vm.runInContext('recipeFromHash()',context),'garber-12');
context.window.location.hash='#recipe=%broken';assert.equal(vm.runInContext('recipeFromHash()',context),null);
node('#source-filter').value='book';node('#search').value='банан';
vm.runInContext("openLinkedRecipe('garber-11')",context);
assert.equal(node('#source-filter').value,'Все');assert.equal(node('#search').value,'');
assert.equal(context.window.location.hash,'#recipe=garber-11');
assert.ok(node('#card').innerHTML.includes('Голубцы / кролик П/Ф'));
const linkedIngredient=vm.runInContext("ingredientName(recipes.find(r=>r.id==='garber-12'),recipes.find(r=>r.id==='garber-12').ingredients[0],0)",context);
assert.ok(linkedIngredient.includes('href="#recipe=garber-11"'));
