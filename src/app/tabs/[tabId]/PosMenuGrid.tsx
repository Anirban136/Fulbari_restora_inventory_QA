"use client"

import { useState } from "react"
import { addTabItem } from "./actions"
import { ArrowLeft, Tag } from "lucide-react"

export function PosMenuGrid({ categorizedMenu, tabId, isCafe }: { categorizedMenu: Record<string, any[]>, tabId: string, isCafe: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Object.keys(categorizedMenu)

  if (!selectedCategory) {
    // Show Categories View
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-6 pb-32 animate-in fade-in duration-300">
        <h3 className={`text-xs font-black tracking-[0.2em] ${isCafe ? "text-orange-400" : "text-sky-400"} uppercase mb-6 flex items-center gap-4`}>
          Select Category
          <div className="h-px bg-white/10 flex-1"></div>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-center bg-white/5 backdrop-blur-md ${isCafe ? "hover:bg-orange-500/10 hover:border-orange-500/50 hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.3)]" : "hover:bg-sky-500/10 hover:border-sky-500/50 hover:shadow-[0_0_25px_-5px_rgba(14,165,233,0.3)]"} border border-white/10 rounded-2xl p-6 transition-all active:scale-95 group shadow-lg flex flex-col items-center justify-center gap-3 aspect-square max-h-[160px]`}
            >
              <div className={`p-3 rounded-xl bg-white/5 ${isCafe ? "group-hover:bg-orange-500/20" : "group-hover:bg-sky-500/20"} transition-colors`}>
                <Tag className={`w-8 h-8 ${isCafe ? "text-orange-400" : "text-sky-400"}`} />
              </div>
              <div className={`font-black text-slate-200 ${isCafe ? "group-hover:text-orange-300" : "group-hover:text-sky-300"} text-lg sm:text-xl truncate w-full transition-colors`}>
                {category}
              </div>
              <p className="text-xs text-slate-500 font-bold tracking-widest">{categorizedMenu[category].length} ITEMS</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Show Items for Selected Category
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
      <div className="p-4 sm:px-8 border-b border-white/5 flex items-center justify-between shrink-0">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-all ${isCafe ? "text-orange-400/70 hover:text-orange-400" : "text-sky-400/70 hover:text-sky-400"}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-6 pb-32">
        <h3 className={`text-xs font-black tracking-[0.2em] ${isCafe ? "text-orange-400" : "text-sky-400"} uppercase mb-6 flex items-center gap-4`}>
          {selectedCategory}
          <div className="h-px bg-white/10 flex-1"></div>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categorizedMenu[selectedCategory].map((item: any) => (
            <form key={item.id} action={addTabItem.bind(null, tabId, item.id, item.price)}>
              <button type="submit" className={`w-full text-left bg-white/5 backdrop-blur-md ${isCafe ? "hover:bg-orange-500/10 hover:border-orange-500/50 hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.3)]" : "hover:bg-sky-500/10 hover:border-sky-500/50 hover:shadow-[0_0_25px_-5px_rgba(14,165,233,0.3)]"} border border-white/10 rounded-2xl p-5 transition-all active:scale-95 group shadow-lg`}>
                <div className={`font-bold text-slate-200 ${isCafe ? "group-hover:text-orange-300" : "group-hover:text-sky-300"} text-lg mb-2 truncate transition-colors`}>{item.name}</div>
                <div className={`${isCafe ? "text-orange-500" : "text-sky-500"} font-extrabold text-xl`}>₹{item.price.toFixed(2)}</div>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
