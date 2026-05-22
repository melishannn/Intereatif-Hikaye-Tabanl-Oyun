const fs = require('fs');
const path = require('path');

const p = path.join(process.cwd(), 'src/data/encoded_constants.json');
const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
const decode = (s) => decodeURIComponent(atob(s));

const obj = {
  positive: data.positive.map(decode),
  negative: data.negative.map(decode),
  lynch_scrolling: data.lynch_scrolling.map(decode)
};

fs.writeFileSync(p, JSON.stringify(obj, null, 2));
console.log('Decoded successfully!');
