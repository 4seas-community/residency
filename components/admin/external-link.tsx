import { normalizeUrl } from "@/lib/applications/utils"

interface ExternalLinkProps {
  url: string | null | undefined
  className?: string
  /** Rendered when there is no URL. Defaults to a dash. */
  fallback?: React.ReactNode
}

/** Renders a normalized external link, or a fallback when the URL is empty. */
export function ExternalLink({
  url,
  className = "text-blue-600 hover:underline break-all",
  fallback = "-",
}: ExternalLinkProps) {
  if (!url) return <>{fallback}</>

  return (
    <a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer" className={className}>
      {url}
    </a>
  )
}
