// ============================================================
// ARCHIVO: app/login/page.jsx
// MODULO: Autenticacion
// DESCRIPCION: Interfaz unificada de inicio de sesion, registro y
//              recuperacion de contrasena de OlivoScan.
// SPRINT: 1
// RF: RF-009, RF-010
// ============================================================

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Sprout, Mail, Lock, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

function ClsLoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { objUsuario, iniciarSesion, registrarse, recuperarContrasena } = useAuth()

  // Estados locales para los campos del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [zonaGeografica, setZonaGeografica] = useState('')

  // Estado para la pestaña activa: 'login', 'registro', 'recuperar'
  const [pestanaActiva, setPestanaActiva] = useState('login')

  // Estados locales para la visualización de mensajes
  const [mensajeError, setMensajeError] = useState(null)
  const [mensajeExito, setMensajeExito] = useState(null)
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState(null)
  const [estaCargando, setEstaCargando] = useState(false)

  // Redireccionar al dashboard si el usuario ya esta autenticado
  useEffect(() => {
    if (objUsuario) {
      router.push('/dashboard')
    }
  }, [objUsuario, router])

  // Leer parametros de URL para establecer el estado inicial
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const recoveryParam = searchParams.get('recovery')

    if (tabParam === 'registro') {
      setPestanaActiva('registro')
    } else if (recoveryParam === 'true') {
      setMensajeExito('Enlace de restablecimiento de contrasena verificado. Ahora puede actualizar su contrasena en su perfil.')
      setPestanaActiva('login')
    }
  }, [searchParams])

  // Limpiar mensajes al cambiar de pestaña
  function cambiarPestana(nuevaPestana) {
    setPestanaActiva(nuevaPestana)
    setMensajeError(null)
    setMensajeExito(null)
    setMensajeConfirmacion(null)
    // Limpiar campos para evitar mezclar informacion
    setContrasena('')
  }

  // Enviar formulario de inicio de sesión
  async function manejarInicioSesion(evento) {
    evento.preventDefault()
    setMensajeError(null)
    setMensajeExito(null)
    setMensajeConfirmacion(null)

    if (!email || !contrasena) {
      setMensajeError('Por favor complete todos los campos.')
      return
    }

    setEstaCargando(true)
    try {
      await iniciarSesion(email, contrasena)
      // La redireccion se maneja en el useEffect al detectar el objUsuario
    } catch (error) {
      setMensajeError(error.message || 'No se pudo iniciar sesion. Compruebe sus credenciales.')
    } finally {
      setEstaCargando(false)
    }
  }

  // Enviar formulario de registro de usuario
  async function manejarRegistro(evento) {
    evento.preventDefault()
    setMensajeError(null)
    setMensajeExito(null)
    setMensajeConfirmacion(null)

    if (!nombre || !email || !contrasena) {
      setMensajeError('El nombre, correo y contrasena son obligatorios.')
      return
    }

    if (contrasena.length < 6) {
      setMensajeError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    setEstaCargando(true)
    try {
      const data = await registrarse(email, contrasena, nombre, zonaGeografica)

      // Si Supabase devuelve sesión activa (confirmación de email desactivada)
      if (data?.session) {
        setMensajeExito('¡Cuenta registrada con éxito! Ingresando a la plataforma...')
        router.push('/dashboard')
      } else {
        // Si Supabase requiere confirmación de email (data.session es null)
        setMensajeConfirmacion({
          email: email,
        })
        setPestanaActiva('login')
      }

      // Limpiar campos del formulario
      setContrasena('')
      setNombre('')
      setZonaGeografica('')
    } catch (error) {
      setMensajeError(error.message || 'No se pudo completar el registro.')
    } finally {
      setEstaCargando(false)
    }
  }

  // Enviar formulario de recuperación de contraseña
  async function manejarRecuperacion(evento) {
    evento.preventDefault()
    setMensajeError(null)
    setMensajeExito(null)
    setMensajeConfirmacion(null)

    if (!email) {
      setMensajeError('Por favor ingrese su correo electronico.')
      return
    }

    setEstaCargando(true)
    try {
      await recuperarContrasena(email)
      setMensajeExito('Se ha enviado un correo con instrucciones para restablecer su contrasena.')
    } catch (error) {
      setMensajeError(error.message || 'No se pudo enviar el correo de recuperacion.')
    } finally {
      setEstaCargando(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-olive-50 via-white to-olive-100/50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-glass border border-olive-100">
        
        {/* Encabezado e Isotipo de la Plataforma */}
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-xl bg-olive-500 text-white shadow-md hover:scale-105 transition-transform duration-200">
            <Sprout className="w-7 h-7" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-olive-950">
            {pestanaActiva === 'login' && 'Iniciar Sesión'}
            {pestanaActiva === 'registro' && 'Crear Cuenta'}
            {pestanaActiva === 'recuperar' && 'Recuperar Contraseña'}
          </h2>
          <p className="mt-2 text-center text-sm text-olive-700">
            {pestanaActiva === 'login' && 'Acceda al panel de control de sus cultivos'}
            {pestanaActiva === 'registro' && 'Comience a monitorear la salud de sus olivos'}
            {pestanaActiva === 'recuperar' && 'Le enviaremos un enlace para restaurar el acceso'}
          </p>
        </div>

        {/* Mensajes de Alerta y Notificaciones */}
        {mensajeError && (
          <div className="flex items-start gap-2.5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-snug">{mensajeError}</p>
          </div>
        )}

        {mensajeConfirmacion && (
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-950 text-sm space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <Mail className="w-5 h-5 text-amber-700 shrink-0" />
              <span>¡Registro exitoso! Confirma tu correo</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Hemos enviado un enlace de confirmación a <strong className="font-semibold underline decoration-amber-400">{mensajeConfirmacion.email}</strong>. Por favor, ingresa a tu bandeja de entrada y confirma tu cuenta antes de iniciar sesión.
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-100/70 px-2.5 py-1.5 rounded-md">
              💡 <strong>Importante:</strong> Si no encuentras el mensaje en unos minutos, revisa tu carpeta de <strong>correo no deseado (spam)</strong>.
            </p>
          </div>
        )}

        {mensajeExito && !mensajeConfirmacion && (
          <div className="flex items-start gap-2.5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="leading-snug">{mensajeExito}</p>
          </div>
        )}

        {/* Secciones de los Formularios */}
        {pestanaActiva === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={manejarInicioSesion}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-olive-800 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={estaCargando}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-contrasena" className="block text-sm font-medium text-olive-800">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => cambiarPestana('recuperar')}
                    className="text-xs font-semibold text-olive-600 hover:text-olive-700 transition-colors"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    id="login-contrasena"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={estaCargando}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="Ingrese su contraseña"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={estaCargando}
                className="group relative flex justify-center w-full px-4 py-3 bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {estaCargando ? 'Iniciando sesión...' : 'Ingresar'}
              </button>
            </div>

            <div className="text-center text-sm text-olive-700">
              ¿No tiene una cuenta?{' '}
              <button
                type="button"
                onClick={() => cambiarPestana('registro')}
                className="font-semibold text-olive-600 hover:text-olive-700 transition-colors"
              >
                Regístrese aquí
              </button>
            </div>
          </form>
        )}

        {pestanaActiva === 'registro' && (
          <form className="mt-8 space-y-5" onSubmit={manejarRegistro}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="reg-nombre" className="block text-sm font-medium text-olive-800 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    id="reg-nombre"
                    name="nombre"
                    type="text"
                    required
                    disabled={estaCargando}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-olive-800 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={estaCargando}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-contrasena" className="block text-sm font-medium text-olive-800 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    id="reg-contrasena"
                    name="password"
                    type="password"
                    required
                    disabled={estaCargando}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-zona" className="block text-sm font-medium text-olive-800 mb-1">
                  Zona Geográfica
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <input
                    id="reg-zona"
                    name="zona"
                    type="text"
                    disabled={estaCargando}
                    value={zonaGeografica}
                    onChange={(e) => setZonaGeografica(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="Ej. Jaén, Andalucía"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={estaCargando}
                className="group relative flex justify-center w-full px-4 py-3 bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {estaCargando ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </div>

            <div className="text-center text-sm text-olive-700">
              ¿Ya tiene una cuenta?{' '}
              <button
                type="button"
                onClick={() => cambiarPestana('login')}
                className="font-semibold text-olive-600 hover:text-olive-700 transition-colors"
              >
                Inicie sesión aquí
              </button>
            </div>
          </form>
        )}

        {pestanaActiva === 'recuperar' && (
          <form className="mt-8 space-y-6" onSubmit={manejarRecuperacion}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="rec-email" className="block text-sm font-medium text-olive-800 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-olive-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    id="rec-email"
                    name="email"
                    type="email"
                    required
                    disabled={estaCargando}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-olive-50/50 border border-olive-200 rounded-lg text-sm text-olive-950 placeholder-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500 disabled:opacity-60 transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={estaCargando}
                className="group relative flex justify-center w-full px-4 py-3 bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {estaCargando ? 'Enviando correo...' : 'Restablecer Contraseña'}
              </button>
            </div>

            <div className="text-center text-sm text-olive-700">
              ¿Recordó su contraseña?{' '}
              <button
                type="button"
                onClick={() => cambiarPestana('login')}
                className="font-semibold text-olive-600 hover:text-olive-700 transition-colors"
              >
                Regresar al ingreso
              </button>
            </div>
          </form>
        )}

        {/* Enlace para volver a la pagina de inicio */}
        <div className="pt-4 border-t border-olive-100 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-olive-600 hover:text-olive-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span>&larr; Volver a la página de inicio</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

function ClsLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-olive-50 via-white to-olive-100/50">
        <Sprout className="w-12 h-12 text-olive-500 animate-bounce" />
        <p className="mt-4 text-sm font-medium text-olive-700">Cargando formulario...</p>
      </div>
    }>
      <ClsLoginPageContent />
    </Suspense>
  )
}

export default ClsLoginPage
