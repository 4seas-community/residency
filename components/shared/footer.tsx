"use client"

import { withBasePath } from "@/lib/paths"

export function Footer() {
  return (
    <footer className="py-12 px-4 md:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
            <a href="https://www.4seas.xyz/" target="_blank" rel="noopener noreferrer">
              <img 
                src={withBasePath("/images/4seas-logo.png")} 
                alt="4Seas" 
                className="h-7 w-auto"
              />
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a href="https://www.4seas.xyz/" target="_blank" rel="noopener noreferrer">
              <img 
                src={withBasePath("/images/zuzalu-library-logo.png")} 
                alt="Zuzalu Library" 
                className="h-7 w-auto"
              />
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a href="https://www.ethchiangmai.com" target="_blank" rel="noopener noreferrer">
              <img 
                src={withBasePath("/images/ethchiangmai-logo.png")} 
                alt="ETHChiangmai" 
                className="h-5 w-auto"
              />
            </a>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a 
              href="https://t.me/NomadsBase" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Telegram
            </a>
            <a 
              href="https://x.com/4seasDeSoc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              X / Twitter
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 4Seas. Chiang Mai, Thailand.</p>
        </div>
      </div>
    </footer>
  )
}
