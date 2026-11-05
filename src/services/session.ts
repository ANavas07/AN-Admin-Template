import { LANDING_PATH } from '../navigation/navigation'

/**
 * PLANTILLA: sesion simulada. Cierra la sesion local y vuelve a la pagina de
 * entrada; con un backend real, invalida aqui el token en el servidor.
 */
export function signOut() {
    localStorage.removeItem('token')
    // Full reload: drops every in-memory state of the previous session
    window.location.assign(LANDING_PATH)
}
