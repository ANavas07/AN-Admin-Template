type ModuleCardProps = {
    icon: string
    title: string
    description: string
    onClick?: () => void
    isAvailable?: boolean
}

export default function ModuleCard({
    icon,
    title,
    description,
    onClick,
    isAvailable = true,
}: ModuleCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!isAvailable}
            className="group rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 text-left transition-all hover:border-highlight hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="flex items-start gap-3">
                <span className="text-3xl leading-none group-hover:scale-110 transition-transform">
                    {icon}
                </span>
                <div className="flex-1">
                    <h3 className="font-semibold text-(--color-text) group-hover:text-highlight transition-colors">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs text-(--color-text-muted) leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    )
}
