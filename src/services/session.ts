/**
 * PLANTILLA: sesion simulada. Cierra la sesion local; con un backend real,
 * invalida aqui el token en el servidor antes de redirigir.
 */
export function signOut() {
    localStorage.removeItem('token')
    window.location.href = '/login'
}
