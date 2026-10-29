// ============================================================
// ARCHIVO: app/dashboard/page.jsx
// MODULO: Dashboard
// DESCRIPCION: Pagina principal del panel de control. Carga las metricas
//              del agricultor y renderiza el resumen y el grafico.
// SPRINT: 4
// RF: RF-008, RF-009
// ============================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, AlertCircle, Loader2 } from 'lucide-react'

// Hooks e instancias de conexion
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// Componentes de visualizacion
import ClsDashboardResumen from '@/components/dashboard/DashboardResumen'
import ClsDashboardGrafico from '@/components/dashboard/DashboardGrafico'

function ClsDashboardPage() {
  const { objUsuario, objPerfil, cargando: cargandoUsuario } = useAuth()
  const router = useRouter()

  // Estados locales para las estadisticas de la cuenta
  const [objStats, setObjStats] = useState(null)
  const [cargandoStats, setCargandoStats] = useState(true)
  const [strErrorStats, setStrErrorStats] = useState(null)

  // Redireccionar a login si no esta autenticado
  useEffect(() => {
    if (!cargandoUsuario && !objUsuario) {
      router.push('/login')
    }
  }, [objUsuario, cargandoUsuario, router])

  // Obtener las estadisticas agregadas desde la API Route del dashboard
  async function cargarEstadisticas() {
    try {
      setCargandoStats(true)
      setStrErrorStats(null)

      // Obtener token Bearer de la sesion de Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Sesión de usuario no válida.')
      }

      const res = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const resJson = await res.json()

      if (!res.ok || resJson.error) {
        throw new Error(resJson.error || 'No se pudieron recuperar las estadísticas.')
      }

      setObjStats(resJson.datos)
    } catch (error) {
      console.error('Error al cargar metricas de dashboard:', error)
      setStrErrorStats(error.message || 'Error de red al conectar con el servidor.')
    } finally {
      setCargandoStats(false)
    }
  }

  // Cargar estadisticas tras verificar autenticacion
  useEffect(() => {
    if (objUsuario) {
      cargarEstadisticas()
    }
  }, [objUsuario])

  // Carga inicial del usuario
  if (cargandoUsuario || !objUsuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Sprout className="w-12 h-12 text-olive-500 animate-bounce" />
        <p className="mt-4 text-sm font-medium text-olive-750">
          Cargando panel de control...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* 1. Faja de Bienvenida Superior */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-olive-100 shadow-glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-olive-950">
            Hola, {objPerfil?.nombre || 'Agricultor'}
          </h2>
          <p className="text-xs sm:text-sm text-olive-650">
            Bienvenido de vuelta a OlivoScan. El estado general de su olivar se encuentra monitoreado.
          </p>
        </div>
        <Link
          href="/analisis"
          className="inline-flex items-center gap-2 px-5 py-3 bg-olive-500 hover:bg-olive-600 text-white font-semibold rounded-xl shadow-md transition-all text-sm shrink-0 cursor-pointer"
        >
          <Sprout className="w-4.5 h-4.5" />
          <span>Nuevo Análisis</span>
        </Link>
      </div>

      {/* 2. Visualizacion de Cargando o Errores de API */}
      {cargandoStats ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-olive-100 rounded-2xl shadow-glass">
          <Loader2 className="w-10 h-10 text-olive-500 animate-spin" />
          <p className="mt-3 text-xs font-semibold text-olive-600">
            Calculando métricas del olivar...
          </p>
        </div>
      ) : strErrorStats ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 border border-red-150 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-650 flex-shrink-0" />
          <span>{strErrorStats}</span>
        </div>
      ) : (
        <>
          {/* 3. Grid de Tarjetas Resumen */}
          <ClsDashboardResumen objStats={objStats} />

          {/* 4. Grafico SVG de Tendencias Mensuales */}
          <ClsDashboardGrafico objDatosGrafico={objStats?.datosGrafico} />
        </>
      )}

    </div>
  )
}

export default ClsDashboardPage
