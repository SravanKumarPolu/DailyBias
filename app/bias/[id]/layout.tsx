import biasesData from "@/data/biases.json"

// Generate static params for all bias pages
export function generateStaticParams() {
  return biasesData.map((bias) => ({
    id: bias.id,
  }))
}

export default function BiasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

