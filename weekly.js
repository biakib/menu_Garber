'use strict';
const person = document.getElementById('person');
const days = document.getElementById('days');
const plan = document.getElementById('plan');
const shortDays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const escapePlan = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readPlanRoute() {
  const params = new URLSearchParams(location.hash.slice(1));
  const profile = weeklyPlans.find(p => p.id === params.get('person')) || weeklyPlans[0];
  const value = params.get('day');
  const index = /^[1-7]$/.test(value || '') ? Number(value)-1 : 0;
  return {profile,index};
}
function planHash(id,index) { return '#person='+id+'&day='+(index+1); }
function renderPlan() {
  const {profile,index} = readPlanRoute();
  const day = profile.days[index];
  person.value = profile.id;
  document.title = day.name+' · '+profile.name+' · Кухня';
  days.innerHTML = profile.days.map((d,i) => `<a href="${planHash(profile.id,i)}" ${i===index?'aria-current="date"':''} aria-label="${escapePlan(d.name)}"><span aria-hidden="true">${shortDays[i]}</span><span class="sr-only">${escapePlan(d.name)}</span></a>`).join('');
  plan.innerHTML = `<div class="sheet-head"><div class="topline"><span class="tag">День ${index+1} из 7</span><div class="card-actions"><button class="print" id="copy-plan" type="button">Копировать ссылку</button><button class="print" id="print-plan" type="button">Печать</button></div></div><h2 class="plan-heading">${escapePlan(day.name)}</h2><p class="plan-person">${escapePlan(profile.name)}</p>${day.time?`<p class="plan-meta">Время: ${escapePlan(day.time)}</p>`:''}${profile.note?`<p class="plan-meta">${escapePlan(profile.note)}</p>`:''}<p class="link-status plan-status" id="plan-status" role="status"></p></div><div class="sheet-body">${day.note?`<div class="notice weekly-note">${escapePlan(day.note)}</div>`:''}<div class="meal-grid ${day.meals.length===1?'single':''}">${day.meals.map(meal=>`<section class="meal"><h3>${escapePlan(meal.name)}</h3><ul>${meal.items.map(item=>`<li>${escapePlan(item)}</li>`).join('')}</ul></section>`).join('')}</div><details class="source weekly-source"><summary>Исходные фотографии (${day.sources.length})</summary><div class="source-content">${day.sources.map((file,i)=>`<figure><figcaption>Фотография ${i+1} · <a href="sources/weekly/${file}" target="_blank" rel="noopener">Открыть оригинал</a></figcaption><img src="sources/weekly/${file}" alt="Недельный рацион, ${escapePlan(day.name)}, исходная фотография ${i+1}" loading="lazy" width="1800" height="2400"></figure>`).join('')}</div></details></div>`;
  document.getElementById('print-plan').addEventListener('click',()=>window.print());
  document.getElementById('copy-plan').addEventListener('click',async()=>{
    const status=document.getElementById('plan-status');
    const url=new URL(location.href);url.hash=planHash(profile.id,index);
    try {await navigator.clipboard.writeText(url.href);if(status.isConnected)status.textContent='Ссылка скопирована';}
    catch {if(status.isConnected)status.textContent='Скопируйте ссылку из адресной строки';history.replaceState(null,'',url.href);}
  });
  plan.querySelector('.weekly-source').addEventListener('toggle',event=>{if(event.currentTarget.open)revealSource(event.currentTarget.querySelector('.source-content'));});
  revealContent(plan);
}
person.addEventListener('change',()=>{const {index}=readPlanRoute();location.hash=planHash(person.value,index);});
window.addEventListener('hashchange',renderPlan);
renderPlan();
