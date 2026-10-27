// ============================================================
// NOMBRE OBJETO: lib/cloudinary.js
// FECHA CREACION: 2026-08-31
// PROPIETARIO: Equipo de Desarrollo OlivoScan
// REQUERIMIENTO: RF-01 (Interfaz de captura y subida de imagen)
// DESCRIPCION: Módulo utilitario de servicio para la carga y eliminación
//              de imágenes en el almacenamiento en la nube de Cloudinary,
//              con sistema de persistencia local en public/uploads como fallback.
// ============================================================

import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'

const CARPETA_CLOUDINARY_ANALISIS = 'olivoscan/analisis'
const LONGITUD_HASH_ALEATORIO = 11

const tieneCredenciales = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (tieneCredenciales) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Sube un buffer binario de imagen a Cloudinary o lo almacena localmente como fallback.
 * @param {Buffer} bufferArchivo - Buffer de la imagen.
 * @param {string} tipoMime - Tipo MIME del archivo (ej. 'image/jpeg').
 * @returns {Promise<string>} URL pública de la imagen guardada.
 */
export async function subirImagen(bufferArchivo, tipoMime) {
  // Fail Fast: Validación de buffer
  if (!bufferArchivo || !Buffer.isBuffer(bufferArchivo)) {
    throw new Error('Buffer de imagen no proporcionado o inválido.')
  }

  try {
    if (tieneCredenciales) {
      const base64Data = bufferArchivo.toString('base64')
      const fileUri = `data:${tipoMime};base64,${base64Data}`

      const resultado = await cloudinary.uploader.upload(fileUri, {
        folder: CARPETA_CLOUDINARY_ANALISIS,
      })

      return resultado.secure_url
    } else {
      const nombreUnico = `${Date.now()}-${Math.random().toString(36).substring(2, LONGITUD_HASH_ALEATORIO)}`
      const extension = tipoMime.split('/')[1] || 'jpg'
      const nombreArchivo = `${nombreUnico}.${extension}`

      const dirUploads = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(dirUploads, { recursive: true })

      const pathCompleto = path.join(dirUploads, nombreArchivo)
      await fs.writeFile(pathCompleto, bufferArchivo)

      return `/uploads/${nombreArchivo}`
    }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo procesar y almacenar la imagen subida.'
    throw new Error(mensaje)
  }
}

/**
 * Extrae el identificador público (Public ID) de Cloudinary desde una URL.
 * @param {string} urlImagen - URL completa de Cloudinary.
 * @returns {string|null} Public ID o null si no es válida.
 */
function obtenerPublicId(urlImagen) {
  if (!urlImagen || typeof urlImagen !== 'string' || !urlImagen.includes('res.cloudinary.com')) {
    return null
  }

  try {
    const partesUpload = urlImagen.split('/upload/')
    if (partesUpload.length < 2) return null

    let rutaConVersion = partesUpload[1]
    const partesRuta = rutaConVersion.split('/')
    if (partesRuta[0].startsWith('v') && !isNaN(Number(partesRuta[0].substring(1)))) {
      partesRuta.shift()
    }

    const rutaCompleta = partesRuta.join('/')
    const ultimoPunto = rutaCompleta.lastIndexOf('.')
    return ultimoPunto !== -1 ? rutaCompleta.substring(0, ultimoPunto) : rutaCompleta
  } catch {
    return null
  }
}

/**
 * Elimina una imagen alojada en Cloudinary.
 * @param {string} urlImagen - URL de la imagen en Cloudinary.
 * @returns {Promise<boolean>} True si fue eliminada exitosamente.
 */
export async function eliminarImagen(urlImagen) {
  if (!tieneCredenciales) {
    return false
  }

  const publicId = obtenerPublicId(urlImagen)
  if (!publicId) {
    return false
  }

  try {
    const resultado = await cloudinary.uploader.destroy(publicId)
    return resultado.result === 'ok'
  } catch {
    return false
  }
}
