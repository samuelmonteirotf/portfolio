import type { Metadata } from "next"
import { CaseStudyPage } from "@/components/case-study"
import { CASE_SLUGS, getCase } from "@/lib/case-studies"
import { getContent, projectSlug } from "@/lib/portfolio-data"

/* Uma página estática por projeto (export do Cloudflare Pages). Metadados em
 * PT, o público primário; o corpo troca de idioma no cliente como a home. */

export const dynamicParams = false

export function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getContent("pt").projects.find((p) => projectSlug(p.title) === slug)
  const cs = getCase(slug, "pt")
  const title = `${project?.title ?? slug} | Samuel Monteiro`
  const description = cs?.oneLiner ?? project?.solution
  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title, description, url: `/projects/${slug}`, type: "article", images: ["/og.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <CaseStudyPage slug={slug} />
}
