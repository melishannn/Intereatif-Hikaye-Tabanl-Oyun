import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function seed() {
  try {
    const eventsPath = path.resolve(process.cwd(), 'src/data/encoded_events_interview.json');
    const eventsStr = fs.readFileSync(eventsPath, 'utf8');
    const events = JSON.parse(eventsStr);

    console.log(`Found ${events.length} interview events to upload.`);

    for (const evt of events) {
      await setDoc(doc(db, 'events', evt.id), evt);
      console.log(`Uploaded event ${evt.id}`);
    }

    console.log("Finished uploading interview events to Firestore.");
    process.exit(0);
  } catch(e) {
    console.error("Error seeding:", e);
    process.exit(1);
  }
}

seed();
