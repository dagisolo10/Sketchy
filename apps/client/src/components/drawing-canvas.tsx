import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { Circle, Eraser, Pen, Redo, Trash2, Undo } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Tool = "pen" | "eraser";
type PenSize = "thin" | "medium" | "thick" | "very-thick";

const PEN_SIZES: Record<PenSize, number> = {
    thin: 2,
    medium: 6,
    thick: 12,
    "very-thick": 20,
};

interface Point {
    x: number;
    y: number;
}

export default function DrawingCanvas() {
    const isDrawingRef = useRef(false);
    const currentStrokeRef = useRef<Point[]>([]);
    const lastPointRef = useRef<Point | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [tool, setTool] = useState<Tool>("pen");
    const [penSize, setPenSize] = useState<PenSize>("medium");
    const [history, setHistory] = useState<ImageData[]>([]);
    const [redoHistory, setRedoHistory] = useState<ImageData[]>([]);
    const canUndo = history.length > 0;
    const canRedo = redoHistory.length > 0;

    const getContext = useCallback((): CanvasRenderingContext2D | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        return ctx;
    }, []);

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const newHistory = [...history, imageData];
        setHistory(newHistory);
        setRedoHistory([]);
    }, [getContext, history]);

    const restoreState = useCallback(
        (imageData: ImageData) => {
            const ctx = getContext();
            if (!ctx) return;
            ctx.clearRect(0, 0, imageData.width, imageData.height);
            ctx.putImageData(imageData, 0, 0);
        },
        [getContext],
    );

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = getContext();
        if (!canvas || !container || !ctx) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const width = Math.floor(rect.width * dpr);
        const height = Math.floor(rect.height * dpr);

        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.imageSmoothingEnabled = true;

        if (currentState.width > 0 && currentState.height > 0) {
            try {
                ctx.putImageData(currentState, 0, 0);
            } catch {
                ctx.clearRect(0, 0, rect.width, rect.height);
            }
        } else {
            ctx.clearRect(0, 0, rect.width, rect.height);
        }
    }, [getContext]);

    const getCanvasPoint = useCallback((e: PointerEvent): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const startDrawing = useCallback(
        (e: PointerEvent) => {
            const point = getCanvasPoint(e);
            if (!point) return;

            e.preventDefault();
            canvasRef.current?.setPointerCapture(e.pointerId);
            isDrawingRef.current = true;
            lastPointRef.current = point;
            currentStrokeRef.current = [point];

            const ctx = getContext();
            if (!ctx) return;

            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        },
        [getCanvasPoint, getContext],
    );

    const draw = useCallback(
        (e: PointerEvent) => {
            if (!isDrawingRef.current) return;
            const point = getCanvasPoint(e);
            if (!point || !lastPointRef.current) return;

            e.preventDefault();
            currentStrokeRef.current.push(point);

            const ctx = getContext();
            if (!ctx) return;

            const size = PEN_SIZES[penSize];

            if (tool === "eraser") {
                ctx.globalCompositeOperation = "destination-out";
                ctx.lineWidth = size;
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = size;
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            }

            lastPointRef.current = point;
        },
        [getCanvasPoint, getContext, penSize, tool],
    );

    const stopDrawing = useCallback(
        (e: PointerEvent) => {
            if (!isDrawingRef.current) return;

            e.preventDefault();
            canvasRef.current?.releasePointerCapture(e.pointerId);
            isDrawingRef.current = false;
            lastPointRef.current = null;

            if (currentStrokeRef.current.length > 1) {
                saveState();
            }

            currentStrokeRef.current = [];
            const ctx = getContext();
            if (ctx) {
                ctx.beginPath();
            }
        },
        [getContext, saveState],
    );

    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;

        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const previousState = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        restoreState(previousState);
        setHistory(newHistory);
        setRedoHistory([...redoHistory, currentImageData]);
    }, [getContext, history, redoHistory, restoreState]);

    const handleRedo = useCallback(() => {
        if (redoHistory.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;

        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const nextState = redoHistory[redoHistory.length - 1];
        const newRedoHistory = redoHistory.slice(0, -1);

        restoreState(nextState);
        setRedoHistory(newRedoHistory);
        setHistory([...history, currentImageData]);
    }, [getContext, history, redoHistory, restoreState]);

    const handleClear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;

        saveState();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, [getContext, saveState]);

    useEffect(() => {
        resizeCanvas();
        const handleResize = () => resizeCanvas();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [resizeCanvas]);

    useEffect(() => {}, [history]);

    useEffect(() => {}, [redoHistory]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener("pointermove", draw);
        canvas.addEventListener("pointerup", stopDrawing);
        canvas.addEventListener("pointerout", stopDrawing);
        canvas.addEventListener("pointercancel", stopDrawing);
        canvas.addEventListener("pointerdown", startDrawing);

        return () => {
            canvas.removeEventListener("pointermove", draw);
            canvas.removeEventListener("pointerup", stopDrawing);
            canvas.removeEventListener("pointerout", stopDrawing);
            canvas.removeEventListener("pointerdown", startDrawing);
            canvas.removeEventListener("pointercancel", stopDrawing);
        };
    }, [draw, startDrawing, stopDrawing]);

    useEffect(() => {
        const ctx = getContext();
        if (ctx) {
            ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
        }
    }, [getContext, tool]);

    return (
        <div className={cn("flex size-full flex-col")}>
            <div className="bg-card/60 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-3 py-2 sm:px-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        type="button"
                        onClick={() => setTool("pen")}
                        variant={tool === "pen" ? "default" : "outline"}
                        className={cn("gap-2 rounded-none border-slate-800", tool === "pen" && "glow-primary")}
                    >
                        <Pen className="size-4" />
                        PEN
                    </Button>

                    <Button
                        size="sm"
                        type="button"
                        onClick={() => setTool("eraser")}
                        variant={tool === "eraser" ? "default" : "outline"}
                        className={cn("gap-2 rounded-none border-slate-800", tool === "eraser" && "glow-primary")}
                    >
                        <Eraser className="size-4" />
                        ERASER
                    </Button>

                    <div className="h-6 w-px bg-slate-800" />

                    <div className="flex items-center gap-1.5">
                        {Object.entries(PEN_SIZES).map(([sizeKey]) => {
                            const s = sizeKey as PenSize;
                            const isActive = penSize === s;

                            return (
                                <Button
                                    key={s}
                                    type="button"
                                    size="icon-sm"
                                    onClick={() => setPenSize(s)}
                                    title={s.replace("-", " ")}
                                    variant={isActive ? "default" : "ghost"}
                                    className={cn("rounded-none border-slate-800", isActive && "glow-primary")}
                                >
                                    <Circle className={cn("size-3", isActive && "fill-background stroke-background")} />
                                </Button>
                            );
                        })}
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <Button type="button" variant="ghost" size="sm" onClick={handleUndo} disabled={!canUndo} className="gap-2 rounded-none border-slate-800">
                        <Undo className="size-4" />
                        UNDO
                    </Button>

                    <Button type="button" variant="ghost" size="sm" onClick={handleRedo} disabled={!canRedo} className="gap-2 rounded-none border-slate-800">
                        <Redo className="size-4" />
                        REDO
                    </Button>

                    <Button type="button" variant="destructive" size="sm" onClick={handleClear} className="gap-2 rounded-none">
                        <Trash2 className="size-4" />
                        CLEAR
                    </Button>
                </div>

                <div className="text-primary font-bold tracking-widest uppercase">{tool === "eraser" ? "ERASER MODE" : `PEN • ${penSize.replace("-", " ")}`}</div>
            </div>

            <div ref={containerRef} className="relative h-[50vh] w-full flex-1 touch-none lg:h-full">
                <canvas ref={canvasRef} className={cn("absolute inset-0 size-full cursor-crosshair touch-none")} onContextMenu={(e) => e.preventDefault()} />
                <div className="border-primary/40 pointer-events-none absolute inset-0 border-2" />
            </div>
        </div>
    );
}
