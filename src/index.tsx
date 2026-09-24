import { render } from 'preact';

import './style.css';
import { SpriteSheetCreator } from './SpriteSheetCreator';

function App() {
    return (
        <SpriteSheetCreator />
    )
}

render(<App />, document.getElementById('app')!);
