import { GameEvent } from '../../types';
import encodedData from '../encoded_events_room.json';

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
