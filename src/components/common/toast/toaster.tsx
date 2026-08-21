import { Toaster } from 'sileo'
import { useTheme } from '../../../context/ThemeContext'


export default function ThemedToaster() {
    const { isDarkMode } = useTheme()

    return (
        <Toaster
            position="bottom-right"
            theme={isDarkMode ? 'dark' : 'light'}
            options={{
                fill: isDarkMode ? '#ffffff' : '#111e23',
                styles: {
                    title: isDarkMode ? 'text-slate-900!' : 'text-white!',
                    description: isDarkMode ? 'text-slate-600!' : 'text-white/75!',
                },
            }}
        />
    )
}