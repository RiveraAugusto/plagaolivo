// ============================================================
// ARCHIVO: app/page.jsx
// MODULO: Inicio
// DESCRIPCION: Pagina de inicio publica (landing page) de OlivoScan.
//              Presenta las ventajas del sistema y accesos rapidos.
// SPRINT: 1
// RF: RF-009
// ============================================================

'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Sprout, ShieldAlert, Cpu, History, ArrowRight, Activity, Award, CheckCircle } from 'lucide-react'

function ClsInicioPage() {
  const { objUsuario } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100/30">
      
      {/* 1. Seccion Hero (Presentacion Principal) */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Adorno decorativo de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-olive-300/20 rounded-full blur-3xl -z-10" />

        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold mb-6 border border-olive-200">
          <Activity className="w-3.5 h-3.5 text-olive-600" />
          <span>Monitoreo Inteligente para el Olivar</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-olive-950 tracking-tight max-w-3xl leading-[1.15]">
          Detección temprana de plagas con{' '}
          <span className="bg-gradient-to-r from-olive-600 to-earth-500 bg-clip-text text-transparent">
            Inteligencia Artificial
          </span>
        </h1>
        
        <p className="mt-6 text-lg text-olive-800 max-w-2xl leading-relaxed">
          Optimice la salud de sus olivos. Suba una fotografia de la hoja, obtenga diagnosticos precisos en segundos y reciba recomendaciones de tratamientos fitosanitarios personalizados.
        </p>

        {/* Botones de accion principal */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {objUsuario ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 bg-olive-500 hover:bg-olive-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <span>Ir al Panel de Control</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/login?tab=registro"
                className="flex items-center gap-2 px-6 py-3.5 bg-olive-500 hover:bg-olive-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all group"
              >
                <span>Comenzar Ahora Gratis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 bg-white text-olive-700 font-semibold rounded-xl shadow-sm border border-olive-200 hover:bg-olive-50 hover:text-olive-900 transition-all"
              >
                Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. Seccion de Estadisticas Destacadas */}
      <section className="bg-white/60 border-y border-olive-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center justify-center p-6 text-center border-b md:border-b-0 md:border-r border-olive-100 last:border-0">
            <span className="text-4xl sm:text-5xl font-black text-olive-600">87.3%</span>
            <span className="mt-2 text-sm font-semibold text-olive-900">Confianza Promedio del Modelo</span>
            <span className="mt-1 text-xs text-olive-500">Evaluado con dataset de plagas comunes</span>
          </div>
          <div className="flex flex-col items-center justify-center p-6 text-center border-b md:border-b-0 md:border-r border-olive-100 last:border-0">
            <span className="text-4xl sm:text-5xl font-black text-olive-600">&lt; 3s</span>
            <span className="mt-2 text-sm font-semibold text-olive-900">Tiempo de Diagnóstico</span>
            <span className="mt-1 text-xs text-olive-500">Analisis inmediato en el campo</span>
          </div>
          <div className="flex flex-col items-center justify-center p-6 text-center last:border-0">
            <span className="text-4xl sm:text-5xl font-black text-olive-600">100%</span>
            <span className="mt-2 text-sm font-semibold text-olive-900">Tratamiento Recomendado</span>
            <span className="mt-1 text-xs text-olive-500">Sugerencias fitosanitarias organicas y quimicas</span>
          </div>
        </div>
      </section>

      {/* 3. Seccion de Caracteristicas Clave */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-olive-950">
            Tecnología agrícola de precisión al alcance de su mano
          </h2>
          <p className="mt-4 text-olive-700">
            Desarrollado especificamente para agricultores y agronomos que buscan optimizar su rendimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tarjeta 1: Analisis por Imagen */}
          <div className="bg-white p-8 rounded-2xl shadow-glass border border-olive-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
            <div className="w-12 h-12 rounded-xl bg-olive-100 flex items-center justify-center text-olive-600 mb-6 border border-olive-200">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-olive-950 mb-3">
              Visión Computacional
            </h3>
            <p className="text-sm text-olive-700 leading-relaxed">
              Integra un modelo de redes neuronales convolucionales optimizado para identificar la Mosca del olivo, Cochinilla, Prays y mas, directamente a partir de fotografias.
            </p>
          </div>

          {/* Tarjeta 2: Recomendaciones IA */}
          <div className="bg-white p-8 rounded-2xl shadow-glass border border-olive-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
            <div className="w-12 h-12 rounded-xl bg-olive-100 flex items-center justify-center text-olive-600 mb-6 border border-olive-200">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-olive-950 mb-3">
              Tratamientos con IA Generativa
            </h3>
            <p className="text-sm text-olive-700 leading-relaxed">
              Generacion automatica de sugerencias fitosanitarias personalizadas segun la gravedad de la plaga, con alternativas ecologicas y quimicas.
            </p>
          </div>

          {/* Tarjeta 3: Historial y Evolucion */}
          <div className="bg-white p-8 rounded-2xl shadow-glass border border-olive-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-350">
            <div className="w-12 h-12 rounded-xl bg-olive-100 flex items-center justify-center text-olive-600 mb-6 border border-olive-200">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-olive-950 mb-3">
              Historial de Monitoreo
            </h3>
            <p className="text-sm text-olive-700 leading-relaxed">
              Conserve un registro completo de sus diagnosticos. Compare analisis anteriores para supervisar la evolucion de la planta y la efectividad de las medidas aplicadas.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Seccion de CTA Final */}
      <section className="bg-olive-800 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Adorno decorativo de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-olive-600/35 rounded-full blur-3xl -z-0" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-gold-400 mb-4 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Proteja su olivar de forma proactiva
          </h2>
          <p className="mt-4 text-olive-200 max-w-xl text-sm sm:text-base leading-relaxed">
            Obtenga alertas estacionales e identifique amenazas antes de que afecten la calidad de su aceite. Cree su cuenta hoy.
          </p>
          <div className="mt-8">
            <Link
              href={objUsuario ? "/dashboard" : "/login?tab=registro"}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold-500 hover:bg-gold-600 text-olive-950 font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <span>{objUsuario ? 'Acceder al Panel' : 'Registrarse Gratis'}</span>
              <CheckCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default ClsInicioPage
