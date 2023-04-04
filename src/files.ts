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