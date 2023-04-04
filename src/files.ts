export function downloadFile(filename: string, content: string) {
    // https://stackoverflow.com/a/18197341/788168
    const element = document.createElement("a");
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element)
}

export async function readFile(file: File): Promise<string> {
    return new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target) {
                // Rejecting for unknown reason.
                rej();
                return;
            }
            const contents = e.target.result as string;
            res(contents);
        };
        reader.onerror = (e) => {
            rej(e.target?.error);
        }
        reader.readAsText(file);
    });
}