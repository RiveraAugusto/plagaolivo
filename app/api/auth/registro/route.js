// ============================================================
// ARCHIVO: app/api/auth/registro/route.js
// DESCRIPCION: Endpoint para el registro de nuevos usuarios en el
//              servidor, utilizando Supabase Auth y pasando metadatos.
// SPRINT: 1
// RF: RF-009
// ============================================================

import { supabase } from '@/lib/supabase'

// Funcion exportada para manejar peticiones POST
export async function POST(request) {
  try {
    // Obtener datos de registro del cuerpo de la peticion
    const objRegistro = await request.json()
    const { email, password, nombre, zonaGeografica } = objRegistro

    // Validar campos obligatorios
    if (!email || !password || !nombre) {
      return Response.json(
        { datos: null, error: 'El nombre, correo electronico y contrasena son obligatorios.' },
        { status: 400 }
      )
    }

    // Ejecutar el registro en Supabase Auth pasándole los datos de perfil como metadatos
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          zona_geografica: zonaGeografica || '',
        },
      },
    })

    // Controlar errores devueltos por Supabase
    if (error) {
      const errorMsgLower = (error.message || '').toLowerCase()
      if (errorMsgLower.includes('already registered')) {
        return Response.json(
          { datos: null, error: 'El correo electronico ingresado ya se encuentra registrado.' },
          { status: 400 }
        )
      }
      return Response.json(
        { datos: null, error: error.message || 'Ocurrio un problema al registrar la cuenta. Verifique los datos.' },
        { status: 400 }
      )
    }

    // Validar si el usuario ya existe (identities vacio por proteccion anti-enumeracion de Supabase)
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return Response.json(
        { datos: null, error: 'El correo electronico ingresado ya se encuentra registrado.' },
        { status: 400 }
      )
    }

    // Retornar la informacion de registro en formato JSON estandarizado
    return Response.json({ datos: data, error: null })
  } catch (error) {
    console.error('Error en API Auth Registro:', error)
    return Response.json(
      { datos: null, error: 'No se pudo procesar la solicitud de registro.' },
      { status: 500 }
    )
  }
}
