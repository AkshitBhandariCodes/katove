const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: o } = await supabase.from('orders').select('id, created_at, is_installment, user_id').order('created_at', { ascending: false }).limit(2);
  const { data: i } = await supabase.from('installment_requests').select('id, created_at, order_id, user_id, status').order('created_at', { ascending: false }).limit(2);
  
  fs.writeFileSync('db-dump.txt', 'ORDERS:\n' + JSON.stringify(o, null, 2) + '\n\nINSTALLMENTS:\n' + JSON.stringify(i, null, 2));
  console.log('Dumped to db-dump.txt');
}
checkData();
