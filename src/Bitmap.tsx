import { useEffect, useRef, useState } from "preact/hooks";

function squareFillPixels(start: { x: number, y: number }, end: { x: number, y: number }): { x: number, y: number }[] {
    const stepX = end.x >= start.x ? 1 : -1;
    const stepY = end.y >= start.y ? 1 : -1;
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);

    const coords: { x: number, y: number }[] = [];
    for (let j = 0; j <= h; j++) {
        for (let i = 0; i <= w; i++) {
            coords.push({ x: start.x + i * stepX, y: start.y + j * stepY });
        }
    }
    return coords;
}

function squarePixels(start: { x: number, y: number }, end: { x: number, y: number }): { x: number, y: number }[] {
    const stepX = end.x >= start.x ? 1 : -1;
    const stepY = end.y >= start.y ? 1 : -1;
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);

    // 1-wide or 1-tall: the outline is just the filled strip
    if (w === 0 || h === 0) return squareFillPixels(start, end);

    const coords: { x: number, y: number }[] = [];
    for (let i = 0; i <= w; i++) coords.push({ x: start.x + i * stepX, y: start.y });   // start row
    for (let j = 1; j <= h; j++) coords.push({ x: end.x, y: start.y + j * stepY });     // end column
    for (let i = 1; i <= w; i++) coords.push({ x: end.x - i * stepX, y: end.y });       // end row
    for (let j = 1; j < h; j++)  coords.push({ x: start.x, y: end.y - j * stepY });     // start column
    return coords;
}

function linePixelsDDA(start: { x: number, y: number }, end: { x: number, y: number }) {
    const coords = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = start.x;
    let y = start.y;

    for (let i = 0; i <= steps; i++) {
        coords.push({ x: Math.round(x), y: Math.round(y) });
        x += xIncrement;
        y += yIncrement;
    }

    return coords;
}

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
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const [mouseDown, setMouseDown] = useState(false);

    const [mode, setMode] = useState<'pixel' | 'line' | 'square-fill' | 'square-stroke'>('pixel');
    const [pixelSize, setPixelSize] = useState(1);
    const [pixels, setPixels] = useState<{ x: number, y: number }[]>([]);

    useEffect(() => {
        if (mouseDown) return; // Means we are drawing, use _onChange draw
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
    }, [mouseDown, bitmap, palette, activeColor, size]);

    useEffect(() => {
        if (!overlayRef || !overlayRef.current) return;

        const overlayRefCtx = overlayRef.current.getContext("2d");
        if (!overlayRefCtx) return;

        overlayRefCtx.imageSmoothingEnabled = false;
        overlayRefCtx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

        pixels.forEach(pixel => {
            overlayRefCtx.fillStyle = palette[activeColor];
            overlayRefCtx.fillRect(pixel.x * size, pixel.y * size, size, size);
        })
    }, [mouseDown, pixels, palette, activeColor, size]);

    const _onChange = () => {
        if (mouseDown) {
            if (!canvasRef || !canvasRef.current) return;
            const canvasCtx = canvasRef.current.getContext("2d");

            if (!canvasCtx) return;
            canvasCtx.imageSmoothingEnabled = false;

            pixels.forEach(pixel => {
                canvasCtx.fillStyle = palette[activeColor];
                canvasCtx.fillRect(pixel.x * size, pixel.y * size, size, size);
            });
        }

        pixels.forEach(pixel => {
            if (pixel.x < 0 || pixel.x >= bitmap[0].length) return;
            if (pixel.y < 0 || pixel.y >= bitmap.length) return;

            onChange(pixel.x, pixel.y)
        });
    }

    return (
        <div class="bitmap-editor">
            <div class="bitmap-modes">
                <button onClick={() => setMode('pixel')}>Pixel {mode === 'pixel' && '✅'}</button>
                {mode === 'pixel' && (
                    <input
                        type="range" value={pixelSize} min={1} max={5}
                        onInput={event => {
                            setPixelSize(parseInt(event.currentTarget.value))
                        }}
                    />
                )}
                <button onClick={() => setMode('line')}>Line {mode === 'line' && '✅'}</button>
                <button onClick={() => setMode('square-fill')}>Square Fill {mode === 'square-fill' && '✅'}</button>
                <button onClick={() => setMode('square-stroke')}>Square Stroke {mode === 'square-stroke' && '✅'}</button>
            </div>

            <div class="bitmap-canvases">
                <canvas
                    ref={canvasRef}
                    width={bitmap[0].length * size}
                    height={bitmap.length * size}
                />

                <canvas
                    ref={overlayRef}
                    style={{ position: "absolute", inset: 0 }}
                    width={bitmap[0].length * size}
                    height={bitmap.length * size}
                    onMouseDown={() => setMouseDown(true)}
                    onMouseUp={() => setMouseDown(false)}
                    onMouseLeave={() => setMouseDown(false)}
                    onMouseMove={event => {
                        const coords = {
                            x: Math.floor(event.offsetX / size),
                            y: Math.floor(event.offsetY / size),
                        };
                        if (coords.x < 0 || coords.x >= bitmap[0].length) return;
                        if (coords.y < 0 || coords.y >= bitmap.length) return;

                        if (mode === 'pixel') {
                            setPixels(squareFillPixels(coords, { x: coords.x + pixelSize, y: coords.y + pixelSize }));
                            if (event.buttons === 1) {
                                _onChange();
                            }
                        } else if (mode === 'line') {
                            if (pixels.length) {
                                setPixels(prev => {
                                    if (!prev.length) return [];
                                    return linePixelsDDA(prev[0], coords);
                                });
                            }
                        } else if (mode === 'square-fill') {
                            if (pixels.length) {
                                setPixels(prev => {
                                    if (!prev.length) return [];
                                    return squareFillPixels(prev[0], coords); // TBD!!
                                });
                            }
                        } else if (mode === 'square-stroke') {
                            if (pixels.length) {
                                setPixels(prev => {
                                    if (!prev.length) return [];
                                    return squarePixels(prev[0], coords);
                                });
                            }
                        }
                    }}
                    onClick={event => {
                        const coords = {
                            x: Math.floor(event.offsetX / size),
                            y: Math.floor(event.offsetY / size),
                        };
                        if (coords.x < 0 || coords.x >= bitmap[0].length) return;
                        if (coords.y < 0 || coords.y >= bitmap.length) return;

                        if (mode === 'pixel') {
                            _onChange();
                        } else if (['line', 'square-fill', 'square-stroke'].includes(mode)) {
                            if (!pixels.length) {
                                setPixels([coords]);
                            } else {
                                _onChange();
                                setPixels([]);
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}