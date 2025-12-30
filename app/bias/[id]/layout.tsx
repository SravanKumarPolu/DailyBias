import biasesData from "@/data/biases.json"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/site-config"

// Generate static params for all bias pages
export function generateStaticParams() {
  return biasesData.map((bias) => ({
    id: bias.id,
  }))
}

// Route segment config for static export
export const dynamicParams = false // Only allow pre-generated routes
export const dynamic = "force-static" // Force static generation

// Generate metadata for bias pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const bias = (biasesData as Array<{ id: string; title: string; summary: string }>).find(
    (b) => b.id === id
  )

  if (!bias) {
    return {
      title: "Bias Not Found | DebiasDaily",
      description: "The bias you're looking for doesn't exist.",
    }
  }

  return {
    title: `${bias.title} | DebiasDaily`,
    description: bias.summary.substring(0, 160),
    openGraph: {
      title: `${bias.title} | DebiasDaily`,
      description: bias.summary.substring(0, 160),
      url: `${siteConfig.url}/bias/${id}`,
      siteName: siteConfig.productName,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${bias.title} | DebiasDaily`,
      description: bias.summary.substring(0, 160),
    },
  }
}

export default function BiasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

