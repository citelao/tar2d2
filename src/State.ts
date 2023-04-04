import dayjs from 'dayjs'
import IDaysArray, { DaysArray } from "./DaysArray";

export function serialize_daysArray(value: IDaysArray, indent?: number): string
{
    return JSON.stringify(value, undefined, indent);
}

export function persist_daysArray(value: IDaysArray)
{
    localStorage.setItem("days", serialize_daysArray(value));
}

export function deserialize_daysArray(str: string): IDaysArray {
    const obj = JSON.parse(str);
    return DaysArray.parse(obj);
}

export function load_daysArray(): IDaysArray
{
    const read = localStorage.getItem("days");
    if (!read) {
        return [];
    }
    return deserialize_daysArray(read);
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