import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ngomwbwzxitphygvwlmj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nb213Ynd6eGl0cGh5Z3Z3bG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTQyNzcxNCwiZXhwIjoyMDU1MDAzNzE0fQ.je_VDBhNdKF8nM0f1vGEqPRBNsj1YOdLZgN4oGK0ZsU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // Try to get a product to see columns
  const { data: products, error: pErr } = await supabase.from('products').select('*').limit(1)
  console.log('Products columns:', products?.[0] ? Object.keys(products[0]) : pErr)

  // Try to get a warehouse
  const { data: warehouses, error: wErr } = await supabase.from('warehouses').select('*').limit(1)
  console.log('Warehouses columns:', warehouses?.[0] ? Object.keys(warehouses[0]) : wErr)

  // Try to get product_stocks
  const { data: stocks, error: sErr } = await supabase.from('product_stocks').select('*').limit(1)
  console.log('Product_stocks columns:', stocks?.[0] ? Object.keys(stocks[0]) : sErr)

  // Try to get stock_movements
  const { data: movements, error: mErr } = await supabase.from('stock_movements').select('*').limit(1)
  console.log('Stock_movements columns:', movements?.[0] ? Object.keys(movements[0]) : mErr)

  // Count products
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })
  console.log('Total products:', count)
}

main()
