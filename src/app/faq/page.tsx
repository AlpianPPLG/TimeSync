import { Metadata } from "next"
import FAQForm from "./FAQForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "FAQ & Dukungan | Attendance System",
  description: "Temukan jawaban untuk pertanyaan umum atau hubungi tim dukungan kami.",
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </Button>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Pusat Bantuan</h1>
        <p className="text-muted-foreground">Temukan jawaban untuk pertanyaan umum atau hubungi tim dukungan kami</p>
      </div>
      <FAQForm />
    </div>
  )
}
