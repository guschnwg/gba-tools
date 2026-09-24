import { useMemo, useRef, useState } from "preact/hooks";
import { chunks } from "./utils";
import { Tile } from "./Map";

const DEFAULT_HEADER = `#ifndef SHEET_SPRITES_H
#define SHEET_SPRITES_H

#define spritesDefinedLen 16
#define spritesTilesLen spritesDefinedLen * 8 * 4
extern const unsigned int spritesTiles[spritesDefinedLen * 8];

#define spritesPalLen 512
extern const unsigned short spritesPal[256];

#endif`;

const DEFAULT_ASM = `	.section .rodata
    .align 2
    .global spritesTiles		@ 256 unsigned chars
    .hidden spritesTiles
spritesTiles:
    .word 0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC
    .word 0xFFFFFFFF,0xFFFFFFFF,0xFFFFFFFF,0xFFFFFFFF,0xFFFFFFFF,0xFFFFFFFF,0xFFFFFFFF,0xFFFFFFFF
    .word 0x99999999,0x99999999,0x99999999,0x99999999,0x99999999,0x99999999,0x99999999,0x99999999
    .word 0xDDDDDDDD,0xDDDDDDDD,0xDDDDDDDD,0xDDDDDDDD,0xDDDDDDDD,0xDDDDDDDD,0xDDDDDDDD,0xDDDDDDDD
    .word 0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111
    .word 0x22222222,0x22222222,0x22222222,0x22222222,0x22222222,0x22222222,0x22222222,0x22222222
    .word 0x55555555,0x55555555,0x55555555,0x55555555,0x55555555,0x55555555,0x55555555,0x55555555
    .word 0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111
    .word 0xAAAAAAAA,0xAAAAAAAA,0xAAAAAAAA,0xAAAAAAAA,0xAAAAAAAA,0xAAAAAAAA,0xAAAAAAAA,0xAAAAAAAA
    .word 0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111,0x11111111
    .word 0xEEEEEEEE,0xEEEEEEEE,0xEEEEEEEE,0xEEEEEEEE,0xEEEEEEEE,0xEEEEEEEE,0xEEEEEEEE,0xEEEEEEEE
    .word 0x22222222,0x22222222,0x22222222,0x22222222,0x22222222,0x22222222,0x22222222,0x22222222
    .word 0x33333333,0x33333333,0x33333333,0x33333333,0x33333333,0x33333333,0x33333333,0x33333333
    .word 0x99999999,0x99999999,0x99999999,0x99999999,0x99999999,0x99999999,0x99999999,0x99999999
    .word 0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC,0xCCCCCCCC
    .word 0x44444444,0x44444444,0x44444444,0x44444444,0x44444444,0x44444444,0x44444444,0x44444444

    .section .rodata
    .align 2
    .global spritesPal		@ 512 unsigned chars
    .hidden spritesPal
spritesPal:
    .hword 0x17BF,0x6338,0x4976,0x2CF1,0x41F0,0x4497,0x3E04,0x2A64
    .hword 0x7BC0,0x1BDF,0x2718,0x7730,0x6228,0x59F8,0x02BC,0x2EF1
    .hword 0x0D49,0x54D7,0x1611,0x0C25,0x7AA4,0x7344,0x565D,0x46B1
    .hword 0x120B,0x569A,0x7D4E,0x42DC,0x4160,0x7891,0x1A33,0x74EB
    .hword 0x2596,0x5DCC,0x60ED,0x18F5,0x07C5,0x7810,0x6638,0x2848
    .hword 0x3341,0x586E,0x6D8D,0x266C,0x48FD,0x3F41,0x4ECA,0x79DB
    .hword 0x714C,0x2CBD,0x6A85,0x7FE0,0x4AE2,0x31D9,0x04A9,0x21CC
    .hword 0x178A,0x7C1F,0x2783,0x411B,0x4AC4,0x5D3C,0x2E5A,0x01C0
    .hword 0x5DAF,0x26B0,0x5462,0x241A,0x1A18,0x226E,0x3509,0x2DE1
    .hword 0x7274,0x6D7E,0x20AC,0x2226,0x0F87,0x4D2D,0x5D0E,0x7153
    .hword 0x0164,0x5227,0x45F2,0x167B,0x638F,0x2D51,0x71F5,0x3BE9
    .hword 0x0B27,0x7B91,0x0EF4,0x469A,0x2314,0x58BB,0x0DB4,0x050B
    .hword 0x4605,0x7CDD,0x543D,0x184E,0x5856,0x2279,0x5930,0x37F7
    .hword 0x457B,0x2744,0x5D9F,0x2972,0x65A7,0x65AA,0x0353,0x45D7
    .hword 0x7D7D,0x5E7C,0x7506,0x1645,0x0FF5,0x157E,0x79BC,0x618F
    .hword 0x5A7C,0x53B3,0x4EBA,0x48BA,0x5173,0x2C00,0x6D8A,0x1EF6
    .hword 0x1F1A,0x5084,0x2C81,0x53C9,0x632B,0x4BE5,0x555D,0x3019
    .hword 0x2D12,0x594E,0x24EA,0x6EA2,0x3FE2,0x6FAC,0x450F,0x69D9
    .hword 0x2CEB,0x3B7C,0x6618,0x0A08,0x2018,0x332D,0x3ACC,0x3A70
    .hword 0x6D28,0x3ED7,0x026E,0x5F82,0x753D,0x05A4,0x1A5F,0x7D11
    .hword 0x2318,0x46EB,0x2FFB,0x69BF,0x093D,0x14A7,0x327F,0x0137
    .hword 0x146A,0x410C,0x16D3,0x04C0,0x4485,0x4DE5,0x36C2,0x4E4A
    .hword 0x458B,0x5910,0x5C3A,0x1E6B,0x243F,0x082B,0x77D5,0x215F
    .hword 0x00A0,0x74B7,0x5ACC,0x45FC,0x528F,0x4222,0x3D5D,0x1429
    .hword 0x3262,0x5D9A,0x6D4F,0x4E45,0x64D3,0x3753,0x4566,0x2AA2
    .hword 0x7B8D,0x5233,0x2AE9,0x5538,0x7469,0x4C7D,0x2324,0x36B6
    .hword 0x08B4,0x4769,0x6541,0x38E4,0x44DF,0x37B0,0x778D,0x10F3
    .hword 0x6ACC,0x2A77,0x2030,0x3A10,0x2D4D,0x7371,0x43FD,0x38BC
    .hword 0x2ACE,0x7FE8,0x0EFF,0x5215,0x3835,0x73C2,0x3213,0x7D18
    .hword 0x694F,0x7DE3,0x2F03,0x7B25,0x705A,0x1D84,0x2F83,0x0D2D
    .hword 0x1B89,0x428D,0x7E77,0x4942,0x072B,0x7602,0x0A02,0x01F7
    .hword 0x03C7,0x6A5D,0x70FC,0x403F,0x29FB,0x0591,0x0BE1,0x425F`;

