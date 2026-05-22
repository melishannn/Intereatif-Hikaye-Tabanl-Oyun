import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Or wherever your firebase init file is located
import { GameEvent, BookQuote } from '../types';

/**
 * Fetches all game data statically from Firestore.
 */
export async function fetchGameData() {
  const [
    constantsSnap,
    lynchReasonsSnap,
    quotesSnap,
    eventsSnap
  ] = await Promise.all([
    getDoc(doc(db, 'game_data', 'constants')),
    getDoc(doc(db, 'game_data', 'lynch_reasons')),
    getDoc(doc(db, 'game_data', 'quotes')),
    getDocs(collection(db, 'events'))
  ]);

  const constants = constantsSnap.exists() ? constantsSnap.data() : null;
  const lynchReasons = lynchReasonsSnap.exists() ? lynchReasonsSnap.data().list : [];
  const quotes = quotesSnap.exists() ? quotesSnap.data().list : [];
  
  const events: GameEvent[] = [];
  eventsSnap.forEach(docSnap => events.push(docSnap.data() as GameEvent));

  return {
    constants,
    lynchReasons,
    quotes,
    events
  };
}
