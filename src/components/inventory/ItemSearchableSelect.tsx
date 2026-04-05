"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, Check, ChevronDown } from "lucide-react"

interface Item {
  id: string
  name: string
  unit: string
  currentStock?: number
<<<<<<< HEAD
  piecesPerBox?: number | null
=======
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee
}

interface ItemSearchableSelectProps {
  items: Item[]
  name?: string
  placeholder?: string
  showStock?: boolean
  required?: boolean
  defaultValue?: string
<<<<<<< HEAD
  onSelect?: (item: Item) => void
=======
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee
}

export function ItemSearchableSelect({ 
  items, 
  name = "itemId", 
  placeholder = "Type product name...", 
  showStock = false,
  required = true,
<<<<<<< HEAD
  defaultValue = "",
  onSelect
=======
  defaultValue = ""
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee
}: ItemSearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize with default value if provided
  useEffect(() => {
    if (defaultValue && items.length > 0) {
      const item = items.find(i => i.id === defaultValue)
      if (item) {
        setSelectedItem(item)
        setSearchTerm(item.name)
      }
    }
  }, [defaultValue, items])

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
      <input type="hidden" name={name} value={selectedItem?.id || ""} required={required} />
      
      <div className="relative">
        <input 
          type="text"
          autoComplete="off"
          spellCheck="false"
          placeholder={placeholder}
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
        <div 
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown 
            className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} 
          />
        </div>
      </div>

      {open && (searchTerm || filteredItems.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-y-auto flex-1 custom-scrollbar-premium">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setSearchTerm(item.name)
                    setOpen(false)
<<<<<<< HEAD
                    if (onSelect) onSelect(item)
=======
>>>>>>> e6b0872507fa39290faeb12e670b353a0ac202ee
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 flex items-center justify-between transition-colors ${selectedItem?.id === item.id ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-slate-300 border-l-2 border-transparent"}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-wide">{item.name}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{item.unit}</span>
                       {showStock && item.currentStock !== undefined && (
                         <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">Stock: {item.currentStock}</span>
                       )}
                    </div>
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
