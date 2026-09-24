export function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify((obj)));
}

export function emptySprite(tileSize: number, fill: number): number[][] {
    return new Array(tileSize).fill(new Array(tileSize).fill(fill));
}

export function emptySprites(quantity: number, tileSize: number) {
    return new Array(quantity).fill(0)
        .map(() => copy(
            emptySprite(tileSize, Math.floor(Math.random() * 16))
        ));
}

export function emptyPalette() {
    return new Array(256).fill(0).map(() => ({
        r: Math.floor(Math.random() * 32),
        g: Math.floor(Math.random() * 32),
        b: Math.floor(Math.random() * 32),
    }));
}

export function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number; } {
    let start = 0;
    if (hex.startsWith('#')) {
        start = 1;
    }

    const r = hex.slice(start, start + 2);
    const g = hex.slice(start + 2, start + 4);
    const b = hex.slice(start + 4, start + 6);

    return {
        r: Math.floor(parseInt(r, 16) / 8),
        g: Math.floor(parseInt(g, 16) / 8),
        b: Math.floor(parseInt(b, 16) / 8)
    };
}

export function chunks<T>(arr: Array<T>, chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const row = arr.slice(i, i + chunkSize);
        chunks.push([...row]);
    }
    return chunks;
}
