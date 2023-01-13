export function times<T>(n: number, fn: (i: number) => T): T[] {
    let results: T[] = [];
    for (let i = 0; i < n; i++)
    {
        results.push(fn(i));
    }
    return results;
}

export function split<T>(groupsOf: number, arr: T[]): T[][] {
    let results: T[][] = [];
    let accum: T[] = [];
    for (let i = 0; i < arr.length; i++) {
        if (accum.length === groupsOf) {
            results.push([... accum ]);
            accum = [];
        }
        accum.push(arr[i]);
    }
    return results;
}

export function classes(arr: Array<string | undefined | null>): string {
    return arr.filter((v) => !!v).join(" ");
}