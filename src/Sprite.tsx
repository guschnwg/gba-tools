import { TargetedMouseEvent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export function Sprite({
    showGrid = false,
    size = 8,
    sprite,
    flip,
    palette,
    onDraw = () => { },
    onClick = () => { },
}: {
    showGrid?: boolean,
    size?: number,
    sprite: Array<Array<number>>,
    flip?: { h: boolean, v: boolean },
    palette: Array<string>,
    onDraw?: (x: number, y: number) => void
    onClick?: (event: TargetedMouseEvent<HTMLCanvasElement>) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const height = sprite.length;
    const width = sprite[0].length;

    const [mouseDown, setMouseDown] = useState(false);
    const [pixelX, setPixelX] = useState<number | null>(null);
    const [pixelY, setPixelY] = useState<number | null>(null);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        (flip?.v ? sprite.slice().reverse() : sprite).map((row, rowIdx) => {
            (flip?.h ? row.slice().reverse() : row).map((pixel, colIdx) => {
                context.fillStyle = palette[pixel];
                context.fillRect(colIdx * size, rowIdx * size, size, size);
            })
        })

        if (showGrid) {
            context.strokeStyle = 'lightgray';
            context.lineWidth = .25;
            context.beginPath();
            for (let i = 0; i < canvasRef.current.width; i += size) {
                context.moveTo(i, 0);
                context.lineTo(i, canvasRef.current.height);
            }
            for (let i = 0; i < canvasRef.current.height; i += size) {
                context.moveTo(0, i);
                context.lineTo(canvasRef.current.width, i);
            }
            context.stroke();
        }
    }, [canvasRef, sprite, flip, palette, size, showGrid]);

    useEffect(() => {
        if (!mouseDown) return;
        if (pixelX === null || pixelY === null) return;

        onDraw(pixelX, pixelY);
    }, [mouseDown, pixelX, pixelY])

    return (
        <canvas
            width={size * width}
            height={size * height}
            ref={canvasRef}
            onMouseDown={() => setMouseDown(true)}
            onMouseUp={() => setMouseDown(false)}
            onMouseLeave={() => setMouseDown(false)}
            onMouseMove={event => {
                setPixelX(Math.floor(event.offsetX / size));
                setPixelY(Math.floor(event.offsetY / size));
            }}
            onClick={onClick}
        ></canvas>
    );
}