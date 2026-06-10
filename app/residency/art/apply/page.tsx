import ApplicationForm from "@/components/residency/application-form"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"

export default function ArtApplyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Title */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-sans font-semibold text-foreground mb-2">Apply for Art Residency</h1>
          <p className="text-muted-foreground">
            Join artists, filmmakers, writers, and creators exploring new forms of expression.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ApplicationForm 
          programType="art"
          programTitle="Art Residency"
          programColor="#e11d48"
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
