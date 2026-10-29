// ============================================================
// ARCHIVO: lib/supabase.js
// MODULO: Base
// DESCRIPCION: Inicializacion del cliente de Supabase para la
//              comunicacion con la base de datos y autenticacion.
// SPRINT: 1
// RF: RF-009, RF-010
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Variables de entorno de Supabase (con fallbacks para evitar fallas durante la compilacion de Next.js)
const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const claveAnonimaSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Validacion de las variables de entorno necesarias para conectar a Supabase
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Advertencia: Las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no estan definidas.')
}

// Instancia del cliente de Supabase para toda la aplicacion
export const supabase = createClient(urlSupabase, claveAnonimaSupabase)