function assemblyToSprites(assembly: string): number[][][] {
    const tilesData = assembly.split('.section')[1].split('Tiles:')[1];
    const rows = tilesData.trim().split('\n').map(r => r.trim()).filter(Boolean);
    const spritesInGBAHex = chunks(rows.map(r => r.split(' ')[1].split(',')).flat(), 8);

    return spritesInGBAHex.map(sprite => {
        return sprite.map((item) => item.replace('0x', '').split('').map(col => parseInt(col, 16)).reverse());
    });
}

function assemblyToPalette(assembly: string): { r: number, g: number, b: number }[] {
    const paletteData = assembly.split('Pal:')[1];
    const rows = paletteData.trim().split('\n').map(r => r.trim()).filter(Boolean);
    const paletteInGBAHex = rows.map(r => r.split(' ')[1].split(',')).flat()
    return paletteInGBAHex.map(color => {
        const asNumber = parseInt(color, 16);
        return {
            r: asNumber & 0b11111,
            g: (asNumber >> 5) & 0b11111,
            b: (asNumber >> 10) & 0b11111,
        }
    });
}

function assemblyToMap(assembly: string): Tile[] {
    const sections = assembly.split('.section .rodata').map(s => s.trim()).filter(Boolean);
    const mapData = sections.find(s => s.includes('Map:'));
    if (!mapData) return [];

    const rows = mapData.split('Map:')[1].trim().split('\n').map(r => r.trim()).filter(Boolean);
    const tiles = rows.map(r => r.split(' ')[1].split(',')).flat()
    return tiles.map(tile => {
        const parsed = parseInt(tile, 16);
        return {
            spriteIdx: parsed & 0b001111111111,
            flip: {
                v: Boolean(parsed & 0b010000000000),
                h: Boolean(parsed & 0b100000000000)
            }
        };
    });
}

