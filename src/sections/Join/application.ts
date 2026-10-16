/*
 * Applications from producers who want a stall.
 * Frontend only for now: sendApplication() is where the backend call goes.
 */

export type Application = {
  name: string
  business: string
  phone: string
  email: string
  origin: string
  category: string
  kind: 'produtor' | 'comerciante'
  message: string
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export async function sendApplication(application: Application) {
  if (import.meta.env.DEV) console.info('[candidatura]', application)
}
