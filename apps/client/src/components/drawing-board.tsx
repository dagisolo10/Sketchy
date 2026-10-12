import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-context";
import useDrawing, { PEN_SIZES } from "@/hooks/custom/use-drawing";
import type { DrawingState, PenSize, Stroke, Tool } from "@package/types";
import { cn } from "cn";
import { Eraser, Pen, Play, Redo, Undo } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type DrawingBoardProps = {
    roomId: string;
    myTurn: boolean;
    drawingState: DrawingState | null;
    setDrawingState: React.Dispatch<React.SetStateAction<DrawingState | null>>;
};

export default function DrawingBoard({ roomId, myTurn, drawingState, setDrawingState }: DrawingBoardProps) {
    const { socket } = useSocket();

    const [tool, setTool] = useState<Tool>("pen");
    const [penSize, setPenSize] = useState<PenSize>("thin");
    const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);

    const canUndo = drawingState ? drawingState.undoHistory.length > 0 : false;
    const canRedo = drawingState ? drawingState.redoHistory.length > 0 : false;

    const pressedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const drawing = useDrawing({ canvasRef, containerRef });

    const emitStart = useCallback(
        (e: PointerEvent) => {
            e.preventDefault();
            const point = drawing.getCanvasPoints(e);
            if (!point || !socket || !myTurn) return;

            pressedRef.current = true;
            canvasRef.current?.setPointerCapture(e.pointerId);
            socket.emit("drawing:start", { point, roomId, penSize, tool });
        },
        [drawing, myTurn, penSize, roomId, socket, tool],
    );

    const emitMove = useCallback(
        (e: PointerEvent) => {
            e.preventDefault();
            const ctx = drawing.getContext();
            const point = drawing.getCanvasPoints(e);
            if (!point || !ctx || !socket || !pressedRef.current || !myTurn) return;

            socket.emit("drawing:move", { point, roomId });
        },
        [drawing, myTurn, roomId, socket],
    );

    const emitStop = useCallback(
        (e: PointerEvent) => {
            if (!socket || !myTurn || !pressedRef.current) return;

            pressedRef.current = false;
            canvasRef.current?.releasePointerCapture(e.pointerId);
            socket.emit("drawing:end", { roomId });
        },
        [myTurn, roomId, socket],
    );

    useEffect(() => drawing.drawStrokes(drawingState?.strokes ?? [], activeStroke), [activeStroke, drawing, drawingState?.strokes]);

    useEffect(() => {
        const canvasCxt = drawing.getCanvasContext();
        if (!canvasCxt || !socket) return;
        const { canvas } = canvasCxt;

        socket.on("drawing:start", ({ point, penSize, tool, color, turn }) => {
            setTool(tool);
            setPenSize(penSize);
            setActiveStroke({ tool, color, penSize, points: [point], active: true, playerId: "", turn });
        });

        socket.on("drawing:move", ({ point }) => {
            setActiveStroke((stroke) => (stroke ? { ...stroke, points: [...stroke.points, point] } : stroke));
        });

        socket.on("drawing:end", ({ drawingState }) => {
            pressedRef.current = false;
            setActiveStroke(null);
            setDrawingState(drawingState);
        });
        socket.on("drawing:undo", ({ drawingState }) => setDrawingState(drawingState));
        socket.on("drawing:redo", ({ drawingState }) => setDrawingState(drawingState));

        canvas.addEventListener("pointerup", emitStop);
        canvas.addEventListener("pointerout", emitStop);
        canvas.addEventListener("pointermove", emitMove);
        canvas.addEventListener("pointerdown", emitStart);
        canvas.addEventListener("pointercancel", emitStop);

        return () => {
            canvas.removeEventListener("pointerup", emitStop);
            canvas.removeEventListener("pointerout", emitStop);
            canvas.removeEventListener("pointermove", emitMove);
            canvas.removeEventListener("pointerdown", emitStart);
            canvas.removeEventListener("pointercancel", emitStop);

            socket.off("drawing:end");
            socket.off("drawing:undo");
            socket.off("drawing:redo");
            socket.off("drawing:move");
            socket.off("drawing:start");
        };
    }, [drawing, emitMove, emitStart, emitStop, setDrawingState, socket]);

    return (
        <div className="flex size-full flex-col">
            <div className="bg-card/90 border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4">
                <div className="flex flex-1 items-center gap-2 sm:gap-3">
                    <div className="border-border bg-background flex items-center rounded-md border p-0.5">
                        <Button size="sm" disabled={!myTurn} onClick={() => setTool("pen")} variant={tool === "pen" ? "default" : "ghost"} className={cn("h-7 px-2.5 font-mono text-xs font-bold uppercase", tool === "pen" && "shadow-nb-xs")}>
                            <Pen className="mr-1 size-3.5" />
                            Pen
                        </Button>
                        <Button size="sm" disabled={!myTurn} onClick={() => setTool("eraser")} variant={tool === "eraser" ? "default" : "ghost"} className={cn("h-7 px-2.5 font-mono text-xs font-bold uppercase", tool === "eraser" && "shadow-nb-xs")}>
                            <Eraser className="mr-1 size-3.5" />
                            Eraser
                        </Button>
                    </div>

                    <div className="bg-border hidden h-5 w-px sm:block" />

                    <div className="ml-auto flex items-center gap-2 sm:ml-0">
                        {Object.entries(PEN_SIZES).map(([sizeKey], i) => {
                            const s = sizeKey as PenSize;
                            const isActive = penSize === s;

                            return (
                                <Button
                                    key={s}
                                    type="button"
                                    size="sm"
                                    disabled={!myTurn}
                                    title={`Size: ${s}`}
                                    onClick={() => setPenSize(s)}
                                    variant={isActive ? "default" : "outline"}
                                    className={cn("size-7 p-0 font-mono text-xs font-bold", isActive && "shadow-nb-xs")}
                                >
                                    {i + 1}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => socket?.emit("drawing:undo", { roomId })} disabled={!canUndo || !myTurn} className="h-7 px-2.5 font-mono text-xs font-bold uppercase" title="Undo">
                        <Undo className="size-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Undo</span>
                    </Button>

                    <Button type="button" variant="outline" size="sm" onClick={() => socket?.emit("drawing:redo", { roomId })} disabled={!canRedo || !myTurn} className="h-7 px-2.5 font-mono text-xs font-bold uppercase" title="Redo">
                        <Redo className="size-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Redo</span>
                    </Button>

                    <div className="bg-border mx-1 h-5 w-px" />

                    <Button type="button" variant="default" size="sm" onClick={() => socket?.emit("drawing:next", { roomId })} disabled={!myTurn} className="ml-auto h-7 gap-1.5 px-3 font-mono text-xs font-bold tracking-widest uppercase sm:ml-0">
                        <Play className="size-3.5 fill-current" />
                        Next
                    </Button>
                </div>
            </div>

            <div ref={containerRef} className="bg-background/50 relative min-h-0 w-full flex-1 touch-none select-none">
                <canvas ref={canvasRef} className="absolute inset-0 size-full cursor-crosshair touch-none" onContextMenu={(e) => e.preventDefault()} />
                <div className="border-primary/30 pointer-events-none absolute inset-0 border-2" />
            </div>
        </div>
    );
}
