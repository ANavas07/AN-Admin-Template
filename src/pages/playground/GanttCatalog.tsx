import GanttDiagram from "../../components/ui/gantt/SvarGantt";

export default function GanttCatalog() {

    const tasks = [
        { id: 1, text: "Project planning", type: "summary", open: true },
        { id: 2, text: "Marketing analysis", start: new Date(2026, 3, 2), duration: 5, parent: 1 },
        { id: 3, text: "Discussions", start: new Date(2026, 3, 7), duration: 3, parent: 1 },
        { id: 4, text: "Wireframes", start: new Date(2026, 3, 10), duration: 4, parent: 1 },
        { id: 5, text: "Backend setup", start: new Date(2026, 3, 14), duration: 6, parent: 1 },
        { id: 6, text: "Frontend build", start: new Date(2026, 3, 20), duration: 7, parent: 1 },
        { id: 7, text: "QA cycle", start: new Date(2026, 3, 28), duration: 4, parent: 1 },
        { id: 8, text: "Release prep", start: new Date(2026, 4, 4), duration: 3, parent: 1 },
        { id: 9, text: "Launch", start: new Date(2026, 4, 8), duration: 2, parent: 1 },
        { id: 10, text: "Post-launch metrics", start: new Date(2026, 4, 12), duration: 4, parent: 1 },
        { id: 11, text: "Bug triage", start: new Date(2026, 4, 16), duration: 5, parent: 1 },
        { id: 12, text: "Hotfixes", start: new Date(2026, 4, 22), duration: 4, parent: 1 },
        { id: 13, text: "Version 1.1 planning", start: new Date(2026, 4, 27), duration: 6, parent: 1 },
        { id: 14, text: "Version 1.1 dev", start: new Date(2026, 5, 3), duration: 8, parent: 1 },
        { id: 15, text: "Version 1.1 QA", start: new Date(2026, 5, 13), duration: 5, parent: 1 },
        { id: 16, text: "Version 1.1 release", start: new Date(2026, 5, 19), duration: 2, parent: 1 }
    ];

    const links = [
        { id: 1, source: 2, target: 3, type: "e2s" }
    ];

    const scales = [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "day", step: 1, format: "%j" },
    ];

    return (
        <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <section className="h-[55vh] min-h-130 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
                <GanttDiagram
                    tasks={tasks}
                    links={links}
                    scales={scales}
                    start={new Date(2026, 3, 1)}
                    end={new Date(2026, 5, 30)}
                    cellWidth={80}
                    cellHeight={44}
                    fullWidth
                    fullHeight
                    zoom
                    editable
                    showToolbar
                    showContextMenu
                    showEditor
                    theme="material"
                    themeFonts={true}
                />
            </section>
        </main>
    )
}