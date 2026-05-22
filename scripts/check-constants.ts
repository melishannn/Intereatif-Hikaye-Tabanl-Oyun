import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  try {
    const r = await getDoc(doc(db, 'game_data', 'constants'));
    console.log("Exists?", r.exists());
    process.exit(0);
  } catch(e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

check();
