function IsTableCell(el: Element): el is HTMLTableCellElement {
    return el.tagName === "TD";
}

function IsTableRow(el: Element): el is HTMLTableRowElement {
    return el.tagName === "TR";
}

export function GetColumnIndex(el: HTMLTableCellElement): number {
    const row = el.parentElement;
    if (!row || !IsTableRow(row)) {
        throw new Error(`Row is not a row '${row}'`);
    }

    let currentColIndex = 0;
    let currentCol = row.firstElementChild;
    while (currentCol && IsTableCell(currentCol)) {
        if (currentCol === el) {
            return currentColIndex;
        }
        currentColIndex += currentCol.colSpan;
        currentCol = currentCol.nextElementSibling;
    }

    throw new Error(`Could not find column for ${el}`);
}

export function TryGetColumnForRow(row: HTMLTableRowElement, columnIndex: number): HTMLTableCellElement | null {
    let currentColIndex = 0;
    let currentCol = row.firstElementChild;
    while (currentCol && IsTableCell(currentCol)) {
        if (currentColIndex >= columnIndex) {
            // console.log("Found", currentCol);
            return currentCol;
        }
        currentColIndex += currentCol.colSpan;
        currentCol = currentCol.nextElementSibling;
    }

    return null;
}

export function navigateTable(el: HTMLTableCellElement, dir: {x: number, y: number}): HTMLTableCellElement | null {
    if (dir.x && dir.y) {
        // TODO: unhandled.
        return null;
    }

    if (dir.x) {
        const isBackward = dir.x < 0;
        let focusCell: HTMLTableCellElement | null = el;
        for (let i = 0; i < Math.abs(dir.x); i++) {
            // TODO: null should wrap to previous row.
            // TODO: column spans for completeness.
            let nextElement: Element | null = (isBackward)
                ? focusCell?.previousElementSibling || null
                : focusCell?.nextElementSibling || null;
            if (nextElement && IsTableCell(nextElement)) {
                focusCell = nextElement;
            } else {
                focusCell = null;
            }
        }
        // console.log(focusCell);
        return focusCell;
    } else if (dir.y) {
        const isBackward = dir.y < 0;

        const colIndex = GetColumnIndex(el);
        // console.log(colIndex);

        const row = el.parentElement;
        if (!row || !IsTableRow(row)) {
            throw new Error(`Row is not a row '${row}'`);
        }

        let currentRow: HTMLTableRowElement | null = row;
        for (let i = 0; i < Math.abs(dir.y); i++) {
            let nextRow: Element | null = (isBackward)
                ? currentRow?.previousElementSibling || null
                : currentRow?.nextElementSibling || null;
            if (nextRow && IsTableRow(nextRow)) {
                currentRow = nextRow;
            } else {
                currentRow = null;
            }
        }

        if (!currentRow) {
            return null;
        }

        return TryGetColumnForRow(currentRow, colIndex);
    } else {
        // Both are 0.
        return el;
    }
}