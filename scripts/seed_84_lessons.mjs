import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { foundationLessons } from './content_data/foundation.js';
import { preSatLessons } from './content_data/pre_sat.js';
import { satAdvancedLessons } from './content_data/sat_advanced.js';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = (match[2] || '').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function generateDeterministicUUID(pathwayPrefix, index) {
  const hexIdx = index.toString().padStart(4, '0');
  if (pathwayPrefix === 'foundation') return `31000000-0000-0000-0000-00000000${hexIdx}`;
  if (pathwayPrefix === 'pre_sat') return `32000000-0000-0000-0000-00000000${hexIdx}`;
  if (pathwayPrefix === 'sat_advanced') return `33000000-0000-0000-0000-00000000${hexIdx}`;
  return `30000000-0000-0000-0000-00000000${hexIdx}`;
}

async function seedAllLessons() {
  console.log('=== Starting Bulk Lesson Seeding ===');

  const groups = [
    { name: 'foundation', lessons: foundationLessons },
    { name: 'pre_sat', lessons: preSatLessons },
    { name: 'sat_advanced', lessons: satAdvancedLessons }
  ];

  let totalInserted = 0;

  for (const grp of groups) {
    console.log(`\nInserting ${grp.lessons.length} lessons for ${grp.name}...`);
    for (let i = 0; i < grp.lessons.length; i++) {
      const item = grp.lessons[i];
      const deterministicId = generateDeterministicUUID(grp.name, i + 3); // starts at 3 since 1 and 2 exist
      
      const record = {
        id: deterministicId,
        module_id: item.module_id,
        skill_id: item.skill_id,
        subject: item.subject,
        pathway: item.pathway,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        estimated_duration_minutes: item.estimated_duration_minutes,
        difficulty: item.difficulty,
        order_index: item.order_index,
        is_published: true
      };

      const { data, error } = await supabase.from('lessons').upsert(record, { onConflict: 'slug' }).select('id, title');
      if (error) {
        console.error(`❌ Failed to insert [${item.title}]:`, error.message);
      } else {
        totalInserted++;
        console.log(`  [OK] (${i + 1}/${grp.lessons.length}) ${item.title}`);
      }
    }
  }

  console.log(`\n🎉 Bulk Seeding Completed! Total lessons processed: ${totalInserted}`);

  // Verification count
  const { data: finalLessons } = await supabase.from('lessons').select('pathway');
  const counts = {};
  finalLessons.forEach(l => { counts[l.pathway] = (counts[l.pathway] || 0) + 1; });
  console.log('\nFinal Counts in Database:', counts);
  console.log('Grand Total Lessons in Database:', finalLessons.length);
}

seedAllLessons().catch(console.error);
