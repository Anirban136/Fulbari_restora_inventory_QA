"use client"

import { wipeTestData } from "./actions"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"

export default function WipePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleWipe() {
    if (!confirm("WARNING: This will permanently delete ALL Menus, Orders, Inventory, and Vendors. Only Passwords and Outlets will remain. Are you absolutely sure?")) return;
    
    setLoading(true)
    try {
      await wipeTestData()
      setSuccess(true)
      alert("Test data successfully wiped!")
    } catch (e: any) {
      alert("Failed to wipe data: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">Reset Test Data</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          This will securely wipe all your test orders, inventory items, vendors, and menus so you can start fresh. <br/> <strong className="text-emerald-400">Your accounts, passwords, and outlets will be kept safe.</strong>
        </p>
      </div>

      <Button 
        onClick={handleWipe}
        disabled={loading || success}
        variant="destructive"
        className="mt-6 h-14 px-8 text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.3)] transition-all active:scale-95"
      >
        {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Wiping Database...</> : success ? "Database Wiped Successfully!" : "Yes, Wipe All Test Data"}
      </Button>
    </div>
  )
}
