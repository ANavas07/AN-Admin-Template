import { useLocation, useNavigate } from 'react-router-dom'
import { HOME_PATH } from './navigation'

/**
 * "Back" that never leaves the app: the first page of a visit has no app
 * history (React Router marks it with the key "default"), so it goes home.
 */
export function useGoBack() {
    const navigate = useNavigate()
    const location = useLocation()
    return () => (location.key !== 'default' ? navigate(-1) : navigate(HOME_PATH))
}
