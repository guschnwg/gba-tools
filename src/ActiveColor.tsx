export function ActiveColor({
    activeColorHex,
    activeColorRgb,
    onColorChange,
}: {
    activeColorHex: string
    activeColorRgb: { r: number; g: number; b: number; }
    onColorChange: (field: "r" | "g" | "b", value: number) => void
}) {
    return <div class="active-color">
        <div class="color-info">
            <div
                class="palette-index"
                data-background={activeColorHex}
                style={{
                    width: 64,
                    height: 64,
                }} />
        </div>
        <div class="color-input">
            <div>
                R ({activeColorRgb.r})
                <input
                    type='range'
                    value={activeColorRgb.r}
                    min={0} max={31}
                    onInput={event => onColorChange('r', parseInt(event.currentTarget.value))} />
            </div>
            <div>
                G ({activeColorRgb.g})
                <input
                    type='range'
                    value={activeColorRgb.g}
                    min={0} max={31}
                    onInput={event => onColorChange('g', parseInt(event.currentTarget.value))} />
            </div>
            <div>
                B ({activeColorRgb.b})
                <input
                    type='range'
                    value={activeColorRgb.b}
                    min={0} max={31}
                    onInput={event => onColorChange('b', parseInt(event.currentTarget.value))} />
            </div>
        </div>
    </div>;
}
