export function times<T>(n: number, fn: (i: number) => T): T[] {
    let results: T[] = [];
    for (let i = 0; i < n; i++)
    {
        results.push(fn(i));
    }
    return results;
}