// ============================================================
// ARCHIVO: app/layout.jsx
// MODULO: Layout Principal
// DESCRIPCION: Componente de diseno raiz que envuelve todas las
//              paginas. Provee el contexto de autenticacion
//              e integra la barra de navegacion global.
// SPRINT: 1
// RF: RF-009, RF-010
// ============================================================

import { Roboto } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import ClsNavbar from '@/components/ui/Navbar'
import './globals.css'

// Cargar fuente Roboto desde Google Fonts
const fuenteRoboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

// Metadatos SEO generales para la aplicacion OlivoScan
export const metadata = {
  title: 'OlivoScan — Deteccion Temprana de Plagas en el Olivo',
  description: 'Detecta plagas en el cultivo de olivos mediante vision por computadora e inteligencia artificial. Recibe diagnosticos inmediatos y tratamientos fitosanitarios.',
  keywords: ['olivo', 'agricultura', 'plagas', 'inteligencia artificial', 'fitosanitario', 'deteccion de plagas'],
}

function ClsRootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${fuenteRoboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-olive-50 text-olive-900 font-sans">
        <AuthProvider>
          {/* Barra de navegacion superior */}
          <ClsNavbar />
          
          {/* Contenido principal de la pagina */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Pie de pagina general */}
          <footer className="w-full py-6 bg-white border-t border-olive-100 text-center text-sm text-olive-600">
            <p>&copy; {new Date().getFullYear()} OlivoScan. Todos los derechos reservados.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}

export default ClsRootLayout
