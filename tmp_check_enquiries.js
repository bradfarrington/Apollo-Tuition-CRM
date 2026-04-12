import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: enquiries } = await supabase.from('enquiries').select('*');
  const { data: cards } = await supabase.from('pipeline_cards').select('*, pipeline_stages(*)');
  console.log("Enquiries:", enquiries?.map(enq => ({ id: enq.id, status: enq.status })));
  console.log("\nPipeline Cards:", cards?.map(c => ({ id: c.id, stage_name: c.pipeline_stages?.name, entity_type: c.entity_type, entity_id: c.entity_id })));
}
check();
