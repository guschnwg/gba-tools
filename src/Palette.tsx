import { chunks } from "./utils";

export function Palette({
    palette,
    activeColor,
    onColorSelect,
}: {
    palette: ({ r: number, g: number, b: number } | string)[]
    activeColor?: number,
    onColorSelect?: (colorIdx: number) => void
}) {
    const chunksOf = 16;
    const activePaletteIdx = activeColor != null ? Math.floor(activeColor / chunksOf) : -1;
    const activeColorIdx = activeColor != null ? activeColor % chunksOf : -1;

    return (
        <div class="palette">
            {chunks(palette, chunksOf).map((row, rowIdx) => (
                <div
                    key={rowIdx}
                    style={{
                        background: activePaletteIdx == rowIdx ? 'lightgray' : 'unset',
                    }}
                >
                    {row.map((item, colIdx) => (
                        <div
                            class="palette-index"
                            data-background={item}
                            style={{
                                boxShadow: `0px 0px 1px 1px ${activePaletteIdx == rowIdx && activeColorIdx == colIdx ? 'red' : 'white'} inset`,
                            }}
                            onClick={() => onColorSelect?.(rowIdx * chunksOf + colIdx)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}