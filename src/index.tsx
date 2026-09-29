import { render } from 'preact';

import './style.css';
import { SpriteSheetCreator } from './SpriteSheetCreator';
import { BitmapCreator } from './BitmapCreator';
import { useState } from 'preact/hooks';

function App() {
    const [app, setApp] = useState<'bitmap' | 'spritesheet'>();

    if (!app) {
        return (
            <div>
                <button onClick={() => setApp('bitmap')}>Bitmap Mode 4</button>
                <button onClick={() => setApp('spritesheet')}>Spritesheet</button>
            </div>
        );
    }

    if (app === 'bitmap') return <BitmapCreator />;
    if (app === 'spritesheet') return <SpriteSheetCreator />;

    return null;
}

render(<App />, document.getElementById('app')!);
