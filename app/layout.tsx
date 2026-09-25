import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/* Metadados estáticos em PT (público primário); o conteúdo da página troca
 * de idioma no cliente e o <html lang> é atualizado pelo LanguageProvider. */
const SITE_URL = 'https://monteirotf.com'
const TITLE = 'Samuel Monteiro | Engenheiro Full-Stack e DevOps'
const DESCRIPTION =
  'Produto em Next.js, React e FastAPI. Infraestrutura de edge com Cloudflare Workers, Docker e Rust. Portfólio com projetos em produção. Curitiba, Brasil.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: 'Samuel Monteiro',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Samuel Monteiro, Engenheiro Full-Stack e DevOps' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#15181d',
}

/* Person JSON-LD: busca pelo nome é o caminho nº 1 de um recrutador */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Samuel Monteiro',
  jobTitle: 'Engenheiro Full-Stack e DevOps',
  url: SITE_URL,
  email: 'mailto:samuel@monteirotf.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Curitiba', addressCountry: 'BR' },
  sameAs: [
    'https://github.com/samuelmonteirotf',
    'https://www.linkedin.com/in/smonteiro-jr/',
  ],
  knowsAbout: [
    'DevOps',
    'Edge Security',
    'Cloudflare Workers',
    'Next.js',
    'React',
    'FastAPI',
    'Rust',
    'Docker',
    'PostgreSQL',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  )
}
