import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    // Server-side validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Replace with your verified domain in Resend
      to: 'nova07pplg@gmail.com',
      replyTo: email,
      subject: `[Dukungan] ${subject}`,
      html: `
        <h2>Pesan Dukungan Baru</h2>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subjek:</strong> ${subject}</p>
        <p><strong>Pesan:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal mengirim pesan. Silakan coba lagi nanti.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan. Silakan coba lagi nanti.' },
      { status: 500 }
    )
  }
}
