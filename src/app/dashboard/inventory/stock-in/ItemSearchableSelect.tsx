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
    if (!searchTerm) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input type="hidden" name="itemId" value={selectedItem?.id || ""} required />
      
      <div 
        onClick={() => setOpen(!open)}
        className="w-full h-12 px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-primary/50 transition-all shadow-inner group"
      >
        <span className={selectedItem ? "text-white font-medium" : "text-slate-500"}>
          {selectedItem ? `${selectedItem.name} (${selectedItem.unit})` : "Search or select item..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              autoFocus
              placeholder="Type to filter..."
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (filteredItems.length > 0) {
                    setSelectedItem(filteredItems[0])
                    setOpen(false)
                  }
                }
              }}
            />
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setOpen(false)
                    setSearchTerm("")
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 flex items-center justify-between transition-colors ${selectedItem?.id === item.id ? "bg-primary/10 text-primary" : "text-slate-300"}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{item.unit}</span>
                  </div>
                  {selectedItem?.id === item.id && <Check className="w-4 h-4" />}
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
