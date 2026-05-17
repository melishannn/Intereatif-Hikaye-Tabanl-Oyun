import fs from 'fs';
import path from 'path';

const files = ['common', 'dance', 'interview', 'room', 'stage', 'vocal'];

files.forEach(file => {
    if (file === 'common') return;
    
    const content = `import { GameEvent } from '../../types';
import encodedData from '../encoded_events_${file}.json';

function decodeData(data: any): any {
    if (typeof data === 'string') {
        return decodeURIComponent(atob(data));
    } else if (Array.isArray(data)) {
        return data.map((item: any) => decodeData(item));
    } else if (data !== null && typeof data === 'object') {
        const decodedObj: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === 'id' || key === 'location' || key === 'effects') {
              decodedObj[key] = value;
            } else {
              decodedObj[key] = decodeData(value);
            }
        }
        return decodedObj;
    }
    return data;
}

export const EVENTS: GameEvent[] = decodeData(encodedData);
`;
    fs.writeFileSync(path.join(process.cwd(), `src/data/events/${file}.ts`), content);
    console.log(`Rewrote ${file}.ts`);
});
