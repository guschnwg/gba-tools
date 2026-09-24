import { useEffect, useRef, useState } from "preact/hooks";
import { Sprite } from "./Sprite";
import { Combiner } from "./Combiner";
import { copy } from "./utils";

export type Tile = { spriteIdx: number, flip: { v: boolean, h: boolean } };

export function Map({
    map,
    brush,
    sprites,
    palette,
    onChange,
    onCreate,
}: {
    map: Tile[][],
    brush: Tile[][],
    sprites: number[][][],
    palette: string[],
    onChange: (x: number, y: number, tile: Tile) => void,
    onCreate: (width: number, height: number) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [size, setSize] = useState(2);

    const [mouseDown, setMouseDown] = useState(false);
    const [tileX, setTileX] = useState<number | null>(null);
    const [tileY, setTileY] = useState<number | null>(null);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) return;

        const canvasCtx = canvasRef.current.getContext("2d");
        if (!canvasCtx) return;

        canvasCtx.imageSmoothingEnabled = false;
        map.forEach((row, mapRowIdx) => {
            row.forEach((tile, mapColIdx) => {
                (tile.flip.v ? copy(sprites[tile.spriteIdx]).reverse() : sprites[tile.spriteIdx]).forEach((spriteRow, rowIdx) => {
                    (tile.flip.h ? copy(spriteRow).reverse() : spriteRow).forEach((pixel, colIdx) => {
                        canvasCtx.fillStyle = palette[pixel];
                        canvasCtx.fillRect(mapColIdx * 8 * size + colIdx * size, mapRowIdx * 8 * size + rowIdx * size, size, size);
                    });
                });
            });
        });
    }, [canvasRef, map, sprites, palette, size]);

    useEffect(() => {
        if (!mouseDown) return;
        if (tileX === null || tileY === null) return;

        brush.forEach((row, rowIdx) => {
            row.forEach((tile, colIdx) => {
                const actualX = tileX + colIdx;
                const actualY = tileY + rowIdx

                if (actualY < 0 || actualY >= map.length) return;
                if (actualX < 0 || actualX >= map[0].length) return;

                onChange(actualX, actualY, copy(tile));
            })
        })
    }, [mouseDown, tileX, tileY])

    return (
        <div class="map">
            {map.length ? (
                <>
                    <div class="map-actions">
                        <div>
                            <button onClick={() => setSize(prev => prev - 1)}>-</button>
                            Map Size ({size})
                            <button onClick={() => setSize(prev => prev + 1)}>+</button>
                        </div>
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={map[0].length * 8 * size}
                        height={map.length * 8 * size}
                        onMouseDown={() => setMouseDown(true)}
                        onMouseUp={() => setMouseDown(false)}
                        onMouseLeave={() => setMouseDown(false)}
                        onMouseMove={event => {
                            setTileX(Math.floor(event.offsetX / (8 * size)));
                            setTileY(Math.floor(event.offsetY / (8 * size)));
                        }}
                    ></canvas>
                </>
            ) : (
                <div>
                    No Map

                    <button onClick={() => onCreate(32, 32)}>
                        Create 32x32
                    </button>
                </div>
            )}
        </div>
    );
}