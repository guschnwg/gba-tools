import { useState } from "preact/hooks";
import { Sprite } from "./Sprite";
import { copy } from "./utils";
import { Tile } from "./Map";

export function Combiner({
    combiner,
    sprites,
    palette,
    onUpdate,
}: {
    combiner: Tile[][],
    sprites: number[][][],
    palette: string[],
    onUpdate: (newCombiner: Tile[][]) => void
}) {
    const [size, setSize] = useState(4);

    return (
        <div class="combiner">
            <div class="combiner-actions">
                <div>
                    <button disabled={size === 1} onClick={() => setSize(prev => prev - 1)}>-</button>
                    Size ({size})
                    <button onClick={() => setSize(prev => prev + 1)}>+</button>
                </div>

                <button
                    onClick={() => onUpdate(copy(combiner).map(row => [...row, copy(row[row.length - 1])]))}
                >+ Col</button>
                <button
                    disabled={combiner[0].length === 1}
                    onClick={() => onUpdate(copy(combiner).map(row => row.slice(0, row.length - 1)))}
                >- Col</button>
                <button
                    onClick={() => onUpdate([...copy(combiner), copy(combiner[combiner.length - 1])])}
                >+ Row</button>
                <button
                    disabled={combiner.length === 1}
                    onClick={() => onUpdate(copy(combiner).slice(0, combiner.length - 1))}
                >- Row</button>
            </div>

            <div class="combiner-matrix">
                <div class="combiner-rows">
                    {combiner.map((row, rowIdx) => (
                        <div class="combiner-cols">
                            {row.map(({ spriteIdx, flip }, colIdx) => (
                                <>
                                    <Sprite
                                        key={spriteIdx}
                                        size={size}
                                        sprite={sprites[spriteIdx]}
                                        flip={flip}
                                        palette={palette}
                                        onClick={event => {
                                            const popover = event.currentTarget.nextSibling as HTMLDialogElement;
                                            popover.togglePopover();
                                        }}
                                    />
                                    <dialog
                                        id={`popover-${rowIdx}-${colIdx}`}
                                        class="combiner-popover"
                                        popover
                                    >
                                        <div>
                                            Sprite {spriteIdx}:
                                            <input
                                                type="range"
                                                value={spriteIdx}
                                                min={0}
                                                max={sprites.length - 1}
                                                onInput={event => {
                                                    const newCombiner = copy(combiner);
                                                    newCombiner[rowIdx][colIdx].spriteIdx = parseInt(event.currentTarget.value);
                                                    onUpdate(newCombiner);
                                                }}
                                            />
                                        </div>

                                        <div>
                                            Flip H:
                                            <input
                                                type="checkbox"
                                                checked={flip.h}
                                                onChange={event => {
                                                    const newCombiner = copy(combiner);
                                                    newCombiner[rowIdx][colIdx].flip.h = event.currentTarget.checked;
                                                    onUpdate(newCombiner);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            Flip V:
                                            <input
                                                type="checkbox"
                                                checked={flip.v}
                                                onChange={event => {
                                                    const newCombiner = copy(combiner);
                                                    newCombiner[rowIdx][colIdx].flip.v = event.currentTarget.checked;
                                                    onUpdate(newCombiner);
                                                }}
                                            />
                                        </div>
                                    </dialog>
                                </>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}