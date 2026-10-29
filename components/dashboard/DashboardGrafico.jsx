// ============================================================
// ARCHIVO: components/dashboard/DashboardGrafico.jsx
// MODULO: Dashboard
// DESCRIPCION: Grafico de barras mensual interactivo hecho con SVG puro.
//              Evita problemas de hidratacion y dependencias en React 19.
// SPRINT: 4
// RF: RF-008
// ============================================================

import React, { useState } from 'react'
import { Info } from 'lucide-react'

// Grafico SVG interactivo que muestra los diagnosticos de los ultimos 6 meses
function ClsDashboardGrafico({ objDatosGrafico }) {
  // Estado para controlar el elemento del grafico sobre el cual esta el cursor
  const [objHoverInfo, setObjHoverInfo] = useState(null) // { x, y, mes, sanas, plagas } o null

  // Si no hay datos, inicializamos un listado de mockup vacio para dibujar la cuadricula
  const listadoDatos = objDatosGrafico && objDatosGrafico.length > 0
    ? objDatosGrafico
    : [
        { mes: 'Ene', sanas: 0, plagas: 0 },
        { mes: 'Feb', sanas: 0, plagas: 0 },
        { mes: 'Mar', sanas: 0, plagas: 0 },
        { mes: 'Abr', sanas: 0, plagas: 0 },
        { mes: 'May', sanas: 0, plagas: 0 },
        { mes: 'Jun', sanas: 0, plagas: 0 }
      ]

  // Dimensiones del lienzo del grafico
  const ANCHO_TOTAL = 600
  const ALTO_TOTAL = 300
  const MARGEN_IZQ = 45
  const MARGEN_DER = 20
  const MARGEN_SUP = 30
  const MARGEN_INF = 40

  const anchoGrafico = ANCHO_TOTAL - MARGEN_IZQ - MARGEN_DER
  const altoGrafico = ALTO_TOTAL - MARGEN_SUP - MARGEN_INF

  // Calcular el valor maximo de las barras para escalar el grafico de forma dinamica
  const maximoValor = Math.max(
    ...listadoDatos.map(item => Math.max(item.sanas, item.plagas)),
    4 // minimo 4 lineas para que la cuadricula se dibuje de forma atractiva en volumenes bajos
  )

  // Generar las lineas horizontales de la cuadricula
  const lineasCuadricula = []
  for (let i = 0; i <= 4; i++) {
    const valor = Math.round((maximoValor / 4) * i)
    const y = MARGEN_SUP + altoGrafico - (i * (altoGrafico / 4))
    lineasCuadricula.push({ y, valor })
  }

  // Ancho y separacion de las barras
  const cantidadMeses = listadoDatos.length
  const anchoSeccion = anchoGrafico / cantidadMeses
  const anchoBarra = 16

  return (
    <div className="bg-white p-6 rounded-2xl border border-olive-100 shadow-glass w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-olive-950">
            Frecuencia de Diagnósticos (Últimos 6 Meses)
          </h3>
          <p className="text-xs text-olive-650">
            Visualización mensual del conteo de hojas sanas detectadas versus plagas activas.
          </p>
        </div>

        {/* Leyenda del Grafico */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-olive-500 rounded-sm" />
            <span className="text-olive-750">Hojas Sanas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-600 rounded-sm" />
            <span className="text-olive-750">Plagas</span>
          </div>
        </div>
      </div>

      {/* Contenedor del Canvas SVG con scroll horizontal en movil */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg 
            viewBox={`0 0 ${ANCHO_TOTAL} ${ALTO_TOTAL}`} 
            className="w-full h-auto overflow-visible select-none"
          >
            {/* 1. Dibujar lineas de cuadricula e indicadores del eje Y */}
            {lineasCuadricula.map((linea, index) => (
              <g key={index} className="opacity-60">
                <line 
                  x1={MARGEN_IZQ} 
                  y1={linea.y} 
                  x2={ANCHO_TOTAL - MARGEN_DER} 
                  y2={linea.y} 
                  stroke="#e2e8f0" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text 
                  x={MARGEN_IZQ - 8} 
                  y={linea.y + 3} 
                  textAnchor="end" 
                  className="text-[10px] font-bold text-olive-400 fill-olive-400"
                >
                  {linea.valor}
                </text>
              </g>
            ))}

            {/* 2. Dibujar las barras y etiquetas del eje X */}
            {listadoDatos.map((item, index) => {
              // Calcular posicion X del centro del mes
              const xCentro = MARGEN_IZQ + (index * anchoSeccion) + (anchoSeccion / 2)
              
              // Altura y posicion Y de la barra de Sanas
              const altoSanas = (item.sanas / maximoValor) * altoGrafico
              const ySanas = MARGEN_SUP + altoGrafico - altoSanas
              const xSanas = xCentro - anchoBarra - 2

              // Altura y posicion Y de la barra de Plagas
              const altoPlagas = (item.plagas / maximoValor) * altoGrafico
              const yPlagas = MARGEN_SUP + altoGrafico - altoPlagas
              const xPlagas = xCentro + 2

              return (
                <g key={index}>
                  {/* Barra de Hojas Sanas */}
                  <rect
                    x={xSanas}
                    y={ySanas}
                    width={anchoBarra}
                    height={Math.max(altoSanas, 2)} // Altura minima de 2px para que se distinga
                    rx="3"
                    className="fill-olive-500 hover:fill-olive-650 transition-all duration-200 cursor-pointer"
                    onMouseEnter={(e) => setObjHoverInfo({
                      x: xSanas + (anchoBarra / 2),
                      y: ySanas,
                      mes: item.mes,
                      tipo: 'Hojas Sanas',
                      cantidad: item.sanas
                    })}
                    onMouseLeave={() => setObjHoverInfo(null)}
                  />

                  {/* Barra de Plagas */}
                  <rect
                    x={xPlagas}
                    y={yPlagas}
                    width={anchoBarra}
                    height={Math.max(altoPlagas, 2)}
                    rx="3"
                    className="fill-amber-600 hover:fill-amber-750 transition-all duration-200 cursor-pointer"
                    onMouseEnter={(e) => setObjHoverInfo({
                      x: xPlagas + (anchoBarra / 2),
                      y: yPlagas,
                      mes: item.mes,
                      tipo: 'Plagas',
                      cantidad: item.plagas
                    })}
                    onMouseLeave={() => setObjHoverInfo(null)}
                  />

                  {/* Etiqueta del mes (Eje X) */}
                  <text
                    x={xCentro}
                    y={ALTO_TOTAL - MARGEN_INF + 18}
                    textAnchor="middle"
                    className="text-[11px] font-semibold text-olive-600 fill-olive-700"
                  >
                    {item.mes}
                  </text>
                </g>
              )
            })}

            {/* Linea base del eje X */}
            <line
              x1={MARGEN_IZQ}
              y1={MARGEN_SUP + altoGrafico}
              x2={ANCHO_TOTAL - MARGEN_DER}
              y2={MARGEN_SUP + altoGrafico}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* 3. Tooltip HTML Flotante dinámico */}
      {objHoverInfo && (
        <div 
          className="absolute z-20 bg-olive-950 text-white p-3 rounded-lg shadow-xl text-xs font-medium space-y-1 pointer-events-none transform -translate-x-1/2 -translate-y-full border border-olive-800 animate-fadeIn"
          style={{
            left: `${(objHoverInfo.x / ANCHO_TOTAL) * 100}%`,
            top: `${(objHoverInfo.y / ALTO_TOTAL) * 100 - 4}%`
          }}
        >
          <span className="block font-bold text-olive-200 border-b border-olive-800 pb-1 mb-1">
            {objHoverInfo.mes}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${objHoverInfo.tipo === 'Hojas Sanas' ? 'bg-olive-500' : 'bg-amber-500'}`} />
            <span>{objHoverInfo.tipo}: <strong className="text-white">{objHoverInfo.cantidad}</strong></span>
          </div>
        </div>
      )}

      {/* Pie descriptivo del grafico */}
      <div className="mt-4 flex gap-2 p-3 bg-olive-50/50 border border-olive-100 rounded-xl text-xs text-olive-750">
        <Info className="w-4 h-4 text-olive-650 flex-shrink-0 mt-0.5" />
        <span>Pasa el cursor sobre cualquiera de las barras para ver la cantidad exacta de análisis correspondientes a ese mes.</span>
      </div>
    </div>
  )
}

export default ClsDashboardGrafico
