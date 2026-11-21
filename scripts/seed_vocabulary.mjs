import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const rawData = fs.readFileSync('src/data/vocabulary_500.json', 'utf-8');
const words = JSON.parse(rawData);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function seed() {
  console.log(`Starting bulk vocabulary seeding of ${words.length} curated words...`);
  const chunkSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    const { data, error } = await supabase.from('vocabulary_words').upsert(chunk, { onConflict: 'word' });
    if (error) {
      console.warn(`Chunk ${i / chunkSize + 1} notice:`, error.message);
      errors++;
    } else {
      inserted += chunk.length;
      console.log(`Uploaded batch ${i / chunkSize + 1}: ${inserted}/${words.length} words.`);
    }
  }

  console.log(`\nSeeding completed: ${inserted} words upserted, ${errors} chunk errors.`);
}

seed();

