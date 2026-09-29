import { useEffect, useRef, useState } from "preact/hooks";

export function Bitmap({
    bitmap,
    size,
    palette,
    activeColor,
    onChange
}: {
    bitmap: number[][]
    size: number
    palette: string[]
    activeColor: number
    onChange: (x: number, y: number) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [mouseDown, setMouseDown] = useState(false);
    const [pixelX, setPixelX] = useState<number | null>(null);
    const [pixelY, setPixelY] = useState<number | null>(null);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) return;

        const canvasCtx = canvasRef.current.getContext("2d");
        if (!canvasCtx) return;

        canvasCtx.imageSmoothingEnabled = false;

        bitmap.forEach((row, rowIdx) => {
            row.forEach((pixel, colIdx) => {
                canvasCtx.fillStyle = palette[pixel];
                canvasCtx.fillRect(colIdx * size, rowIdx * size, size, size);
            });
        });
    }, [bitmap, palette, activeColor, size]);

    useEffect(() => {
        if (!mouseDown) return;
        if (pixelX === null || pixelY === null) return;

        if (pixelY < 0 || pixelY >= bitmap.length) return;
        if (pixelX < 0 || pixelX >= bitmap[0].length) return;

        onChange(pixelX, pixelY);
    }, [mouseDown, pixelX, pixelY])

    return (
        <canvas
            ref={canvasRef}
            width={bitmap[0].length * size}
            height={bitmap.length * size}
            onMouseDown={() => setMouseDown(true)}
            onMouseUp={() => setMouseDown(false)}
            onMouseLeave={() => setMouseDown(false)}
            onMouseEnter={e => {
                if (e.buttons === 1) {
                    setPixelX(null);
                    setPixelY(null);
                    setMouseDown(true);
                }
            }}
            onMouseMove={event => {
                setPixelX(Math.floor(event.offsetX / size));
                setPixelY(Math.floor(event.offsetY / size));
            }}
        ></canvas>
    );
}