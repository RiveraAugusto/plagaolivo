// ============================================================
// ARCHIVO: hooks/useAuth.js
// MODULO: Autenticacion
// DESCRIPCION: Hook personalizado y proveedor de contexto para
//              gestionar la sesion del usuario, el perfil y las
//              operaciones de autenticacion con Supabase Auth.
// SPRINT: 1
// RF: RF-009, RF-010
// ============================================================

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Creacion del contexto de autenticacion
const AuthContext = createContext({})

// Proveedor de autenticacion que envuelve la aplicacion
export function AuthProvider({ children }) {
  // Estado para la sesion del usuario de Supabase Auth
  const [objUsuario, setObjUsuario] = useState(null)
  
  // Estado para el perfil adicional del usuario en la tabla publica usuarios
  const [objPerfil, setObjPerfil] = useState(null)
  
  // Estado para indicar si hay un proceso de carga en curso (inicializacion o peticiones)
  const [cargando, setCargando] = useState(true)
  
  // Estado para almacenar y propagar mensajes de error amigables
  const [errorAuth, setErrorAuth] = useState(null)

  // Efecto para escuchar los cambios en el estado de autenticacion de Supabase
  useEffect(() => {
    // Verificar sesion activa al cargar la aplicacion
    async function inicializarSesion() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setObjUsuario(session.user)
          // Obtenemos el perfil en segundo plano para no bloquear el renderizado inicial de la aplicacion
          obtenerPerfil(session.user.id)
        } else {
          setObjUsuario(null)
          setObjPerfil(null)
        }
      } catch (error) {
        console.error('Error al inicializar la sesion:', error)
      } finally {
        setCargando(false)
      }
    }

    inicializarSesion()

    // Suscribirse a cambios del estado de autenticacion (signin, signout, token refrescado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (evento, session) => {
        // Evitamos llamar a setCargando(true) en eventos de fondo para impedir parpadeos de UI
        // y bucles infinitos de renderizado al refrescar tokens.
        if (session?.user) {
          // Solo actualizamos el estado si el ID del usuario cambio, rompiendo la referencia ciclica
          setObjUsuario(prevUser => {
            if (prevUser?.id === session.user.id) {
              return prevUser
            }
            return session.user
          })
          // Solicitamos el perfil en segundo plano de manera no bloqueante
          obtenerPerfil(session.user.id)
        } else {
          setObjUsuario(null)
          setObjPerfil(null)
        }
        setCargando(false)
      }
    )

    // Limpiar suscripcion al desmontar el componente
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Funcion interna para obtener los datos de perfil desde la base de datos publica
  // Recibe el identificador unico del usuario (uuid)
  async function obtenerPerfil(userId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si el perfil aun no existe (p. ej., retraso del trigger), reintentamos despues
        console.warn('Perfil no encontrado, es posible que el trigger este en proceso:', error.message)
        setObjPerfil(null)
      } else {
        // Evitamos re-renders si el contenido del perfil no ha cambiado en absoluto
        setObjPerfil(prevPerfil => {
          if (
            prevPerfil?.id === data.id &&
            prevPerfil?.nombre === data.nombre &&
            prevPerfil?.foto_url === data.foto_url &&
            prevPerfil?.zona_geografica === data.zona_geografica &&
            prevPerfil?.rol === data.rol
          ) {
            return prevPerfil
          }
          return data
        })
      }
    } catch (error) {
      console.error('Error de red al obtener perfil:', error)
    }
  }

  // Funcion para iniciar sesion con correo y contraseña
  async function iniciarSesion(email, contrasena) {
    setCargando(true)
    setErrorAuth(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: contrasena,
      })

      if (error) {
        const errorMsgLower = (error.message || '').toLowerCase()

        // Detectar si el usuario no ha confirmado su correo electronico
        if (errorMsgLower.includes('email not confirmed') || errorMsgLower.includes('email_not_confirmed')) {
          throw new Error('Debes confirmar tu correo electronico antes de iniciar sesion. Por favor, revisa tu bandeja de entrada o tu carpeta de correo no deseado (spam).')
        }

        // Traducir codigos de error comunes de Supabase a mensajes amigables
        if (error.status === 400 || errorMsgLower.includes('invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifique su correo o contrasena.')
        } else if (errorMsgLower.includes('failed to fetch') || errorMsgLower.includes('network')) {
          throw new Error('No se pudo conectar con el servidor de autenticacion. Verifique su conexion a internet o la configuracion de Supabase.')
        } else {
          throw new Error(error.message || 'No se pudo iniciar sesion. Intente nuevamente mas tarde.')
        }
      }
      return data
    } catch (error) {
      console.error('Error al iniciar sesion:', error)
      setErrorAuth(error.message)
      throw error
    } finally {
      setCargando(false)
    }
  }

  // Funcion para registrar un nuevo usuario con correo, contraseña, nombre y zona
  async function registrarse(email, contrasena, nombre, zonaGeografica) {
    setCargando(true)
    setErrorAuth(null)
    try {
      // Redirigir dinamicamente a la URL de origen activa (sea Vercel produccion o rama desarrollo)
      const urlRedireccion = typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : undefined

      const { data, error } = await supabase.auth.signUp({
        email,
        password: contrasena,
        options: {
          emailRedirectTo: urlRedireccion,
          data: {
            nombre,
            zona_geografica: zonaGeografica,
          },
        },
      })

      if (error) {
        const errorMsgLower = (error.message || '').toLowerCase()
        if (errorMsgLower.includes('already registered')) {
          throw new Error('El correo electronico ya esta registrado.')
        } else if (errorMsgLower.includes('password should be') || errorMsgLower.includes('weak password')) {
          throw new Error('La contrasena no cumple con los requisitos minimos de seguridad (debe tener al menos 6 caracteres).')
        } else if (errorMsgLower.includes('rate limit') || errorMsgLower.includes('over_email_send_rate_limit')) {
          throw new Error('Se ha superado el limite de envio de correos. Por favor espere unos minutos antes de intentar de nuevo.')
        } else if (errorMsgLower.includes('failed to fetch') || errorMsgLower.includes('network')) {
          throw new Error('No se pudo conectar con el servidor de Supabase. Verifique las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en su archivo .env.local.')
        } else {
          // Mostrar el error real devuelto por Supabase para diagnostico preciso
          throw new Error(error.message || 'No se pudo completar el registro. Intente de nuevo.')
        }
      }

      // Validacion de seguridad de Supabase: si el usuario ya existe y las confirmaciones estan activas,
      // identities viene como arreglo vacio [] en vez de retornar un error explícito.
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('El correo electronico ya se encuentra registrado. Si no recuerda su contrasena, use la opcion de recuperarla.')
      }

      return data
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      setErrorAuth(error.message)
      throw error
    } finally {
      setCargando(false)
    }
  }

  // Funcion para cerrar la sesion actual del usuario
  async function cerrarSesion() {
    setCargando(true)
    setErrorAuth(null)
    try {
      // Disparamos signOut de forma asincrona sin await. Si el URL es placeholder
      // o la conexion es lenta, esto fallara en segundo plano pero no bloqueara
      // el flujo de salida del usuario en la aplicacion.
      supabase.auth.signOut().catch(error => {
        console.warn('Advertencia al cerrar sesion en Supabase:', error.message)
      })
    } catch (error) {
      console.error('Error de red/servidor al cerrar sesion:', error)
    } finally {
      // Siempre limpiamos de inmediato los estados locales para garantizar que la
      // interfaz de usuario responda al instante y redirija.
      setObjUsuario(null)
      setObjPerfil(null)
      setCargando(false)
    }
  }

  // Funcion para actualizar los datos del perfil (nombre, zona geografica)
  async function actualizarPerfil(nombre, zonaGeografica) {
    if (!objUsuario) throw new Error('No hay una sesion activa de usuario.')
    
    setCargando(true)
    setErrorAuth(null)
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nombre,
          zona_geografica: zonaGeografica,
        })
        .eq('id', objUsuario.id)
        .select()
        .single()

      if (error) throw new Error('No se pudo guardar la informacion del perfil.')
      
      setObjPerfil(data)
      return data
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      setErrorAuth(error.message)
      throw error
    } finally {
      setCargando(false)
    }
  }

  // Funcion para cambiar la contraseña de la cuenta activa
  async function cambiarContrasena(nuevaContrasena) {
    setCargando(true)
    setErrorAuth(null)
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena,
      })

      if (error) throw new Error('No se pudo actualizar la contrasena. Intente nuevamente.')
    } catch (error) {
      console.error('Error al cambiar contrasena:', error)
      setErrorAuth(error.message)
      throw error
    } finally {
      setCargando(false)
    }
  }

  // Funcion para enviar correo de restablecimiento de contraseña
  async function recuperarContrasena(email) {
    setCargando(true)
    setErrorAuth(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?recovery=true`,
      })

      if (error) throw new Error('No se pudo enviar el correo de restablecimiento.')
    } catch (error) {
      console.error('Error al enviar recuperacion:', error)
      setErrorAuth(error.message)
      throw error
    } finally {
      setCargando(false)
    }
  }

  // Retorno del proveedor de contexto con los estados y metodos expuestos
  return (
    <AuthContext.Provider
      value={{
        objUsuario,
        objPerfil,
        cargando,
        errorAuth,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        actualizarPerfil,
        cambiarContrasena,
        recuperarContrasena,
        obtenerPerfil: () => obtenerPerfil(objUsuario?.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook de acceso directo al contexto de autenticacion
export function useAuth() {
  return useContext(AuthContext)
}
