
export function LoadFromFile({ content, accept, onChange }: { content: string; accept: string; onChange: (newContent: string) => void; }) {
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
                    }} />
                <button
                    onClick={async (event) => {
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
                onChange={event => onChange((event.target as HTMLTextAreaElement).value)} />
        </div>
    );
}
