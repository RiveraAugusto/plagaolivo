// ============================================================
// NOMBRE OBJETO: components/analisis/AnalisisSubirImagen.jsx
// FECHA CREACION: 2026-08-31
// PROPIETARIO: Equipo de Desarrollo OlivoScan
// REQUERIMIENTO: RF-01 (Interfaz de captura y subida de imagen)
// DESCRIPCION: Componente para captura de fotos de hojas de olivo
//              mediante cámara en tiempo real o carga desde galería
//              con compresión en cliente y previsualización.
// ============================================================

import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, AlertCircle, Image as ImageIcon } from 'lucide-react'

// Constantes de configuración de imagen
const LIMITE_TAMANO_ARCHIVO_BYTES = 10 * 1024 * 1024 // 10 MB
const RESOLUCION_MAXIMA_PX = 1200
const CALIDAD_COMPRESION_JPEG = 0.85
const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png']

/**
 * Comprime y redimensiona una imagen en cliente para optimizar la transferencia web móvil.
 * @param {File} archivoOriginal - Archivo seleccionado por el usuario.
 * @returns {Promise<File>} Archivo comprimido en formato JPEG.
 */
function comprimirImagenCliente(archivoOriginal) {
  return new Promise((resolve) => {
    const lector = new FileReader()
    lector.onload = (evento) => {
      const elementoImagen = new window.Image()
      elementoImagen.onload = () => {
        let ancho = elementoImagen.width
        let alto = elementoImagen.height

        if (ancho > alto) {
          if (ancho > RESOLUCION_MAXIMA_PX) {
            alto = Math.round((alto * RESOLUCION_MAXIMA_PX) / ancho)
            ancho = RESOLUCION_MAXIMA_PX
          }
        } else {
          if (alto > RESOLUCION_MAXIMA_PX) {
            ancho = Math.round((ancho * RESOLUCION_MAXIMA_PX) / alto)
            alto = RESOLUCION_MAXIMA_PX
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = ancho
        canvas.height = alto

        const contexto = canvas.getContext('2d')
        contexto.drawImage(elementoImagen, 0, 0, ancho, alto)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const nombreBase = archivoOriginal.name.replace(/\.[^/.]+$/, '')
              const archivoComprimido = new File(
                [blob],
                `${nombreBase}_comprimida.jpg`,
                { type: 'image/jpeg', lastModified: Date.now() }
              )
              resolve(archivoComprimido)
            } else {
              resolve(archivoOriginal)
            }
          },
          'image/jpeg',
          CALIDAD_COMPRESION_JPEG
        )
      }
      elementoImagen.onerror = () => resolve(archivoOriginal)
      elementoImagen.src = evento.target.result
    }
    lector.onerror = () => resolve(archivoOriginal)
    lector.readAsDataURL(archivoOriginal)
  })
}

/**
 * Componente principal para captura y carga de imágenes de hojas de olivo.
 *
 * @param {Object} props
 * @param {(archivo: File) => void} props.onImagenSeleccionada - Callback ejecutado al confirmar el análisis.
 */
