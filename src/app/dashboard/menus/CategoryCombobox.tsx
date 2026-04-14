"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export function CategoryCombobox({ 
  name, 
  suggestions, 
  defaultValue = "", 
  placeholder = "Select or type category..." 
}: { 
  name: string
  suggestions: string[]
  defaultValue?: string
  placeholder?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required
          autoComplete="off"
          className="w-full h-12 px-4 py-2 pr-10 rounded-xl border border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center cursor-pointer text-muted-foreground/40 hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 py-1 max-h-48 overflow-auto bg-background border border-border rounded-xl shadow-2xl">
          {filtered.length > 0 ? (
            filtered.map((s, i) => (
              <div 
                key={i} 
                className="px-4 py-3 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                onClick={() => {
                  setValue(s)
                  setIsOpen(false)
                }}
              >
                {s}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
              Press enter or submit to save "{value}" as a new category
            </div>
          )}
        </div>
      )}
    </div>
  )
}
