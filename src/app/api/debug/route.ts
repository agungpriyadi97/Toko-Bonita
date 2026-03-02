import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Check if we can connect
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .limit(1)

    if (catError) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: catError.message 
      }, { status: 500 })
    }

    // Check profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')

    // List auth users (using admin API)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    return NextResponse.json({
      status: 'connected',
      supabaseUrl,
      profiles: profiles || [],
      profilesError: profileError?.message,
      authUsers: users?.map(u => ({ id: u.id, email: u.email })) || [],
      authUsersError: usersError?.message
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
