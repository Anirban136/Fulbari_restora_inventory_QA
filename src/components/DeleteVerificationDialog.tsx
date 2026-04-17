"use client"

import { useState } from "react"
import { 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Loader2,
  XCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DeleteVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (pin: string) => Promise<void>
  title: string
  description: string
  itemName: string
  loading?: boolean
  requirePin?: boolean
}

export function DeleteVerificationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  loading: externalLoading,
  requirePin = true
}: DeleteVerificationDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [pin, setPin] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loading = externalLoading || localLoading

  const handleNextStep = () => {
    setStep(2)
  }

  const handleConfirm = async () => {
    if (requirePin && !pin) {
      setError("Please enter your Admin PIN")
      return
    }

    setLocalLoading(true)
    setError(null)
    try {
      await onConfirm(pin)
      onOpenChange(false)
      // Reset state for next time
      setTimeout(() => {
        setStep(1)
        setPin("")
      }, 300)
    } catch (e: any) {
      setError(e.message || "Verification failed")
    } finally {
      setLocalLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after transition
    setTimeout(() => {
      setStep(1)
      setPin("")
      setError(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-3xl border-border rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <div 
            className={cn(
              "h-full bg-red-500 transition-all duration-500",
              step === 1 ? "w-1/2" : "w-full"
            )} 
          />
        </div>

        <DialogHeader>
          <div className={cn(
            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 border transition-all duration-500",
            step === 1 
              ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          )}>
            {step === 1 ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
            {step === 1 ? title : "Security Verification"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium tracking-tight mt-4 leading-relaxed">
            {step === 1 ? (
              <>
                {description} <br />
                <span className="text-foreground font-black underline decoration-red-500/30 decoration-2">"{itemName}"</span>
              </>
            ) : (
              "This action is destructive and requires administrative authorization. Please enter your Admin PIN to proceed."
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 2 && (
          <div className="py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="delete-pin" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Admin Security PIN</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <Input
                  id="delete-pin"
                  type="password"
                  placeholder="••••"
                  className="h-14 pl-12 bg-background border-border rounded-2xl text-xl font-black tracking-[0.5em] focus-visible:ring-red-500/30 transition-all shadow-inner"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value)
                    setError(null)
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) handleConfirm()
                  }}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1 animate-in shake-in">
                  <XCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-8 gap-3 sm:flex-col sm:gap-4">
          {step === 1 ? (
            <>
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </Button>
              <Button 
                onClick={requirePin ? handleNextStep : handleConfirm}
                disabled={loading}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                {requirePin ? (
                  <>Proceed to Verify <Trash2 className="ml-2 w-4 h-4" /></>
                ) : (
                  <>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
                    Confirm Deletion
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={loading || pin.length < 4}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
                Confirm Deletion
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
