"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, Check, ChevronDown } from "lucide-react"

interface Item {
  id: string
  name: string
  unit: string
}

export function ItemSearchableSelect({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase()
    if (!term && !open) return []
    return items.filter(item => 
      item.name.toLowerCase().includes(term)
    )
  }, [items, searchTerm, open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
        // If nothing selected, clear search or restore previous selection name
        if (!selectedItem) setSearchTerm("")
        else setSearchTerm(selectedItem.name)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [selectedItem])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input type="hidden" name="itemId" value={selectedItem?.id || ""} required />
      
      <div className="relative">
        <input 
          type="text"
          placeholder="Type product name (e.g. Bread)..."
          className="w-full h-12 pl-12 pr-10 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner font-medium"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setOpen(true)
            if (selectedItem && e.target.value !== selectedItem.name) {
               setSelectedItem(null)
            }
          }}
          onFocus={() => setOpen(true)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <ChevronDown 
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 cursor-pointer transition-transform ${open ? "rotate-180" : ""}`} 
          onClick={() => setOpen(!open)}
        />
      </div>

      {open && (searchTerm || filteredItems.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setSearchTerm(item.name)
                    setOpen(false)
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 flex items-center justify-between transition-colors ${selectedItem?.id === item.id ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-slate-300 border-l-2 border-transparent"}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-wide">{item.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{item.unit}</span>
                  </div>
                  {selectedItem?.id === item.id && <Check className="w-5 h-5" />}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-600 text-sm italic">
                No items matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
