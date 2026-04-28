require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'johndoe@gmail.com',
    password: 'password123',
    options: {
      data: {
        full_name: 'Admin Name',
        role: 'admin',
      },
    },
  });
  console.log('Admin:', error ? error.message : 'Success');
  
  const { data2, error2 } = await supabase.auth.signUp({
    email: 'johndoe2@gmail.com',
    password: 'password123',
    options: {
      data: {
        full_name: 'Doctor Name',
        role: 'doctor',
      },
    },
  });
  console.log('Doctor:', error2 ? error2.message : 'Success');
}

test();
