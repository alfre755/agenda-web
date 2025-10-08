import { type ClassValue,clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea y valida un RUT chileno
 * @param rut - RUT en cualquier formato (con o sin puntos, guiones, etc.)
 * @returns RUT formateado como "12345678-9" o null si es inválido
 */
export function formatRut(rut: string): string | null {
  if (!rut) return null;
  
  // Limpiar el RUT: remover puntos, espacios y convertir a mayúsculas
  const cleanRut = rut.replace(/[.\s-]/g, '').toUpperCase();
  
  // Verificar que tenga al menos 2 caracteres (número + dígito verificador)
  if (cleanRut.length < 2) return null;
  
  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Verificar que el número sea válido (solo dígitos)
  if (!/^\d+$/.test(rutNumber)) return null;
  
  // Verificar que el dígito verificador sea válido (0-9 o K)
  if (!/^[0-9K]$/.test(dv)) return null;
  
  // Calcular dígito verificador
  const calculatedDv = calculateRutDv(rutNumber);
  
  // Verificar que el dígito verificador sea correcto
  if (calculatedDv !== dv) return null;
  
  // Formatear como "12345678-9"
  return `${rutNumber}-${dv}`;
}

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param rutNumber - Número del RUT sin dígito verificador
 * @returns Dígito verificador calculado
 */
function calculateRutDv(rutNumber: string): string {
  let sum = 0;
  let multiplier = 2;
  
  // Procesar de derecha a izquierda
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const dv = 11 - remainder;
  
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}
