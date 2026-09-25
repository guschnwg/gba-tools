import { useEffect, useMemo, useState } from "preact/hooks";
import { Sprite } from "./Sprite";
import { emptySprites, emptyPalette, rgbToHex, chunks, hexToRgb, copy } from "./utils";
import { Files, saveToLocalStorage } from "./Files";
import { LoadFromFiles } from "./LoadFromFiles";
import { Palette } from "./Palette";
import { Combiner } from "./Combiner";
import { DuplicateSprite } from "./DuplicateSprite";
import { Map, Tile } from "./Map";

export function SpriteSheetCreator() {
    const [name, setName] = useState('sprites');
    const [ready, setReady] = useState(false);
    const [showGrid, setShowGrid] = useState(false);

    // 8x8 etc
    // Only 8 supported
    const [tileSize, setTileSize] = useState(8);
    // 16 palettes of 16 colors or 256 colors single
    // Only Mode 16 supported
    const [numOfPalettes, setNumOfPalettes] = useState(16);

    const [sprites, setSprites] = useState<number[][][]>([]);
    const [activeSpriteIdx, setActiveSpriteIdx] = useState(0);
    const activeSprite = useMemo(() => sprites[activeSpriteIdx], [sprites, activeSpriteIdx]);

    const [palette, setPalette] = useState<{ r: number, g: number, b: number }[]>([]);
    const [activeColorIdx, setActiveColorIdx] = useState(0);
    // In mode 16: 0~15, in mode 256: 0
    const activePaletteIdx = useMemo(() => Math.floor(activeColorIdx / numOfPalettes), [numOfPalettes, activeColorIdx]);
    const activeColorInPaletteIdx = useMemo(() => activeColorIdx % numOfPalettes, [numOfPalettes, activeColorIdx]);

    const paletteHex = useMemo(() => palette.map(color => rgbToHex(color.r * 8, color.g * 8, color.b * 8)), [palette]);
    const paletteChunksHex = useMemo(() => chunks(paletteHex, numOfPalettes), [numOfPalettes, paletteHex]);
    const activePaletteHex = useMemo(() => paletteChunksHex[activePaletteIdx] || [], [paletteChunksHex, activePaletteIdx]);

    const activeColorHex = useMemo(() => activePaletteHex[activeColorInPaletteIdx] || '#000', [activePaletteHex, activeColorInPaletteIdx]);
    const activeColorRgb = useMemo(() => hexToRgb(activeColorHex), [activeColorHex]);

    // Matrix of tiles
    const [map, setMap] = useState<Tile[][]>([]);

    const [brush, setBrush] = useState<Tile[][]>([[{ spriteIdx: 0, flip: { h: false, v: false } }]]);

    const onColorChange = (field: 'r' | 'g' | 'b', value: number) => {
        const newActiveColor = copy(activeColorRgb);
        newActiveColor[field] = value;
        setPalette(prev => {
            const newPalette = copy(prev);
            newPalette[activePaletteIdx * 16 + activeColorInPaletteIdx] = newActiveColor;
            return newPalette;
        })
    }

    useEffect(() => {
        if (!ready) return;

        saveToLocalStorage(sprites, palette, map);
    }, [ready, sprites, palette, map]);

    if (!ready) {
        return (
            <div>
                <p>Start with randomly generated data, load from files or load from browser cache</p>

                <LoadFromFiles
                    onLoad={(sprites, palette, map) => {
                        setSprites(sprites);
                        setPalette(palette);
                        setMap(map);
                        setReady(true);
                    }}
                />
            </div>
        );
    }

    return (
        <div class="sprite-sheet-creator">
            <div id="header">
                <div>
                    Name:
                    <input type='text' value={name} onChange={event => setName(event.currentTarget.value)} />
                </div>

                <Files
                    name={name}
                    sprites={sprites}
                    palette={palette}
                    map={map}
                    onChangeName={setName}
                />

                <div>
                    Show Grid?
                    <input type='checkbox' checked={showGrid} onChange={event => setShowGrid(event.currentTarget.checked)} />
                </div>
            </div>

            <div class="current">
                <p>Current sprite</p>

                <div class="current-actions">
                    <DuplicateSprite
                        current={activeSpriteIdx}
                        sprites={sprites}
                        palette={activePaletteHex}
                        onSelect={index => {
                            setSprites(prev => {
                                const newSprites = copy(prev);
                                newSprites[activeSpriteIdx] = copy(newSprites[index]);
                                return newSprites;
                            });
                        }}
                    />
                </div>

                <Sprite
                    size={32}
                    showGrid={showGrid}
                    sprite={activeSprite}
                    palette={activePaletteHex}
                    onDraw={(x: number, y: number) => {
                        setSprites(prev => {
                            const newSprites = copy(prev);
                            if (x < tileSize && y < tileSize) {
                                newSprites[activeSpriteIdx][y][x] = activeColorInPaletteIdx;
                            }
                            return newSprites;
                        });
                    }}
                />
            </div>
            <div class="sprites">
                <p>Sprites</p>

                {sprites.map((sprite, idx) => (
                    <Sprite
                        key={idx}
                        showGrid={showGrid}
                        sprite={sprite}
                        palette={activePaletteHex}
                        onClick={() => setActiveSpriteIdx(idx)}
                    />
                ))}
                <button
                    onClick={() => setSprites(prev => [...copy(prev), copy(prev[prev.length - 1])])}
                >
                    New
                </button>
            </div>
            <div class="palette-container">
                <p>Palette</p>

                <Palette
                    activeColor={activeColorIdx}
                    palette={paletteHex}
                    onColorSelect={setActiveColorIdx}
                />
            </div>

            <div class="color-container">
                <p>Current selected color</p>

                <div class="active-color">
                    <div class="color-info">
                        <div
                            class="palette-index"
                            data-background={activeColorHex}
                            style={{
                                width: 64,
                                height: 64,
                            }}
                        />
                    </div>
                    <div class="color-input">
                        <div>
                            R ({activeColorRgb.r})
                            <input
                                type='range'
                                value={activeColorRgb.r}
                                min={0} max={31}
                                onInput={event => onColorChange('r', parseInt(event.currentTarget.value))}
                            />
                        </div>
                        <div>
                            G ({activeColorRgb.g})
                            <input
                                type='range'
                                value={activeColorRgb.g}
                                min={0} max={31}
                                onInput={event => onColorChange('g', parseInt(event.currentTarget.value))}
                            />
                        </div>
                        <div>
                            B ({activeColorRgb.b})
                            <input
                                type='range'
                                value={activeColorRgb.b}
                                min={0} max={31}
                                onInput={event => onColorChange('b', parseInt(event.currentTarget.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="map-container">
                <p>Tile Map</p>

                <Map
                    map={map}
                    brush={brush}
                    sprites={sprites}
                    palette={activePaletteHex}
                    onChange={(x, y, tile) => {
                        setMap(prev => {
                            const newMap = copy(prev);
                            newMap[y][x] = copy(tile);
                            return newMap;
                        });
                    }}
                    onCreate={(width, height) => {
                        setMap(new Array(height).fill(0).map(() => new Array(width).fill(0).map(() => ({ spriteIdx: 0, flip: { v: false, h: false } }))));
                    }}
                />
            </div>

            <div class="combiner-container">
                <p>Brush/Combiner</p>

                <Combiner
                    combiner={brush}
                    sprites={sprites}
                    palette={activePaletteHex}
                    onUpdate={setBrush}
                />
            </div>
        </div>
    );
}