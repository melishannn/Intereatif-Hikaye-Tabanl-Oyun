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
            if (key === 'id' || key === 'location' || key === 'effects') {
              encodedObj[key] = value;
            } else {
              encodedObj[key] = encodeData(value);
            }
        }
        return encodedObj;
    }
    return data;
}

const files = ['common', 'dance', 'interview', 'room', 'stage', 'vocal'];
async function run() {
    for (const file of files) {
        const { EVENTS } = await import(`../src/data/events/${file}.ts`);
        const encoded = encodeData(EVENTS);
        fs.writeFileSync(path.join(process.cwd(), `src/data/encoded_events_${file}.json`), JSON.stringify(encoded, null, 2));
        console.log(`Encoded ${file}`);
    }
}
run();
