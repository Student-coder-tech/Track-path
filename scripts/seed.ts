import 'dotenv/config';
import { StorageService } from '../server/storage.js';

try {
  await StorageService.connect();
  const count = await StorageService.seedIfEmpty();
  console.log(count ? `Seeded ${count} sample applications into MongoDB.` : 'MongoDB already contains applications; nothing was changed.');
} finally {
  await StorageService.close();
}
