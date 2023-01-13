import dayjs from 'dayjs'
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

export function persist_startDate(value: dayjs.Dayjs) {
    localStorage.setItem("StartDate", value.format("YYYY-MM"));
}

export function load_startDate(): dayjs.Dayjs {
    return dayjs(localStorage.getItem("StartDate") || "2017-08", "YYYY-MM");
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