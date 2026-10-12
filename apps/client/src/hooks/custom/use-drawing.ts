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

const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 600;

export default function useDrawing({ canvasRef, containerRef }: UseDrawingProps) {
    const layerRef = useRef<HTMLCanvasElement | null>(null);
    const strokesRef = useRef<{ strokes: Stroke[]; activeStroke: Stroke | null }>({ strokes: [], activeStroke: null });

    const getContext = useCallback((): CanvasRenderingContext2D | null => {
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
            if (rect.width === 0 || rect.height === 0) return null;

            const rawX = typeof e.offsetX === "number" ? e.offsetX : e.clientX - rect.left;
            const rawY = typeof e.offsetY === "number" ? e.offsetY : e.clientY - rect.top;

            return {
                x: (rawX / rect.width) * VIRTUAL_WIDTH,
                y: (rawY / rect.height) * VIRTUAL_HEIGHT,
            };
        },
        [canvasRef],
    );

    const drawStrokes = useCallback(
        (strokes: Stroke[], activeStroke: Stroke | null = null) => {
            strokesRef.current = { strokes, activeStroke };

            const canvasCxt = getCanvasContext();
            if (!canvasCxt) return;

            const { canvas, ctx } = canvasCxt;

            let layer = layerRef.current;
            if (!layer) {
                layer = document.createElement("canvas");
                layerRef.current = layer;
            }
            if (layer.width !== VIRTUAL_WIDTH || layer.height !== VIRTUAL_HEIGHT) {
                layer.width = VIRTUAL_WIDTH;
                layer.height = VIRTUAL_HEIGHT;
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

            const scaleX = canvas.width / VIRTUAL_WIDTH;
            const scaleY = canvas.height / VIRTUAL_HEIGHT;

            for (const turn of [...grouped.keys()].sort((a, b) => a - b)) {
                layerCtx.setTransform(1, 0, 0, 1, 0, 0);
                layerCtx.globalCompositeOperation = "source-over";
                layerCtx.clearRect(0, 0, layer.width, layer.height);

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
                ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
                ctx.globalCompositeOperation = "source-over";
                ctx.drawImage(layer, 0, 0);
                ctx.restore();
            }
        },
        [getCanvasContext],
    );

    const resizeCanvas = useCallback(() => {
        const container = containerRef.current;
        const canvasCxt = getCanvasContext();

        if (!container || !canvasCxt) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const width = Math.floor(rect.width * dpr);
        const height = Math.floor(rect.height * dpr);

        if (width === 0 || height === 0) return;

        const { canvas, ctx } = canvasCxt;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.imageSmoothingEnabled = true;

        const { strokes, activeStroke } = strokesRef.current;
        drawStrokes(strokes, activeStroke);
    }, [containerRef, drawStrokes, getCanvasContext]);

    useEffect(() => {
        resizeCanvas();

        const container = containerRef.current;
        const observer = container ? new ResizeObserver(resizeCanvas) : null;
        if (observer && container) observer.observe(container);

        window.addEventListener("resize", resizeCanvas);

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [containerRef, resizeCanvas]);

    return {
        getContext,
        drawStrokes,
        getCanvasPoints,
        getCanvasContext,
    };
}
