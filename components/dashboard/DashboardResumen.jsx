// ============================================================
// ARCHIVO: components/dashboard/DashboardResumen.jsx
// MODULO: Dashboard
// DESCRIPCION: Componente que renderiza el grid de tarjetas con
//              los indicadores clave de la cuenta del usuario.
// SPRINT: 4
// RF: RF-008
// ============================================================

import React from 'react'
import { Activity, ShieldAlert, Clock, UserCheck } from 'lucide-react'

// Muestra tarjetas de resumen con total de analisis, cultivos infectados, alertas activas y sesion.
function ClsDashboardResumen({ objStats }) {
  
  // Extraer valores con fallbacks seguros en caso de carga o datos vacios
  const total = objStats?.totalAnalisis ?? 0
  const alertas = objStats?.alertasActivas ?? 0
  const infectados = objStats?.cultivosInfectados ?? 0
  const ultimo = objStats?.ultimoAnalisis
  
  // Formatear descripcion del ultimo analisis
  let strUltimoDetalle = 'Sin registros previos'
  if (ultimo) {
    const objFecha = new Date(ultimo.creado_en)
    const strFechaFormato = objFecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    const strNombrePlaga = ultimo.plaga_corregida || ultimo.plaga_detectada
    strUltimoDetalle = `${strNombrePlaga} (${strFechaFormato})`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      
      {/* Tarjeta 1: Total de Análisis */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-olive-100 shadow-glass">
        <div className="p-3.5 bg-olive-50 text-olive-650 rounded-xl border border-olive-100/50">
          <Activity className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <span className="block text-3xl font-extrabold text-olive-950 tracking-tight">
            {total}
          </span>
          <span className="text-xs font-semibold text-olive-600">
            Análisis Realizados
          </span>
        </div>
      </div>

      {/* Tarjeta 2: Cultivos en Riesgo */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-olive-100 shadow-glass">
        <div className={`p-3.5 rounded-xl border ${
          infectados > 0 
            ? 'bg-red-50 text-red-600 border-red-100' 
            : 'bg-green-50 text-green-600 border-green-100'
        }`}>
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <span className="block text-3xl font-extrabold text-olive-950 tracking-tight">
            {infectados}
          </span>
          <span className="text-xs font-semibold text-olive-600">
            Zonas en Riesgo (30d)
          </span>
        </div>
      </div>

      {/* Tarjeta 3: Alertas Activas */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-olive-100 shadow-glass">
        <div className={`p-3.5 rounded-xl border ${
          alertas > 0 
            ? 'bg-amber-50 text-amber-600 border-amber-100' 
            : 'bg-olive-50 text-olive-600 border-olive-100/50'
        }`}>
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="block text-xl font-bold text-olive-950 break-words whitespace-normal leading-tight">
            {alertas > 0 ? `${alertas} Activas` : 'Ninguna'}
          </span>
          <span className="text-xs font-semibold text-olive-650 block mt-0.5">
            Casos Graves Detectados
          </span>
        </div>
      </div>

      {/* Tarjeta 4: Último Diagnóstico */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-olive-100 shadow-glass">
        <div className="p-3.5 bg-olive-50 text-olive-650 rounded-xl border border-olive-100/50">
          <UserCheck className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="block text-sm font-bold text-olive-950 break-words whitespace-normal leading-tight">
            {strUltimoDetalle}
          </span>
          <span className="text-xs font-semibold text-olive-650 block mt-0.5">
            Último Diagnóstico
          </span>
        </div>
      </div>

    </div>
  )
}

export default ClsDashboardResumen
