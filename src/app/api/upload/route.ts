import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Upload payment proof image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    // Generate filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const ext = file.name.split('.').pop()
    const fileName = `payment-proof/${orderId}/${timestamp}-${randomStr}.${ext}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // If storage bucket doesn't exist, store as base64 in order
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
      
      // Update order with payment proof
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_proof: base64,
          payment_status: 'paid'
        })
        .eq('id', orderId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        paymentProof: base64,
        message: 'Bukti pembayaran berhasil diupload'
      })
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(uploadData.path)

    const publicUrl = urlData.publicUrl

    // Update order with payment proof URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_proof: publicUrl,
        payment_status: 'paid'
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Update order error:', updateError)
    }

    return NextResponse.json({ 
      success: true, 
      paymentProof: publicUrl,
      message: 'Bukti pembayaran berhasil diupload'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
