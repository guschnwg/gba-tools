import { File, paletteToAssembly } from "./SpriteSheetFiles";
import { chunks } from "./utils";

function headerFile(name: string, palette: { r: number, g: number, b: number }[], bitmap: number[][]) {
    // TBD!!!
    return `#ifndef BITMAP_${name.toUpperCase()}_H
#define BITMAP_${name.toUpperCase()}_H

#define ${name}Width 240
#define ${name}Height 160
#define ${name}BitmapDefinedLen ${name}Width * ${name}Height
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

export function saveToLocalStorage(palette: { r: number, g: number, b: number }[], bitmap: number[][]) {
    window.localStorage.setItem('bitmap-header', headerFile('autosave', palette, bitmap));
    window.localStorage.setItem('bitmap-assembly', assemblyFile('autosave', palette, bitmap));
}

export function BitmapFiles({
    name,
    palette,
    bitmap,
    onChangeName,
}: {
    name: string
    palette: { r: number, g: number, b: number }[]
    bitmap: number[][],
    onChangeName: (name: string) => void
}) {
    return (
        <>
            <button command="show-modal" commandfor="files-dialog">
                Show Files
            </button>

            <dialog id="files-dialog">
                <div>
                    Name:
                    <input type='text' value={name} onChange={event => onChangeName((event.target as HTMLInputElement).value)} />
                </div>

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

                <button commandfor="files-dialog" command="close">
                    Close
                </button>
            </dialog>

        </>
    )
}