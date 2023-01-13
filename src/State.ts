import IDaysArray from "./DaysArray";

export function persist_daysArray(value: IDaysArray)
{
    localStorage.setItem("days", JSON.stringify(value));
}

export function load_daysArray(): IDaysArray
{
    const read = localStorage.getItem("days");
    if (!read) {
        return [];
    }
    return JSON.parse(read) as IDaysArray;
}

export function persist_startDate(value: string) {
    localStorage.setItem("StartDate", value);
}

export function load_startDate(): string {
    return localStorage.getItem("StartDate") || "2017-08";
}

export function persist_includingFloating(value: boolean) {
    localStorage.setItem("IncludingFloating", value ? "true" : "false");
}

export function load_includingFloating(): boolean {
    const result = localStorage.getItem("StartDate");
    if (result === null) {
        return true;
    }

    return result !== "false";
}