// ============================================================
// NOMBRE OBJETO: app/analisis/page.jsx
// FECHA CREACION: 2026-08-31
// PROPIETARIO: Equipo de Desarrollo OlivoScan
// REQUERIMIENTO: RF-01, RF-02, RF-03
// DESCRIPCION: Página principal del módulo de análisis foliar que orquesta
//              el flujo de captura de imagen, subida al backend, estados
//              de procesamiento asíncrono y renderizado de resultados.
// ============================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, AlertCircle, Loader2 } from 'lucide-react'

// Hooks de negocio
import { useAuth } from '@/hooks/useAuth'
import { useAnalisis } from '@/hooks/useAnalisis'

// Componentes de interfaz
import AnalisisSubirImagen from '@/components/analisis/AnalisisSubirImagen'
import AnalisisResultado from '@/components/analisis/AnalisisResultado'

/**
 * Página principal del módulo de diagnóstico de plagas.
 */
export default function AnalisisPage() {
  const { objUsuario, cargando: cargandoUsuario } = useAuth()
  const router = useRouter()

  const { errorAnalisis, crearAnalisis, guardarFeedback } = useAnalisis()

  const [etapa, setEtapa] = useState('seleccionar')
  const [analisisActual, setAnalisisActual] = useState(null)
  const [errorLocal, setErrorLocal] = useState(null)

  // Fail Fast: Redirección si no existe usuario autenticado
  useEffect(() => {
    if (!cargandoUsuario && !objUsuario) {
      router.push('/login')
    }
  }, [objUsuario, cargandoUsuario, router])

  async function manejarSeleccionarImagen(archivoImagen) {
    setErrorLocal(null)
    setEtapa('analizando')

    try {
      const resultadoDiagnostico = await crearAnalisis(archivoImagen)

      if (resultadoDiagnostico) {
        setAnalisisActual(resultadoDiagnostico)
        setEtapa('resultado')
      } else {
        throw new Error('No se recibieron datos válidos del diagnóstico.')
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo completar el diagnóstico de la imagen.'
      setErrorLocal(mensaje)
      setEtapa('seleccionar')
    }
  }

  function manejarReiniciarFlujo() {
    setAnalisisActual(null)
    setErrorLocal(null)
    setEtapa('seleccionar')
  }

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
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-olive-950 sm:text-4xl">
            Diagnóstico de Plagas
          </h1>
          <p className="text-sm sm:text-base text-olive-700 max-w-xl mx-auto">
            Capture o suba una foto detallada de la hoja del olivo para detectar plagas y enfermedades de forma automatizada mediante Inteligencia Artificial.
          </p>
        </div>

        {(errorLocal || errorAnalisis) && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 border border-red-100 rounded-xl text-sm font-medium max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorLocal || errorAnalisis}</span>
          </div>
        )}

        {etapa === 'seleccionar' && (
          <AnalisisSubirImagen onImagenSeleccionada={manejarSeleccionarImagen} />
        )}

        {etapa === 'analizando' && (
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto h-80 bg-white rounded-2xl border border-olive-100 shadow-glass">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-olive-600 animate-spin" />
              <Sprout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-olive-500" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-olive-950">
                Procesando fotografía...
              </h3>
              <p className="text-xs text-olive-600 max-w-xs mx-auto leading-relaxed">
                Subiendo la imagen a los servidores de análisis y ejecutando la detección del modelo de IA. Esto tomará aproximadamente 2 segundos.
              </p>
            </div>
          </div>
        )}

        {etapa === 'resultado' && analisisActual && (
          <AnalisisResultado
            analisis={analisisActual}
            onReiniciar={manejarReiniciarFlujo}
            onGuardarFeedback={guardarFeedback}
          />
        )}
      </div>
    </div>
  )
}