export default function AnalisisSubirImagen({ onImagenSeleccionada }) {
  const [pestañaActiva, setPestañaActiva] = useState('archivo')
  const [mensajeError, setMensajeError] = useState(null)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)
  const [urlPrevisualizacion, setUrlPrevisualizacion] = useState(null)

  const refInputArchivo = useRef(null)

  useEffect(() => {
    return () => {
      if (urlPrevisualizacion) {
        URL.revokeObjectURL(urlPrevisualizacion)
      }
    }
  }, [urlPrevisualizacion])

  async function procesarArchivoEntrante(archivo) {
    setMensajeError(null)

    // Fail Fast: Validar existencia
    if (!archivo) return

    // Fail Fast: Validar formato permitido
    if (!FORMATOS_PERMITIDOS.includes(archivo.type)) {
      setMensajeError('Solo se permiten imágenes en formato JPG o PNG.')
      return
    }

    // Fail Fast: Validar tamaño máximo
    if (archivo.size > LIMITE_TAMANO_ARCHIVO_BYTES) {
      setMensajeError('La imagen es demasiado grande. El límite máximo permitido es de 10 MB.')
      return
    }

    try {
      const archivoComprimido = await comprimirImagenCliente(archivo)
      const urlBlob = URL.createObjectURL(archivoComprimido)
      setArchivoSeleccionado(archivoComprimido)
      setUrlPrevisualizacion(urlBlob)
    } catch {
      const urlFallback = URL.createObjectURL(archivo)
      setArchivoSeleccionado(archivo)
      setUrlPrevisualizacion(urlFallback)
    }
  }

  function manejarLimpiarPrevisualizacion() {
    if (urlPrevisualizacion) {
      URL.revokeObjectURL(urlPrevisualizacion)
    }
    setArchivoSeleccionado(null)
    setUrlPrevisualizacion(null)
    setMensajeError(null)
  }

  function manejarConfirmarAnalisis() {
    if (archivoSeleccionado && onImagenSeleccionada) {
      onImagenSeleccionada(archivoSeleccionado)
    }
  }

  function manejarCambioArchivo(evento) {
    const archivos = evento.target.files
    if (archivos && archivos[0]) {
      procesarArchivoEntrante(archivos[0])
    }
  }

  function manejarSoltarArchivo(evento) {
    evento.preventDefault()
    const archivos = evento.dataTransfer.files
    if (archivos && archivos[0]) {
      procesarArchivoEntrante(archivos[0])
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-glass border border-olive-100">
      {!urlPrevisualizacion && (
        <div className="flex bg-olive-50 p-1 rounded-xl border border-olive-100">
          <button
            type="button"
            onClick={() => setPestañaActiva('archivo')}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              pestañaActiva === 'archivo'
                ? 'bg-white text-olive-800 shadow-sm border border-olive-100/50'
                : 'text-olive-600 hover:text-olive-800 hover:bg-olive-100/30'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Galería de fotos
          </button>
          <button
            type="button"
            onClick={() => setPestañaActiva('camara')}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              pestañaActiva === 'camara'
                ? 'bg-white text-olive-800 shadow-sm border border-olive-100/50'
                : 'text-olive-600 hover:text-olive-800 hover:bg-olive-100/30'
            }`}
          >
            <Camera className="w-4 h-4" />
            Cámara en vivo
          </button>
        </div>
      )}

      {mensajeError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 border border-red-100 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{mensajeError}</span>
        </div>
      )}

      {urlPrevisualizacion ? (
        <div className="flex flex-col gap-6 w-full">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-olive-950">
              Verifica tu fotografía
            </h3>
            <p className="text-xs text-olive-600">
              Asegúrate de que la hoja de olivo esté visible y bien enfocada.
            </p>
          </div>

          <div className="flex justify-center items-center relative overflow-hidden w-full h-80 bg-olive-50/30 border-2 border-solid border-olive-200 rounded-2xl">
            <img
              src={urlPrevisualizacion}
              alt="Previsualización de la hoja de olivo"
              className="w-full h-full object-contain"
            />
            {archivoSeleccionado && (
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-olive-900/85 text-white text-[10px] font-semibold backdrop-blur-xs rounded-md shadow-sm">
                {(archivoSeleccionado.size / 1024).toFixed(0)} KB
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center items-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={manejarLimpiarPrevisualizacion}
              className="px-6 py-2.5 w-full bg-white text-olive-700 border border-olive-200 font-semibold text-sm rounded-lg shadow-sm transition-all duration-200 hover:bg-olive-50 sm:w-auto cursor-pointer"
            >
              Cambiar imagen
            </button>
            <button
              type="button"
              onClick={manejarConfirmarAnalisis}
              className="flex justify-center items-center gap-2 px-8 py-2.5 w-full bg-olive-600 text-white font-semibold text-sm rounded-lg shadow-md transition-all duration-200 hover:bg-olive-750 hover:shadow-lg sm:w-auto cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Analizar
            </button>
          </div>
        </div>
      ) : (
        <>
          {pestañaActiva === 'archivo' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={manejarSoltarArchivo}
              onClick={() => refInputArchivo.current && refInputArchivo.current.click()}
              className="flex flex-col items-center justify-center gap-4 w-full h-72 border-2 border-dashed border-olive-300 hover:border-olive-500 bg-olive-50/50 hover:bg-olive-50 rounded-2xl cursor-pointer transition-all duration-300 group"
            >
              <input
                type="file"
                ref={refInputArchivo}
                onChange={manejarCambioArchivo}
                accept="image/jpeg, image/png"
                className="hidden"
              />
              
              <div className="p-4 bg-white text-olive-600 rounded-full border border-olive-200 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-olive-500" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-base font-semibold text-olive-950">
                  Arrastra tu fotografía aquí
                </p>
                <p className="text-xs text-olive-600">
                  o haz clic para explorar en tu dispositivo
                </p>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider text-olive-400 bg-olive-100/60 px-2.5 py-1 rounded">
                JPG, PNG (Máx. 10MB)
              </span>
            </div>
          )}

          {pestañaActiva === 'camara' && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-col items-center justify-center gap-4 w-full h-72 bg-olive-50/50 rounded-2xl border border-olive-100 p-6 text-center">
                <Camera className="w-12 h-12 text-olive-400" />
                <p className="text-sm font-medium text-olive-750 max-w-sm">
                  Utilice la cámara de su dispositivo móvil para capturar una fotografía directamente.
                </p>
                
                <label className="flex items-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all duration-200">
                  <Camera className="w-4 h-4" />
                  Usar cámara del celular
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    capture="environment"
                    onChange={manejarCambioArchivo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

