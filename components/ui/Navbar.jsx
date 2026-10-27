// ============================================================
// ARCHIVO: components/ui/Navbar.jsx
// MODULO: UI
// DESCRIPCION: Barra de navegacion principal de la plataforma.
//              Muestra accesos rapidos y la sesion del usuario.
// SPRINT: 1
// RF: RF-009, RF-010
// ============================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Sprout, User, LogOut, History, LayoutDashboard, BookOpen, Menu, X, Bell, AlertTriangle, Activity } from 'lucide-react'

function ClsNavbar() {
  const { objUsuario, objPerfil, cerrarSesion } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  // Estado para el menu desplegable en dispositivos moviles
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState([])
  const [dropdownNotifAbierto, setDropdownNotifAbierto] = useState(false)
  const dropdownRefDesktop = useRef(null)
  const dropdownRefMobile = useRef(null)

  // Estado local para el modal de confirmacion de salida de sesion
  const [mostrarConfirmarSalir, setMostrarConfirmarSalir] = useState(false)

  const unreadCount = notificaciones.filter(n => !n.leida).length

  // Obtener notificaciones desde la API
  async function cargarNotificaciones() {
    if (!objUsuario) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/notificaciones', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const data = await res.json()
      if (data.datos) {
        setNotificaciones(data.datos)
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }

  // Marcar una notificacion como leida
  async function marcarLeida(id) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.datos) {
        // Actualizar en el estado local
        setNotificaciones(prev => 
          prev.map(n => n.id === id ? { ...n, leida: true } : n)
        )
      }
    } catch (error) {
      console.error('Error al marcar leida:', error)
    }
  }

  // Marcar todas como leidas
  async function marcarTodasLeidas() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ marcarTodas: true })
      })
      const data = await res.json()
      if (data.datos) {
        setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      }
    } catch (error) {
      console.error('Error al marcar todas leidas:', error)
    }
  }

  // Escuchar clicks externos para cerrar el dropdown de notificaciones
  useEffect(() => {
    function manejarClickAfuera(evento) {
      const clickEnDesktop = dropdownRefDesktop.current && dropdownRefDesktop.current.contains(evento.target)
      const clickEnMobile = dropdownRefMobile.current && dropdownRefMobile.current.contains(evento.target)
      
      if (!clickEnDesktop && !clickEnMobile) {
        setDropdownNotifAbierto(false)
      }
    }
    document.addEventListener('mousedown', manejarClickAfuera)
    return () => {
      document.removeEventListener('mousedown', manejarClickAfuera)
    }
  }, [])

  useEffect(() => {
    if (objUsuario) {
      cargarNotificaciones()
      // Recargar notificaciones cada 30 segundos
      const interval = setInterval(cargarNotificaciones, 30000)
      return () => clearInterval(interval)
    } else {
      setNotificaciones([])
    }
  }, [objUsuario])

  // Ocultar la barra de navegacion en la pantalla de login para tener un diseno mas inmersivo
  if (pathname === '/login') {
    return null
  }

  // Funcion para gestionar el cierre de sesion y redireccion
  async function manejarCierreSesion() {
    try {
      await cerrarSesion()
      setMenuMovilAbierto(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesion desde la barra de navegacion:', error)
    }
  }

  // Enlaces de navegacion principales del sistema
  const enlacesNavegacion = [
    { nombre: 'Dashboard', ruta: '/dashboard', icono: LayoutDashboard },
    { nombre: 'Análisis', ruta: '/analisis', icono: Sprout },
    { nombre: 'Comparar', ruta: '/comparar', icono: Activity },
    { nombre: 'Historial', ruta: '/historial', icono: History },
    { nombre: 'Catálogo', ruta: '/catalogo', icono: BookOpen },
  ]

  // Renderizador del contenido interno de notificaciones
  function renderContenidoDropdown() {
    return (
      <div className="w-full flex flex-col max-h-96">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-olive-100 bg-olive-50/20">
          <span className="text-xs font-bold text-olive-950 uppercase tracking-wider">Notificaciones</span>
          {unreadCount > 0 && (
            <button
              onClick={marcarTodasLeidas}
              className="text-[10px] font-bold text-olive-600 hover:text-olive-800 transition-colors uppercase tracking-wider"
            >
              Marcar todo leido
            </button>
          )}
        </div>
        <div className="overflow-y-auto divide-y divide-olive-50 flex-1">
          {notificaciones.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-olive-400 font-medium">
              No tienes notificaciones
            </div>
          ) : (
            notificaciones.map((notif) => {
              const esAlerta = notif.tipo === 'alerta'
              const fecha = new Date(notif.creado_en)
              const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.leida) {
                      marcarLeida(notif.id)
                    }
                    setDropdownNotifAbierto(false)
                    router.push('/historial')
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-olive-50/50 transition-colors cursor-pointer text-left ${
                    !notif.leida ? 'bg-olive-50/15 font-semibold' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {esAlerta ? (
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100/50">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-50 text-green-650 border border-green-100/40">
                        <Sprout className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-xs text-olive-850 leading-relaxed break-words">
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[9px] text-olive-400 font-medium">
                        {fechaFormateada}
                      </span>
                      {!notif.leida && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-olive-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Lado izquierdo: Logotipo y enlaces para pantallas grandes */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-olive-600 font-bold text-xl hover:opacity-90">
              <Sprout className="w-6 h-6 text-olive-500" />
              <span>OlivoScan</span>
            </Link>
 
            {/* Enlaces de navegacion (solo si el usuario esta autenticado) */}
            {objUsuario && (
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {enlacesNavegacion.map((enlace) => {
                  const Icono = enlace.icono
                  const activo = pathname === enlace.ruta
                  return (
                    <Link
                      key={enlace.ruta}
                      href={enlace.ruta}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        activo
                          ? 'bg-olive-500 text-white shadow-sm'
                          : 'text-olive-700 hover:bg-olive-100 hover:text-olive-900'
                      }`}
                    >
                      <Icono className="w-4 h-4" />
                      <span>{enlace.nombre}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
 
          {/* Lado derecho: Acciones de usuario / Login */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {objUsuario ? (
              <div className="flex items-center gap-3">
                {/* Campana de Notificaciones */}
                <div className="relative" ref={dropdownRefDesktop}>
                  <button
                    onClick={() => setDropdownNotifAbierto(!dropdownNotifAbierto)}
                    className={`p-2 text-olive-750 hover:bg-olive-50 hover:text-olive-950 rounded-full relative transition-all cursor-pointer ${
                      dropdownNotifAbierto ? 'bg-olive-50 text-olive-950' : ''
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Dropdown de Notificaciones */}
                  {dropdownNotifAbierto && (
                    <div className="absolute right-0 mt-2.5 w-80 bg-white border border-olive-150 rounded-xl shadow-lg py-1 z-50 animate-fadeIn">
                      {renderContenidoDropdown()}
                    </div>
                  )}
                </div>

                <Link
                  href="/perfil"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    pathname === '/perfil'
                      ? 'bg-olive-100 text-olive-900'
                      : 'text-olive-700 hover:bg-olive-50 hover:text-olive-900'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-olive-200 text-olive-700 font-semibold border border-olive-300">
                    {objPerfil?.nombre ? objPerfil.nombre.charAt(0).toUpperCase() : objUsuario.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-olive-800 font-semibold">
                    {objPerfil?.nombre || 'Usuario'}
                  </span>
                </Link>
                <button
                  onClick={() => setMostrarConfirmarSalir(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-earth-600 hover:bg-earth-50 rounded-md border border-earth-100 transition-all hover:text-earth-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-olive-700 hover:text-olive-900 transition-all"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/login?tab=registro"
                  className="px-4 py-2 text-sm font-medium bg-olive-500 hover:bg-olive-600 text-white rounded-md shadow-sm transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
 
          {/* Boton de menu para dispositivos moviles */}
          <div className="flex items-center gap-2 md:hidden">
            {objUsuario && (
              <div className="relative" ref={dropdownRefMobile}>
                <button
                  onClick={() => setDropdownNotifAbierto(!dropdownNotifAbierto)}
                  className="p-2 text-olive-750 hover:bg-olive-50 hover:text-olive-950 rounded-full relative transition-all cursor-pointer"
                >
                  <Bell className="w-5.5 h-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>
                
                {/* Dropdown de Notificaciones para Moviles */}
                {dropdownNotifAbierto && (
                  <div className="absolute right-0 mt-2.5 w-72 bg-white border border-olive-150 rounded-xl shadow-lg py-1 z-50 animate-fadeIn">
                    {renderContenidoDropdown()}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="inline-flex items-center justify-center p-2 rounded-md text-olive-600 hover:bg-olive-100 hover:text-olive-800 focus:outline-none cursor-pointer"
            >
              {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu desplegable movil */}
      {menuMovilAbierto && (
        <div className="md:hidden border-t border-olive-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner animate-slideDown">
          {objUsuario ? (
            <>
              {enlacesNavegacion.map((enlace) => {
                const Icono = enlace.icono
                const activo = pathname === enlace.ruta
                return (
                  <Link
                    key={enlace.ruta}
                    href={enlace.ruta}
                    onClick={() => setMenuMovilAbierto(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-base font-semibold rounded-lg transition-all ${
                      activo
                        ? 'bg-olive-500 text-white shadow-sm'
                        : 'text-olive-750 hover:bg-olive-50 hover:text-olive-900'
                    }`}
                  >
                    <Icono className="w-5 h-5" />
                    <span>{enlace.nombre}</span>
                  </Link>
                )
              })}
              
              <div className="pt-4 pb-2 border-t border-olive-50 mt-2">
                <Link
                  href="/perfil"
                  onClick={() => setMenuMovilAbierto(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-base font-semibold rounded-lg transition-all ${
                    pathname === '/perfil'
                      ? 'bg-olive-100 text-olive-900'
                      : 'text-olive-750 hover:bg-olive-50 hover:text-olive-900'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-olive-200 text-olive-700 font-semibold border border-olive-300">
                    {objPerfil?.nombre ? objPerfil.nombre.charAt(0).toUpperCase() : objUsuario.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-olive-800 font-semibold">
                    {objPerfil?.nombre || 'Mi Perfil'}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setMenuMovilAbierto(false)
                    setMostrarConfirmarSalir(true)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 mt-2 text-base font-semibold text-earth-600 hover:bg-earth-50 rounded-lg border border-earth-100 transition-all hover:text-earth-700 cursor-pointer text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Salir</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMenuMovilAbierto(false)}
                className="block text-center px-4 py-2.5 text-base font-semibold text-olive-700 hover:text-olive-900 transition-all border border-olive-250 rounded-lg"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/login?tab=registro"
                onClick={() => setMenuMovilAbierto(false)}
                className="block text-center px-4 py-2.5 text-base font-semibold bg-olive-500 hover:bg-olive-600 text-white rounded-lg shadow-sm transition-all"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>

    {/* Modal Popup de Confirmacion antes de Salir */}
    {mostrarConfirmarSalir && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
        <div className="flex flex-col items-center gap-5 w-full max-w-sm p-6 bg-white border border-earth-100 rounded-2xl shadow-xl transform scale-100 transition-all duration-300">
          {/* Icono de Salida sin emojis */}
          <div className="flex items-center justify-center w-14 h-14 bg-earth-50 text-earth-500 rounded-full border border-earth-100 shadow-sm">
            <LogOut className="w-8 h-8" />
          </div>

          {/* Titulo y Mensaje */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-earth-900">
              Cerrar Sesión
            </h3>
            <p className="text-sm text-olive-750 leading-relaxed">
              ¿Esta seguro de que desea salir y cerrar su sesion actual en OlivoScan?
            </p>
          </div>

          {/* Botones de Accion */}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => setMostrarConfirmarSalir(false)}
              className="flex-1 py-2.5 bg-white hover:bg-olive-50 text-olive-750 text-sm font-semibold rounded-xl border border-olive-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrarConfirmarSalir(false)
                manejarCierreSesion()
              }}
              className="flex-1 py-2.5 bg-earth-500 hover:bg-earth-600 active:bg-earth-750 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    )}
  </>
)
}

export default ClsNavbar
