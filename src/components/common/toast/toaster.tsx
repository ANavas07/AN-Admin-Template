import { Toaster } from 'sileo'
import { useTheme } from '../../../context/theme-context'

/**
 * Toasts use an inverted surface (dark in the light theme and vice versa) so
 * they stand out over any page. The fill comes from the `--color-toast` token
 * (see styles.css); text colors come from the same inverted tokens.
 */
export default function ThemedToaster() {
    const { isDarkMode } = useTheme()

    return (
        <Toaster
            position="bottom-right"
            theme={isDarkMode ? 'dark' : 'light'}
            options={{
                styles: {
                    title: 'text-toast-fg!',
                    description: 'text-toast-fg/75!',
                },
            }}
        />
    )
}
