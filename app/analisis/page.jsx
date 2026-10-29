'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AnalisisSubirImagen from '@/components/analisis/AnalisisSubirImagen'

export default function AnalisisPage() {
  const { objUsuario, cargando: cargandoUsuario } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!cargandoUsuario && !objUsuario) {
      router.push('/login')
    }
  }, [objUsuario, cargandoUsuario, router])

  if (cargandoUsuario || !objUsuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Sprout className="w-12 h-12 text-olive-500 animate-bounce" />
        <p className="mt-4 text-sm font-medium text-olive-750">
          Cargando módulo de análisis...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] bg-olive-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-olive-950 sm:text-4xl">
          Diagnóstico de Plagas
        </h1>
        <AnalisisSubirImagen />
        <div role="status" className="flex items-start gap-3 p-6 bg-white border border-olive-100 rounded-xl max-w-2xl mx-auto">
          <AlertCircle className="w-6 h-6 shrink-0 text-olive-600" />
          <div className="space-y-2">
            <h2 className="font-bold text-olive-950">Análisis temporalmente no disponible</h2>
            <p className="text-sm text-olive-700">
              Puedes seleccionar y previsualizar una fotografía. La imagen permanece en tu dispositivo; el diagnóstico estará disponible cuando se conecte el servicio de análisis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

