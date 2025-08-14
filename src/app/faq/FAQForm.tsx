"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, Phone, Info } from "lucide-react"
import Link from "next/link"

const faqItems = [
  {
    question: "Bagaimana cara melakukan absensi?",
    answer: "Anda dapat melakukan absensi melalui menu Absensi di sidebar. Pastikan GPS dan kamera Anda aktif untuk verifikasi lokasi dan wajah."
  },
  {
    question: "Apa yang harus dilakukan jika lupa password?",
    answer: "Silakan klik 'Lupa Password' di halaman login dan ikuti instruksi yang dikirim ke email Anda."
  },
  {
    question: "Bagaimana cara mengajukan cuti?",
    answer: "Anda dapat mengajukan cuti melalui menu Cuti di sidebar. Isi formulir pengajuan dan tunggu persetujuan dari atasan."
  },
  {
    question: "Apa yang harus dilakukan jika ada kesalahan data absensi?",
    answer: "Segera hubungi admin melalui formulir dukungan di bawah atau hubungi nomor telepon yang tersedia."
  },
]

export default function FAQForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form)
    
    // Client-side validation
    if (!formData.get('name') || !formData.get('email') || !formData.get('subject') || !formData.get('message')) {
      setMessage({ type: 'error', text: 'Semua field harus diisi' })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Reset form
        if (form) {
          form.reset()
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal mengirim pesan. Silakan coba lagi.' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi nanti.' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Pusat Bantuan</h1>
        <p className="text-muted-foreground">Temukan jawaban untuk pertanyaan umum atau hubungi tim dukungan kami</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="bg-blue-100 p-3 rounded-full w-fit mb-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Pertanyaan Umum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
            <Button className="px-0 mt-2">
              <Link href="#faq">Lihat FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-3">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Email Dukungan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Kirim email ke tim dukungan kami</p>
            <Button className="px-0 mt-2">
              <a href="mailto:nova07pplg@gmail.com">nova07pplg@gmail.com</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="bg-purple-100 p-3 rounded-full w-fit mb-3">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Telepon Darurat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Hubungi nomor darurat untuk bantuan segera</p>
            <Button className="px-0 mt-2">
              +62 812-3456-7890
            </Button>
          </CardContent>
        </Card>
      </div>

      <div id="faq" className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Pertanyaan yang Sering Diajukan</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-500" />
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-8 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-2">Butuh Bantuan Lebih Lanjut?</h2>
          <p className="text-muted-foreground mb-8">Isi formulir di bawah ini dan tim dukungan kami akan segera menghubungi Anda</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subjek</label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Pesan</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
            
            {message && (
              <div 
                className={`p-3 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}
            
            <div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim...
                  </>
                ) : 'Kirim Pesan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
