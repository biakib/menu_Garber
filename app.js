function ingredientAmount(i,multiplier){if(i.length>=4){if(multiplier===1||i[1]===null)return i[2];return fmt(i[1]*multiplier)+' '+i[3];}return fmt(i[1]*multiplier)+' г'+(i[2]||'');}
let current='vegetable',filter='Все',factor=1,renderedRecipe=null,renderedFactor=null;const $=s=>document.querySelector(s);const fmt=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n);const normalize=s=>s.toLocaleLowerCase('ru').replaceAll('ё','е').trim();
function renderList(){const words=normalize($('#search').value).split(/\s+/).filter(Boolean);const source=$('#source-filter').value||'Все';const items=recipes.filter(r=>(source==='Все'||(r.source||'garber')===source)&&(filter==='Все'||r.category===filter)&&words.every(word=>normalize(r.title+' '+r.ingredients.map(i=>i[0]).join(' ')).includes(word)));if(items.length&&!items.some(r=>r.id===current)){current=items[0].id;factor=1;}$('#card').hidden=items.length===0;$('#search-status').textContent=words.length?'Найдено блюд: '+items.length:'Блюд в разделе: '+items.length;const picker=$('#recipe-picker');picker.innerHTML=items.map(r=>`<option value="${r.id}" ${r.id===current?'selected':''}>${r.title}</option>`).join('');picker.disabled=items.length===0;$('#picker-empty').hidden=items.length>0;$('#list').innerHTML=items.map(r=>`<button class="dish ${r.id===current?'selected':''}" data-id="${r.id}" aria-current="${r.id===current?'true':'false'}"><span class="number">${recipes.indexOf(r)+1} / ${r.category}</span><strong>${r.title}</strong><small>${r.note?'Проверить по оригиналу':r.source==='book'?'Книга · стр. '+r.pages[0]:'Garber'}</small></button>`).join('')||'<p class="empty">Блюд не найдено. Попробуйте другое название или ингредиент.</p>';document.querySelectorAll('.dish').forEach(b=>b.onclick=()=>selectRecipe(b.dataset.id));if(items.length)renderCard();}

function selectRecipe(id){current=id;factor=1;renderList();}function renderCard(){const r=recipes.find(r=>r.id===current);if(renderedRecipe===current&&renderedFactor===factor)return;const changed=renderedRecipe!==null&&renderedRecipe!==current;renderedRecipe=current;renderedFactor=factor;$('#card').innerHTML=`<div class="sheet-head"><div class="topline"><span class="tag">${r.category} · ${recipes.indexOf(r)+1}</span><button class="print" id="print">Печать</button></div><h1>${r.title}</h1><p class="sub">${r.subtitle}</p><div class="meta"><div>Базовое количество<b>${r.batch}</b></div><div>Выход по оригиналу<b>${r.output}</b></div></div></div><div class="sheet-body">${r.note?`<div class="notice"><b>Проверить по оригиналу</b>${r.note}</div>`:''}<div class="section-head"><h2>Ингредиенты</h2>${true?`<label class="scale">Количество <select id="factor" aria-label="Множитель рецептуры">${[.5,1,2,3,4,5,10].map(n=>`<option value="${n}" ${factor===n?'selected':''}>× ${fmt(n)}</option>`).join('')}</select></label>`:''}</div><table><thead><tr><th scope="col">Наименование</th><th scope="col" id="quantity-heading">${factor===1?'По рецептуре':'× '+fmt(factor)}</th></tr></thead><tbody>${r.ingredients.map(i=>`<tr><td>${i[0]}</td><td class="ingredient-quantity">${ingredientAmount(i,factor)}</td></tr>`).join('')}</tbody></table><p class="hint" id="quantity-hint">${factor===1?'Количество и единицы по источнику. П/Ф — полуфабрикат.':'Числовые количества умножены на '+fmt(factor)+'. Количества без числа, диапазоны и «по вкусу» сохранены; их уточняйте отдельно. Выход указан для базовой рецептуры.'}</p><h2>Приготовление</h2>${r.steps.length?`<ol class="steps">${r.steps.map(s=>`<li><div>${s}</div></li>`).join('')}</ol>`:'<p class="hint">Способ приготовления в предоставленном источнике не указан.</p>'}<details class="source"><summary>Оригинал · ${r.sourceImages?'фотографии':r.pages.length>1?'страницы ':'страница '}${r.sourceImages?'':r.pages.map(p=>String(p)).join(', ')}</summary><div class="source-content">${r.sourceImages?r.sourceImages.map((p,index)=>`<p>Фотография ${index+1} · ${p.label}</p><a href="${p.file}" target="_blank" rel="noopener">Открыть исходную фотографию</a><img src="${p.file}" alt="${p.label}: ${r.title}" loading="lazy">`).join(''):r.source==='book'?`<p>Та самая книга рецептов · ROMZUU · страница ${r.pages[0]}</p><a href="sources/book/page-${String(r.pdfPage).padStart(2,'0')}.jpg" target="_blank" rel="noopener">Открыть исходную страницу</a><img src="sources/book/page-${String(r.pdfPage).padStart(2,'0')}.jpg" alt="Страница ${r.pages[0]} книги: ${r.title}" loading="lazy">`:r.pages.map(p=>`<img src="${p===1?'source.jpeg':'source-02.jpeg'}" alt="Фотография исходной страницы ${p}" loading="lazy">`).join('')}</div></details></div>`;$('#print').onclick=()=>window.print();const input=$('#factor');if(input)input.onchange=()=>{updateQuantity(Number(input.value));};bindSourceDisclosure();if(changed)animateElement($('#card'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],200);}

