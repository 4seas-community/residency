"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "General" },
    { href: "/residency/crypto", label: "Crypto Residency" },
    { href: "/residency/art", label: "Art Residency" },
    { href: "/residency/longevity", label: "Longevity Residency" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <a href="https://www.4seas.xyz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <img src="/images/4seas-logo.png" alt="4Seas" className="h-6 md:h-8 w-auto" />
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`text-sm transition-colors ${pathname === link.href ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Desktop Spacer */}
        <div className="hidden md:block w-[100px]" />
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 -mr-2 text-foreground"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 text-sm transition-colors ${pathname === link.href ? "text-foreground font-medium bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
