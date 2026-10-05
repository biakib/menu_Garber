const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
let reduced=false;const calls=[];let cancelled=0;const element=()=>({animate(frames,options){calls.push({frames,options});},getAnimations(){return[{cancel(){cancelled++;}}];}});
const rows=Array.from({length:40},element);const card={...element(),querySelectorAll(){return rows;}};
const context={window:{matchMedia(){return {matches:reduced};}},document:{getAnimations(){return[{cancel(){cancelled++;}}];}}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../motion.js'),'utf8'),context);context.card=card;
vm.runInContext('revealContent(card)',context);assert.equal(calls.length,41);assert.equal(calls[0].options.duration,520);assert.equal(calls.at(-1).options.delay,360);assert(calls.slice(1).every(c=>c.options.fill==='backwards'));assert(calls.every(c=>c.frames.at(-1).opacity===1));
reduced=true;vm.runInContext('revealContent(card);revealSource(card)',context);assert.equal(calls.length,41,'Reduced motion must skip all entrances');
reduced=false;vm.runInContext('revealSource(card)',context);assert.equal(calls.at(-1).options.duration,480);vm.runInContext('stopContentMotion()',context);assert(cancelled>0);console.log('Checked stagger timing cap, readable end state, reduced motion and cancellation.');
