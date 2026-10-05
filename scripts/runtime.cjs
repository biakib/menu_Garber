const fs = require('fs');
const vm = require('vm');
const path = require('path');
module.exports = function () {
  const root = path.resolve(__dirname, '..');
  const nodes = {};
  const node = selector => nodes[selector] ??= {
    innerHTML: '', value: '', hidden: false, disabled: false, textContent: '',
    classList: { toggle() {} }, setAttribute() {}, dataset: {}
  };
  const context = { document: { querySelector: node, querySelectorAll: () => [] }, Intl, window: { print() {} } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'data/recipes.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'motion.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
  return { root, nodes, node, context, recipes: vm.runInContext('recipes', context) };
};
