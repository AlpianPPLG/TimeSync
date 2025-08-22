"use server"

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  try {
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // This should be a verified domain in your Resend account
      to: 'nova07pplg@gmail.com',
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
      return { success: false, message: 'Gagal mengirim pesan. Silakan coba lagi nanti.' }
    }

    return { success: true, message: 'Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.' }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, message: 'Terjadi kesalahan. Silakan coba lagi nanti.' }
  }
}
