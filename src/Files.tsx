import { useState } from "preact/hooks";
import { chunks } from "./utils";
import { Tile } from "./Map";

function mapToHeader(name: string, map: Tile[][]) {
    return map.length ? `#define ${name}Width  ${map[0].length * 8}
#define ${name}Height ${map.length * 8}

#define ${name}MapDefinedLen 1024
#define ${name}MapLen ${name}MapDefinedLen * 4
extern const unsigned short ${name}Map[${name}MapDefinedLen * 2];` : '';
}

function headerFile(name: string, sprites: number[][][], map: Tile[][]) {
    return `#ifndef SHEET_${name.toUpperCase()}_H
#define SHEET_${name.toUpperCase()}_H

#define ${name}SpritesDefinedLen ${sprites.length}
#define ${name}TilesLen ${name}SpritesDefinedLen * 8 * 4
extern const unsigned int ${name}Tiles[${name}SpritesDefinedLen * 8];

${mapToHeader(name, map)}

#define ${name}PalLen 512
extern const unsigned short ${name}Pal[256];

#endif`
}

function spritesToAssembly(sprites: number[][][]): string {
    return sprites.map(sprite => {
        return '    .word ' + sprite.map(row => '0x' + row.map(c => c.toString(16).toUpperCase()).reverse().join('')).join(',')
    }).join('\n')
}

function paletteToAssembly(palette: { r: number, g: number, b: number }[]): string {
    return chunks(palette, 8).map(colors => {
        const formatted = colors.map(item => (item.r & 0b11111) | ((item.g & 0b11111) << 5) | ((item.b & 0b11111) << 10));
        return `    .hword ` + formatted.map(color => '0x' + color.toString(16).toUpperCase().padStart(4, '0')).join(',')
    }).join('\n');
}

function mapToAssembly(name: string, map: Tile[][]): string {
    if (!map.length) return '';

    const rows = chunks(map.flat(), 8).map(tile => {
        const formatted = tile.map(item => (item.spriteIdx & 0b1111111111) | (Number(item.flip.h) << 10) | (Number(item.flip.v) << 11));
        return `    .hword ` + formatted.map(color => '0x' + color.toString(16).toUpperCase().padStart(4, '0')).join(',')
    });

    return `    .section .rodata
    .align	2
    .global ${name}Map
    .hidden ${name}Map
${name}Map:
${rows.join('\n')}`
}

function assemblyFile(name: string, sprites: number[][][], palette: { r: number, g: number, b: number }[], map: Tile[][]) {
    return `    .section .rodata
    .align 2
    .global ${name}Tiles
    .hidden ${name}Tiles
${name}Tiles:
${spritesToAssembly(sprites)}

${mapToAssembly(name, map)}

    .section .rodata
    .align 2
    .global ${name}Pal
    .hidden ${name}Pal
${name}Pal:
${paletteToAssembly(palette)}`
}

function mainFile(name: string, map: Tile[][]) {
    return `#include <tonc.h>
#include "images/${name}.h"
#include <string.h>

OBJ_ATTR obj_buffer[128];

int main() {
    REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D | DCNT_BG2;
    ${map.length ? 'REG_BG2CNT = BG_CBB(0) | BG_SBB(2) | BG_4BPP | BG_REG_32x32;' : ''}

    memcpy32(&tile_mem[4][0], ${name}Tiles, ${name}TilesLen / sizeof(u32));
    memcpy16(&pal_obj_mem[0], ${name}Pal, ${name}PalLen / sizeof(u16));

    ${map.length ? `memcpy(pal_bg_mem, ${name}Pal, ${name}PalLen);` : ''}
    ${map.length ? `memcpy(&tile_mem[0][0], ${name}Tiles, ${name}TilesLen);` : ''}
    ${map.length ? `memcpy(&se_mem[2][0], ${name}Map, ${name}MapLen);` : ''}

    oam_init(obj_buffer, 128);

    for (int i = 0 ; i < ${name}SpritesDefinedLen ; i++) {
        OBJ_ATTR* obj = &obj_buffer[i];
        obj_set_attr(obj, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_BUILD(i, 0, 0));
        obj_set_pos(obj, i * 8, 0);
    }

    while(1) {
        vid_vsync();

        oam_copy(oam_mem, obj_buffer, 128);
    }
}`
}

export function saveToLocalStorage(sprites: number[][][], palette: { r: number, g: number, b: number }[], map: Tile[][]) {
    window.localStorage.setItem('header', headerFile('autosave', sprites, map));
    window.localStorage.setItem('assembly', assemblyFile('autosave', sprites, palette, map));
}

export function File({ name, content }: { name: string, content: string }) {
    return (
        <div class="file">
            <span>{name}</span>
            <pre>{content}</pre>
            <button
                onClick={event => {
                    navigator.clipboard.writeText(content)
                    const target = event.currentTarget;
                    target.textContent = 'Copied!!';

                    setTimeout(() => {
                        target.textContent = 'Copy to clipboard';
                    }, 1000);
                }}
            >
                Copy to clipboard
            </button>
        </div>
    )
}

export function Files({
    name,
    sprites,
    palette,
    map,
    onChangeName
}: {
    name: string,
    sprites: number[][][],
    palette: { r: number, g: number, b: number }[],
    map: Tile[][],
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
                        name={name + ".g"}
                        content={headerFile(name, sprites, map)}
                    />
                    <File
                        name={name + ".s"}
                        content={assemblyFile(name, sprites, palette, map)}
                    />
                    <File
                        name="main.c"
                        content={mainFile(name, map)}
                    />
                </div>

                <button commandfor="files-dialog" command="close">
                    Close
                </button>
            </dialog>
        </>
    );
}