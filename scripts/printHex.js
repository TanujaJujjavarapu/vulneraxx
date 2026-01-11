const fs = require('fs');
const buf = fs.readFileSync('c:/Reactprojects/vulneerax/src/pages/Reports.tsx');
console.log(buf.slice(0,200).toString('hex'));
console.log('\n---\n');
console.log(buf.slice(0,400).toString());
