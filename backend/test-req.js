const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testQuery() {
  const { data, error } = await supabase
    .from('installment_requests')
    .select('*, user:profiles(id, name, email, phone), product:products(id, name, selling_price), documents:installment_documents(*), payments:installment_payments(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ERROR FETCHING:', error.message, error.details, error.hint);
  } else {
    console.log('DATA LENGTH:', data?.length);
  }
}
testQuery();
