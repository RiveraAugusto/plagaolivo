// ============================================================
// ARCHIVO: app/api/auth/login/route.js
// DESCRIPCION: Endpoint para el inicio de sesion de usuarios en el
//              servidor, interactuando con Supabase Auth.
// SPRINT: 1
// RF: RF-009
// ============================================================

import { supabase } from '@/lib/supabase'

// Funcion exportada para manejar peticiones POST
export async function POST(request) {
  try {
    // Leer credenciales del cuerpo de la peticion
    const objCredenciales = await request.json()
    const { email, password } = objCredenciales

    // Validar que se hayan recibido los datos requeridos
    if (!email || !password) {
      return Response.json(
        { datos: null, error: 'El correo electronico y la contrasena son obligatorios.' },
        { status: 400 }
      )
    }

    // Ejecutar el inicio de sesion en Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Controlar errores devueltos por Supabase
    if (error) {
      return Response.json(
        { datos: null, error: 'Credenciales invalidas o cuenta no registrada.' },
        { status: 401 }
      )
    }

    // Retornar los datos de sesion en formato JSON estandarizado
    return Response.json({ datos: data, error: null })
  } catch (error) {
    console.error('Error en API Auth Login:', error)
    return Response.json(
      { datos: null, error: 'No se pudo procesar la solicitud de inicio de sesion.' },
      { status: 500 }
    )
  }
}
