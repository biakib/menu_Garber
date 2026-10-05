const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');const path=require('node:path');
const root=path.join(__dirname,'..');const plans=vm.runInNewContext(fs.readFileSync(path.join(root,'data/weekly.js'),'utf8')+';weeklyPlans');
assert.equal(plans.length,3);let meals=0;
for(const profile of plans){assert.equal(profile.days.length,7);for(const day of profile.days){assert.equal(day.meals.length,profile.id==='markovich'?1:4);meals+=day.meals.length;for(const meal of day.meals){assert(meal.items.length>0);assert(meal.items.every(i=>typeof i==='string'&&i.trim()));}for(const file of day.sources)assert(fs.existsSync(path.join(root,'sources/weekly',file)));}}
assert.equal(meals,63);const am=plans.find(p=>p.id==='markovich');assert.equal(am.name,'Алексей Маркович');assert.equal(am.days[3].sources.length,2);assert(am.days[3].meals[0].items.some(i=>i.includes('Сырники')));assert(am.days[6].note.includes('обрезан'));assert(plans[1].days[6].note.includes('наклейкой'));assert(!am.days[6].meals[0].items.some(i=>i.includes('Чай')));
console.log('Checked 3 weekly profiles, 21 days, 63 meal blocks and 9 source photos.');
