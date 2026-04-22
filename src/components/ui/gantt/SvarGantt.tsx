import { useState, type ReactNode, type ComponentProps, type ComponentType } from "react";
import {
    ContextMenu,
    Editor,
    Gantt,
    Material,
    Toolbar,
    Willow,
    WillowDark,
    
    type IApi,
} from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

export type SvarGanttTheme = "willow" | "willow-dark" | "material" | "none";

export type SvarGanttProps = ComponentProps<typeof Gantt> & {
    theme?: SvarGanttTheme;
    themeFonts?: boolean;
    editable?: boolean;
    showToolbar?: boolean;
    showContextMenu?: boolean;
    showEditor?: boolean;
    fullWidth?: boolean;
    fullHeight?: boolean;
};

const themeWrappers = {
    willow: Willow,
    "willow-dark": WillowDark,
} as const;

const GanttComponent = Gantt as unknown as ComponentType<Record<string, unknown>>;


export default function GanttDiagram({
    theme = "willow",
    themeFonts = true,
    editable = false,
    showToolbar = editable,
    showContextMenu = editable,
    showEditor = editable,
    fullWidth,
    fullHeight,
    onscrollchart,
    readonly,
    init,
    ...ganttProps
}: SvarGanttProps) {
    const [api, setApi] = useState<IApi | null>(null);

    const handleInit = (nextApi: IApi) => {
        setApi(nextApi);
        init?.(nextApi);
    };

    const resolvedReadonly = readonly ?? !editable;

    const ganttNode = (
        <GanttComponent
            {...ganttProps}
            fullWidth={fullWidth}
            fullHeight={fullHeight}
            readonly={resolvedReadonly}
            init={handleInit}
        />
    );

    const ganttArea = showContextMenu ? (
        <ContextMenu api={api ?? undefined}>{ganttNode}</ContextMenu>
    ) : ganttNode;

    const ganttContent = (
        <>
            {showToolbar && api ? <Toolbar api={api} /> : null}
            <div className="min-h-0 flex-1">{ganttArea}</div>
            {showEditor && api ? <Editor api={api} /> : null}
            {onscrollchart}
        </>
    );

    if (theme === "none") {
        return ganttContent;
    }

    if (theme === "material") {
        return (
            <Material fonts={themeFonts}>
                {(() => <div className="flex h-full min-h-0 flex-col">{ganttContent}</div>) as unknown as ReactNode}
            </Material>
        );
    }

    const ThemeWrapper = themeWrappers[theme];

    return (
        <ThemeWrapper fonts={themeFonts}>
            <div className="flex h-full min-h-0 flex-col">{ganttContent}</div>
        </ThemeWrapper>
    );
}
