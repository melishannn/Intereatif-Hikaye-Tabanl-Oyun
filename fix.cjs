const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf8');

let lines = data.split('\n');
let currentCategory = 'unknown';

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const BOOK_QUOTES')) currentCategory = 'quotes';
  else if (lines[i].includes('room: [')) currentCategory = 'room';
  else if (lines[i].includes('common: [')) currentCategory = 'common';
  else if (lines[i].includes('vocal: [')) currentCategory = 'vocal';
  else if (lines[i].includes('dance: [')) currentCategory = 'dance';
  else if (lines[i].includes('interview: [')) currentCategory = 'interview';
  else if (lines[i].includes('stage: [')) currentCategory = 'stage';

  if (currentCategory !== 'vocal' && currentCategory !== 'dance') {
    lines[i] = lines[i].replace(/success: -[0-9]+/g, 'success: -2');
  } else {
    // For vocal and dance, ensure drops are noticeable but maybe not extreme if not already
  }
}

fs.writeFileSync('src/data.ts', lines.join('\n'));
console.log('Fixed success stats');
