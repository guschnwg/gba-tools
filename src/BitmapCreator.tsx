import { useMemo, useState } from "preact/hooks";
import { chunks, copy, emptyPalette, hexToRgb, rgbToHex } from "./utils";
import { Palette } from "./Palette";
import { ActiveColor } from "./ActiveColor";
import { Bitmap } from "./Bitmap";
import { File, paletteToAssembly } from "./Files";

function headerFile(name: string, palette: { r: number, g: number, b: number }[], bitmap: number[][]) {
    // TBD!!!
    return `#ifndef BITMAP_${name.toUpperCase()}_H
#define BITMAP_${name.toUpperCase()}_H

#define ${name}BitmapDefinedLen 38400
extern const unsigned int ${name}Bitmap[${name}BitmapDefinedLen];

#define ${name}PalLen 512
extern const unsigned short ${name}Pal[256];

#endif`
}

export function bitmapToAssembly(bitmap: number[][]): string {
    return chunks(bitmap.flat(), 32).map(colors => {
        const colorsChunks = chunks(colors, 4).map(colors2 => colors2.map(color => color.toString(16).toUpperCase().padStart(2, '0')).reverse().join(''));
        const formatted = colorsChunks.map(colors2 => '0x' + colors2);
        return `    .word ` + formatted.join(',');
    }).join('\n');
}

function assemblyFile(name: string, palette: { r: number, g: number, b: number }[], bitmap: number[][]) {
    return `    .section .rodata
    .align 2
    .global ${name}Bitmap
    .hidden ${name}Bitmap
${name}Bitmap:
${bitmapToAssembly(bitmap)}

    .section .rodata
    .align 2
    .global ${name}Pal
    .hidden ${name}Pal
${name}Pal:
${paletteToAssembly(palette)}`
}

function mainFile(name: string, bitmap: number[][]) {
    return `#include <tonc.h>
#include <string.h>
#include "images/${name}.h"

int splash() {
    REG_DISPCNT= DCNT_MODE4 | DCNT_BG2;

    memcpy(&se_mem[0][0], ${name}Bitmap, ${name}BitmapDefinedLen);
    memcpy16(&pal_bg_mem[0], ${name}Pal, ${name}PalLen/2);

    while(1) {}
}`
}


export function BitmapCreator() {
    // TODO: only 8bpp supported - support others?
    const [name, setName] = useState('splash_img');
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

    return (
        <div>
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

            <Bitmap
                bitmap={bitmap}
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

            <div class="files">
                <File
                    name={name + ".h"}
                    content={headerFile(name, palette, bitmap)}
                />
                <File
                    name={name + ".s"}
                    content={assemblyFile(name, palette, bitmap)}
                />
                <File
                    name="main.c"
                    content={mainFile(name, bitmap)}
                />
            </div>
        </div>
    );
}