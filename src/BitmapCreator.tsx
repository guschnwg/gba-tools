import { useMemo, useState } from "preact/hooks";
import { chunks, copy, emptyPalette, hexToRgb, rgbToHex } from "./utils";
import { Palette } from "./Palette";
import { ActiveColor } from "./ActiveColor";
import { Bitmap } from "./Bitmap";
import { File, paletteToAssembly } from "./SpriteSheetFiles";
import { BitmapFiles } from "./BitmapFiles";
import { BitmapLoadFromFiles } from "./BitmapLoadFromFiles";


export function BitmapCreator() {
    const [ready, setReady] = useState(false);
    const [showGrid, setShowGrid] = useState(false);

    // TODO: only 8bpp supported - support others?
    const [name, setName] = useState('splash_img');
    const [size, setSize] = useState(4);
    const width = 240;
    const height = 160;

    const [palette, setPalette] = useState<{ r: number, g: number, b: number }[]>(emptyPalette);
    const paletteHex = useMemo(() => palette.map(color => rgbToHex(color.r * 8, color.g * 8, color.b * 8)), [palette]);
    const [activeColorIdx, setActiveColorIdx] = useState(0);
    const activeColorHex = useMemo(() => paletteHex[activeColorIdx] || '#000', [paletteHex, activeColorIdx]);
    const activeColorRgb = useMemo(() => hexToRgb(activeColorHex), [activeColorHex]);

    const [bitmap, setBitmap] = useState<number[][]>(() => new Array(height).fill(new Array(width).fill(0)));

    const onColorChange = (field: 'r' | 'g' | 'b', value: number) => {
        const newActiveColor = copy(activeColorRgb);
        newActiveColor[field] = value;
        setPalette(prev => {
            const newPalette = copy(prev);
            newPalette[activeColorIdx] = newActiveColor;
            return newPalette;
        })
    }

    if (!ready) {
        return (
            <div>
                <p>Start with randomly generated data, load from files or load from browser cache</p>

                <BitmapLoadFromFiles
                    onLoad={(palette, bitmap) => {
                        setPalette(palette);
                        setBitmap(bitmap);
                        setReady(true);
                    }}
                />
            </div>
        );
    }

    return (
        <div class="bitmap-creator">
            <div id="header">
                <BitmapFiles
                    name={name}
                    palette={palette}
                    bitmap={bitmap}
                    onChangeName={setName}
                />
            </div>

            <div class="bitmap-content">
                <div class="bitmap-tools">
                    Size: {size}
                    <input
                        type="range"
                        value={size * 10}
                        min={0}
                        max={40}
                        onInput={event => {
                            setSize(parseInt(event.currentTarget.value) / 10)
                        }}
                    />

                    <ActiveColor
                        activeColorHex={activeColorHex}
                        activeColorRgb={activeColorRgb}
                        onColorChange={onColorChange}
                    />

                    <Palette
                        activeColor={activeColorIdx}
                        palette={paletteHex}
                        onColorSelect={setActiveColorIdx}
                    />
                </div>

                <Bitmap
                    bitmap={bitmap}
                    size={size}
                    palette={paletteHex}
                    activeColor={activeColorIdx}
                    onChange={(x, y) => {
                        setBitmap(prev => {
                            const newBitmap = copy(prev);
                            newBitmap[y][x] = activeColorIdx;
                            return newBitmap;
                        })
                    }}
                />
            </div>
        </div>
    );
}