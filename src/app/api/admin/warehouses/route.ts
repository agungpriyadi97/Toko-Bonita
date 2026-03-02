import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List warehouses
export async function GET() {
  const { data, error } = await supabase
    .from('warehouses')
    .select(`*, branch:branches(name)`)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST - Create new warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, branch_id, address } = body

    if (!name || !branch_id) {
      return NextResponse.json({ error: 'Nama dan cabang wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('warehouses')
      .insert({ name, branch_id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating warehouse:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE - Delete warehouse
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })
    }

    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
