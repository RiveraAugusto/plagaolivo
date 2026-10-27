// ============================================================
// ARCHIVO: app/api/dashboard/route.js
// MODULO: Dashboard
// DESCRIPCION: Endpoint GET para obtener las estadisticas y resumenes
//              de analisis del usuario autenticado para el dashboard.
// SPRINT: 4
// RF: RF-008
// ============================================================

import { createClient } from '@supabase/supabase-js'

// GET /api/dashboard
// Retorna metricas clave, listado mensual de frecuencia y top de plagas del usuario activo.
export async function GET(request) {
  try {
    // 1. Validar autenticacion mediante Token Bearer
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { datos: null, error: 'No autorizado. Se requiere token Bearer.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
    const claveAnonimaSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Inicializar cliente Supabase temporal respetando RLS
    const userSupabase = createClient(urlSupabase, claveAnonimaSupabase, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Validar token y obtener informacion del usuario activo
    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { datos: null, error: 'Token invalido o sesion expirada.' },
        { status: 401 }
      )
    }

    // 2. Consultar todos los analisis del usuario para realizar los calculos agregados en memoria
    const { data: objAnalisisLista, error: dbError } = await userSupabase
      .from('analisis')
      .select('*')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false })

    if (dbError) {
      console.error('Error al obtener analisis para dashboard:', dbError)
      return Response.json(
        { datos: null, error: 'Error al recuperar datos del dashboard.' },
        { status: 500 }
      )
    }

    // 3. Inicializar metricas base
    const totalAnalisis = objAnalisisLista.length
    let alertasActivas = 0
    let cultivosInfectados = 0
    const ultimoAnalisis = totalAnalisis > 0 ? objAnalisisLista[0] : null

    // Mapeo para contar frecuencias de cada plaga
    const conteoPlagas = {}

    // Mapeo para agrupacion mensual de los ultimos 6 meses
    const conteoMensual = {}
    
    // Obtener los ultimos 6 meses ordenados cronologicamente para el grafico
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const ultimosMesesKeys = []
    
    for (let i = 5; i >= 0; i--) {
      const fechaBase = new Date()
      fechaBase.setMonth(fechaBase.getMonth() - i)
      const mesNum = fechaBase.getMonth()
      const anioNum = fechaBase.getFullYear()
      const claveMes = `${nombresMeses[mesNum]} ${anioNum}`
      
      ultimosMesesKeys.push(claveMes)
      conteoMensual[claveMes] = { mes: claveMes, sanas: 0, plagas: 0 }
    }

    // 4. Recorrer los analisis para acumular estadisticas
    objAnalisisLista.forEach((objAnalisis) => {
      const esSana = objAnalisis.plaga_detectada === 'Hoja Sana' || objAnalisis.plaga_corregida === 'Hoja Sana'
      const plagaNombre = objAnalisis.plaga_corregida || objAnalisis.plaga_detectada

      // Contar alertas activas (severidad grave)
      if (objAnalisis.severidad === 'grave') {
        alertasActivas++
      }

      // Contar cultivos infectados: plagas con severidad moderada o grave detectadas en los ultimos 30 dias
      const diasDiferencia = (new Date() - new Date(objAnalisis.creado_en)) / (1000 * 60 * 60 * 24)
      if (!esSana && (objAnalisis.severidad === 'grave' || objAnalisis.severidad === 'moderado') && diasDiferencia <= 30) {
        cultivosInfectados++
      }

      // Acumular conteo de plagas (excluyendo Hoja Sana) para el top del dashboard
      if (!esSana) {
        conteoPlagas[plagaNombre] = (conteoPlagas[plagaNombre] || 0) + 1
      }

      // Agrupar frecuencias por mes para el grafico (solo de los ultimos 6 meses mapeados)
      const fechaAnalisis = new Date(objAnalisis.creado_en)
      const claveMesAnalisis = `${nombresMeses[fechaAnalisis.getMonth()]} ${fechaAnalisis.getFullYear()}`
      
      if (conteoMensual[claveMesAnalisis]) {
        if (esSana) {
          conteoMensual[claveMesAnalisis].sanas++
        } else {
          conteoMensual[claveMesAnalisis].plagas++
        }
      }
    })

    // Transformar agrupacion mensual en array ordenado cronologicamente para el grafico
    const datosGrafico = ultimosMesesKeys.map(key => conteoMensual[key])

    // Transformar top de plagas en un array ordenado de mayor a menor frecuencia
    const plagasMasFrecuentes = Object.entries(conteoPlagas)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5) // limitar a las 5 mas comunes

    // 5. Retornar respuesta consolidada
    return Response.json({
      datos: {
        totalAnalisis,
        alertasActivas,
        cultivosInfectados,
        ultimoAnalisis,
        datosGrafico,
        plagasMasFrecuentes,
      },
      error: null
    })

  } catch (error) {
    console.error('Error critico en GET /api/dashboard:', error)
    return Response.json(
      { datos: null, error: 'Ocurrio un error inesperado al procesar las estadisticas del dashboard.' },
      { status: 500 }
    )
  }
}
