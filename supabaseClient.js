import { createClient } from '@supabase/supabase-js';

// 1. Connect to your specific Supabase project
const supabaseUrl = 'mjdarfyzednoohsiasgk';
const supabaseKey = 'mjdarfyzednoohsiasgk';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. The function to get coupons by brand name
async function getCouponsByBrand(userInput) {
  
  // Clean the input (e.g., "Hostinger " becomes "hostinger")
  const cleanBrandName = userInput.trim().toLowerCase();

  // Query your 'coupons' table
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('brand_name', cleanBrandName)
    .eq('is_active', true); // Only get coupons that are turned on

  if (error) {
    console.error('Error fetching coupons:', error.message);
    return [];
  }

  // Return the list of coupons found
  return data;
}
