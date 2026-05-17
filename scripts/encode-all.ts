import fs from 'fs';
import path from 'path';

function encodeData(data: any): any {
    if (typeof data === 'string') {
        return btoa(encodeURIComponent(data));
    } else if (Array.isArray(data)) {
        return data.map(item => encodeData(item));
    } else if (data !== null && typeof data === 'object') {
        const encodedObj: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === 'id' || key === 'location') {
              encodedObj[key] = value;
            } else {
              encodedObj[key] = encodeData(value);
            }
        }
        return encodedObj;
    }
    return data;
}

import { BOOK_QUOTES } from '../src/data/quotes';
const encodedQuotes = encodeData(BOOK_QUOTES);
fs.writeFileSync(path.join(process.cwd(), 'src/data/encoded_quotes.json'), JSON.stringify(encodedQuotes, null, 2));

import { LYNCH_REASONS } from '../src/data/lynchReasons';
const encodedLynchReasons = encodeData(LYNCH_REASONS);
fs.writeFileSync(path.join(process.cwd(), 'src/data/encoded_lynch_reasons.json'), JSON.stringify(encodedLynchReasons, null, 2));

console.log('Encoded quotes and lynch reasons successfully.');
