import type { PenSize, Point, Stroke } from "@package/types";
import { useCallback, useEffect, useRef, type RefObject } from "react";

type UseDrawingProps = {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
};

export const PEN_SIZES: Record<PenSize, number> = {
    thin: 2,
    medium: 6,
    thick: 12,
    "very-thick": 20,
};

export default function useDrawing({ canvasRef, containerRef }: UseDrawingProps) {
    const layerRef = useRef<HTMLCanvasElement | null>(null);

    const getContext = useCallback((): CanvasRenderingContext2D | null | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        return ctx;
    }, [canvasRef]);

    const getCanvasContext = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getContext();

        if (!canvas || !ctx) return null;

        return { canvas, ctx };
    }, [canvasRef, getContext]);

    const getCanvasPoints = useCallback(
        (e: PointerEvent): Point | null => {
            const canvas = canvasRef.current;

            if (!canvas) return null;

            const rect = canvas.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            return { x, y };
        },
        [canvasRef],
    );

    const resizeCanvas = useCallback(() => {
        const container = containerRef.current;
        const canvasCtx = getCanvasContext();

        if (!container || !canvasCtx) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const width = Math.floor(rect.width * dpr);
        const height = Math.floor(rect.height * dpr);

        const currentState = canvasCtx.ctx.getImageData(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

        canvasCtx.canvas.width = width;
        canvasCtx.canvas.height = height;
        canvasCtx.canvas.style.width = `${rect.width}px`;
        canvasCtx.canvas.style.height = `${rect.height}px`;

        canvasCtx.ctx.scale(dpr, dpr);
        canvasCtx.ctx.lineCap = "round";
        canvasCtx.ctx.lineJoin = "round";
        canvasCtx.ctx.imageSmoothingEnabled = true;

        if (currentState.width > 0 && currentState.height > 0) {
            try {
                canvasCtx.ctx.putImageData(currentState, 0, 0);
            } catch {
                canvasCtx.ctx.clearRect(0, 0, rect.width, rect.height);
            }
        } else {
            canvasCtx.ctx.clearRect(0, 0, rect.width, rect.height);
        }
    }, [containerRef, getCanvasContext]);

    const drawStrokes = useCallback(
        (strokes: Stroke[], activeStroke: Stroke | null = null) => {
            const canvasCxt = getCanvasContext();

            if (!canvasCxt) return;

            const { canvas, ctx } = canvasCxt;
            const dpr = window.devicePixelRatio || 1;

            let layer = layerRef.current;
            if (!layer) {
                layer = document.createElement("canvas");
                layerRef.current = layer;
            }
            if (layer.width !== canvas.width || layer.height !== canvas.height) {
                layer.width = canvas.width;
                layer.height = canvas.height;
            }

            const layerCtx = layer.getContext("2d");
            if (!layerCtx) return;

            const grouped = new Map<number, Stroke[]>();

            const append = (stroke: Stroke) => {
                const group = grouped.get(stroke.turn);
                if (group) group.push(stroke);
                else grouped.set(stroke.turn, [stroke]);
            };

            for (const stroke of strokes) append(stroke);

            if (activeStroke) append(activeStroke);

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            for (const turn of [...grouped.keys()].sort((a, b) => a - b)) {
                layerCtx.setTransform(1, 0, 0, 1, 0, 0);
                layerCtx.globalCompositeOperation = "source-over";
                layerCtx.clearRect(0, 0, layer.width, layer.height);
                layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
                layerCtx.lineCap = "round";
                layerCtx.lineJoin = "round";

                for (const { color, penSize, points, tool } of grouped.get(turn)!) {
                    if (points.length === 0) continue;

                    layerCtx.beginPath();
                    layerCtx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
                    layerCtx.strokeStyle = color;
                    layerCtx.lineWidth = PEN_SIZES[penSize];

                    const [first, ...rest] = points;
                    layerCtx.moveTo(first.x, first.y);

                    for (const point of rest) {
                        layerCtx.lineTo(point.x, point.y);
                    }

                    layerCtx.stroke();
                }

                layerCtx.globalCompositeOperation = "source-over";

                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalCompositeOperation = "source-over";
                ctx.drawImage(layer, 0, 0);
                ctx.restore();
            }
        },
        [getCanvasContext],
    );

    useEffect(() => {
        resizeCanvas();
        const handleResize = () => resizeCanvas();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [resizeCanvas]);

    return {
        getContext,
        drawStrokes,
        getCanvasPoints,
        getCanvasContext,
    };
}
