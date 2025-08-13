"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LogIn, LogOut, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"

export function QuickActions() {
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkOutLoading, setCheckOutLoading] = useState(false)
  const [location, setLocation] = useState("Office")
  const [notes, setNotes] = useState("")
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false)

  const handleCheckIn = async () => {
    setCheckInLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location, notes }),
      })

      const data = await response.json()

      if (data.success) {
        toast("Check-in Berhasil", {
          description: data.message,
        })
        setIsCheckInOpen(false)
        setNotes("")
        // Refresh the page or update state
        window.location.reload()
      } else {
        toast("Check-in Gagal", {
          description: data.message,
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast("Error", {
        description: "Terjadi kesalahan koneksi",
      })
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setCheckOutLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      const data = await response.json()

      if (data.success) {
        toast("Check-out Berhasil", {
          description: data.message,
        })
        setIsCheckOutOpen(false)
        setNotes("")
        // Refresh the page or update state
        window.location.reload()
      } else {
        toast("Check-out Gagal", {
          description: data.message,
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast("Error", {
        description: "Terjadi kesalahan koneksi",
      })
    } finally {
      setCheckOutLoading(false)
    }
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{getCurrentTime()}</p>
          <p className="text-sm text-gray-600">Waktu Sekarang</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Check In Dialog */}
          <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Check In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check In</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Masukkan lokasi"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleCheckIn} disabled={checkInLoading} className="w-full">
                  {checkInLoading ? "Processing..." : "Konfirmasi Check In"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Check Out Dialog */}
          <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check Out</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="checkout-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk check out..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCheckOut}
                  disabled={checkOutLoading}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {checkOutLoading ? "Processing..." : "Konfirmasi Check Out"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
