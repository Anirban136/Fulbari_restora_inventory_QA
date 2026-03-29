"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LogOut, KeyRound, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { changeUserPin } from "@/app/actions/user"

export function UserControls() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      await changeUserPin(currentPin, newPin)
      setSuccess(true)
      setCurrentPin("")
      setNewPin("")
      setTimeout(() => setIsOpen(false), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-md shadow-inner">
          <KeyRound className="w-4 h-4 mr-2" /> Change PIN
        </DialogTrigger>
        <DialogContent className="border-white/10 bg-black/95 backdrop-blur-2xl text-white shadow-[0_0_100px_-20px_oklch(0.55_0.16_150)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-emerald-400" />
              Reset Passcode
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
              <p className="text-slate-400 font-medium">Your PIN has been updated.<br/>Please use it for future logins.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current PIN</label>
                <Input 
                  type="password" pattern="[0-9]*" inputMode="numeric" maxLength={4}
                  value={currentPin} onChange={e => setCurrentPin(e.target.value)}
                  className="w-full text-center text-3xl tracking-[0.5em] h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-700 rounded-xl focus-visible:ring-emerald-500/50 shadow-inner"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">New PIN</label>
                <Input 
                  type="password" pattern="[0-9]*" inputMode="numeric" maxLength={4}
                  value={newPin} onChange={e => setNewPin(e.target.value)}
                  className="w-full text-center text-3xl tracking-[0.5em] h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-700 rounded-xl focus-visible:ring-emerald-500/50 shadow-inner"
                  required
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm font-bold text-center bg-red-950/40 border border-red-500/20 py-3 rounded-lg animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading || currentPin.length !== 4 || newPin.length !== 4} className="w-full h-12 text-lg font-black tracking-widest uppercase bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50">
                {loading ? "Updating..." : "Save New PIN"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Button onClick={() => signOut()} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white backdrop-blur-md shadow-inner transition-colors">
        <LogOut className="w-4 h-4 mr-2" /> Logout
      </Button>
    </div>
  )
}