// Motion is optional; state changes never depend on an animation finishing.
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??true;}
function animateElement(element,frames,duration){
  if(!element?.animate||reducedMotion())return;
  element.getAnimations?.().forEach(animation=>animation.cancel());
  return element.animate(frames,{duration,easing:'cubic-bezier(.2,.7,.2,1)'});
}
function updateQuantity(next){
  const r=recipes.find(r=>r.id===current),previous=factor;
  factor=next;
  const cells=$('#card').querySelectorAll?.('.ingredient-quantity');
  if(!cells){renderCard();return;}
  cells.forEach((cell,index)=>{
    const text=ingredientAmount(r.ingredients[index],factor),changed=cell.textContent!==text;
    cell.textContent=text;
    if(changed)animateElement(cell,[{backgroundColor:'#e3f2ca'},{backgroundColor:'transparent'}],650);
  });
  $('#quantity-heading').textContent=factor===1?'По рецептуре':'× '+fmt(factor);
  $('#quantity-hint').textContent=factor===1?'Количество и единицы по источнику. П/Ф — полуфабрикат.':'Числовые количества умножены на '+fmt(factor)+'. Количества без числа, диапазоны и «по вкусу» сохранены; их уточняйте отдельно. Выход указан для базовой рецептуры.';
  if(previous!==factor)renderedFactor=factor;
  $('#factor').value=String(factor);
}
function bindSourceDisclosure(){
  const source=$('#card').querySelector?.('.source');
  if(!source)return;
  const summary=source.querySelector('summary'),content=source.querySelector('.source-content');
  let closing=false,animation;
  summary.onclick=event=>{
    event.preventDefault();
    animation?.cancel();
    if(!source.open||closing){
      closing=false;source.open=true;
      animation=animateElement(content,[{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],180);
    }else{
      closing=true;
      animation=animateElement(content,[{opacity:1},{opacity:0}],120);
      if(animation)animation.finished.then(()=>{if(closing){source.open=false;closing=false;}}).catch(()=>{});
      else{source.open=false;closing=false;}
    }
  };
}

$('#source-filter').onchange=()=>{factor=1;renderList();};
$('#recipe-picker').onchange=e=>{if(recipes.some(r=>r.id===e.target.value))selectRecipe(e.target.value);};$('#search').oninput=renderList;document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(c=>{c.classList.toggle('active',c===b);c.setAttribute('aria-pressed',String(c===b));});renderList();});renderList();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'configure_recipe_quantity',description:'Открыть рецептуру и пересчитать ингредиенты с выбранным множителем.',inputSchema:{type:'object',properties:{recipeId:{type:'string',enum:recipes.map(r=>r.id)},multiplier:{type:'number',enum:[.5,1,2,3,4,5,10]}},required:['recipeId','multiplier'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!recipes.some(r=>r.id===input.recipeId)||![.5,1,2,3,4,5,10].includes(input.multiplier))throw new Error('Неверная рецептура или множитель');$('#source-filter').value='Все';filter='Все';$('#search').value='';document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='Все');b.setAttribute('aria-pressed',String(b.dataset.filter==='Все'));});selectRecipe(input.recipeId);updateQuantity(input.multiplier);const r=recipes.find(r=>r.id===current);return{title:r.title,multiplier:factor,ingredients:r.ingredients.map(i=>({name:i[0],quantity:ingredientAmount(i,factor)})),note:r.note};}})).catch(()=>{});}catch{}}
