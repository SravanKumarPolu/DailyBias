import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bias Not Found | Bias Daily",
  description: "The bias you're looking for doesn't exist.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function BiasNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Bias Not Found</h1>
          <p className="text-muted-foreground">
            The bias you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/all">Browse all biases</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