export function LoadFromFile({ content, accept, onChange }: { content: string, accept: string, onChange: (newContent: string) => void }) {
    return (
        <div class="load-from-file">
            <div>
                {accept} file

                <input
                    type="file"
                    accept={accept}
                    multiple={false}
                    onChange={event => {
                        const file = (event.target as HTMLInputElement).files![0];
                        let reader = new FileReader();
                        reader.addEventListener('loadend', event => onChange(event.target!.result! as string));
                        reader.readAsText(file);
                    }}
                />
                <button
                    onClick={async event => {
                        const target = event.currentTarget;

                        const newContent = await navigator.clipboard.readText();

                        target.textContent = 'Pasted!!';
                        onChange(newContent);

                        setTimeout(() => {
                            target.textContent = 'Paste from clipboard';
                        }, 1000);
                    }}
                >
                    Paste from clipboard
                </button>
            </div>
            <textarea
                value={content}
                onChange={event => onChange((event.target as HTMLTextAreaElement).value)}
            />
        </div>
    )
}

export function LoadFromFiles({
    onLoad
}: {
    onLoad: (sprites: number[][][], palette: { r: number, g: number, b: number }[], map: Tile[][]) => void
}) {
    const [type, setType] = useState<'random' | 'storage' | 'files'>('random');

    const [header, setHeader] = useState(DEFAULT_HEADER);
    const [assembly, setAssembly] = useState(DEFAULT_ASM);

    const spritesLen = useMemo(() => {
        if (!header) return 0;
        const firstTry = new RegExp(/SpritesDefinedLen (\d+)/g).exec(header);
        if (firstTry && firstTry[0] && firstTry[1]) return parseInt(firstTry[1]);

        const secondTry = new RegExp(/Tiles\[(\d+)\];/g).exec(header);
        if (secondTry && secondTry[0] && secondTry[1]) return parseInt(secondTry[1]) / 8;

        return 0;
    }, [header]);

    const sprites = useMemo<number[][][]>(() => {
        if (!spritesLen) return [];
        if (!assembly) return [];
        return assemblyToSprites(assembly);
    }, [spritesLen, assembly]);

    const palette = useMemo<{ r: number, g: number, b: number }[]>(() => {
        if (!assembly) return [];
        return assemblyToPalette(assembly);
    }, [assembly]);

    const mapLen = useMemo(() => {
        if (!header) return 0;
        const firstTry = new RegExp(/MapDefinedLen (\d+)/g).exec(header);
        if (firstTry && firstTry[0] && firstTry[1]) return parseInt(firstTry[1]);

        return 0;
    }, [header]);

    const map = useMemo<Tile[][]>(() => {
        if (!mapLen) return [];
        if (!assembly) return [];
        // TODO: handle uneven maps
        const dimensions = Math.sqrt(mapLen);
        return chunks(assemblyToMap(assembly), dimensions);
    }, [mapLen, assembly]);

    return (
        <>
            <div>
                <input
                    type="radio"
                    id="load-from-random"
                    checked={type === 'random'}
                    onChange={() => setType('random')}
                />
                <label for="load-from-random">new</label>

                <input
                    type="radio"
                    id="load-from-files"
                    checked={type === 'files'}
                    onChange={() => {
                        setType('files');
                    }}
                />
                <label for="load-from-files">files</label>

                <input
                    type="radio"
                    id="load-from-storage"
                    disabled={!Boolean(window.localStorage.getItem("assembly")) && !Boolean(window.localStorage.getItem("header"))}
                    checked={type === 'storage'}
                    onChange={() => {
                        setHeader(window.localStorage.getItem("header")!);
                        setAssembly(window.localStorage.getItem("assembly")!);
                        setType('storage');
                    }}
                />
                <label for="load-from-storage">storage</label>
            </div>

            {type === 'files' && (
                <div class="load-from-files-container">
                    <div class="load-from-files">
                        <LoadFromFile
                            content={header}
                            accept=".h"
                            onChange={setHeader}
                        />

                        <LoadFromFile
                            content={assembly}
                            accept=".s"
                            onChange={setAssembly}
                        />
                    </div>

                    <div class="load-summary">
                        <span>Expected sprites from header: {spritesLen}</span>
                        <span>Sprites parsed in asm: {sprites.length}</span>
                        <span>Palettes parsed in asm: {palette.length}</span>
                        <span>Expected map tiles from header: {mapLen}</span>
                        <span>Map tiles parsed in asm: {map.length * (map.length ? map[0].length : 0)}</span>
                    </div>
                </div>
            )}

            <button
                onClick={() => onLoad(sprites, palette, map)}
            >
                Let's go!
            </button>
        </>
    );
}
