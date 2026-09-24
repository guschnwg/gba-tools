import { useEffect, useState } from "preact/hooks";
import { Sprite } from "./Sprite";

export function DuplicateSprite({
    current,
    sprites,
    palette,
    onSelect,
}: {
    current: number,
    sprites: number[][][],
    palette: string[]
    onSelect: (index: number) => void,
}) {
    const [selected, setSelected] = useState(current);

    useEffect(() => {
        setSelected(current);
    }, [current]);

    return (
        <>
            <button command="show-modal" commandfor="duplicate-dialog">
                Copy from
            </button>

            <dialog id="duplicate-dialog">
                {/* <select
                    value={selected}
                    onChange={event => setSelected(parseInt(event.currentTarget.value))}
                >
                    {sprites.map((s, idx) => <option key={idx} value={idx}>{idx}</option>)}
                </select> */}
                Sprite #{selected}
                <input
                    type="range"
                    value={selected}
                    min={0}
                    max={sprites.length - 1}
                    onInput={event => {
                        setSelected(parseInt(event.currentTarget.value))
                    }}
                />

                <Sprite
                    size={32}
                    sprite={sprites[selected]}
                    palette={palette}
                />

                <button commandfor="duplicate-dialog" command="close" onClick={() => onSelect(selected)}>
                    Clone
                </button>
                <button commandfor="duplicate-dialog" command="close">
                    Close
                </button>
            </dialog>
        </>
    );
}