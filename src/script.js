function setArrayValue(array, indices, value, emptyValue) {
    let currentArray = array;
    for (let i = 0; i < indices.length - 1; i++) {
        while (currentArray.length <= indices[i]) {
            currentArray.push([]);
        }
        currentArray = currentArray[indices[i]];
    }
    while (currentArray.length <= indices[indices.length - 1]) {
        currentArray.push(emptyValue);
    }
    currentArray[indices[indices.length - 1]] = value;
}

function getArrayValue(array, indices, emptyValue) {
    let current = array;
    for (let index of indices) {
        if (current.length <= index) {
            return emptyValue;
        }
        current = current[index];
    }
    return current;
}

function parseTableGroup(group) {
    let result = [];
    let taken = [];
    let rowNumber = 0;
    for (let row of group.children) {
        if (window.getComputedStyle(row).display != "none" && row.tagName == "TR") {
            let colNumber = 0;
            for (let cell of row.children) {
                if (window.getComputedStyle(cell).display != "none" && (cell.tagName == "TH" || cell.tagName == "TD")) {
                    while (getArrayValue(taken, [rowNumber, colNumber], false)) {
                        colNumber++;
                    }
                    setArrayValue(result, [rowNumber, colNumber], cell.innerText, null);
                    for (let rowSpan = 0; rowSpan < cell.rowSpan; rowSpan++) {
                        for (let colSpan = 0; colSpan < cell.colSpan; colSpan++) {
                            setArrayValue(taken, [rowNumber + rowSpan, colNumber + colSpan], true, false);
                        }
                    }
                    colNumber++;
                }
            }
            rowNumber++;
        }
    }
    return result;
}

function parseTable(table) {
    let result = [];
    for (let group of table.children) {
        if (window.getComputedStyle(group).display != "none" && (group.tagName == "THEAD" || group.tagName == "TBODY" || group.tagName == "TFOOT")) {
            result.push(parseTableGroup(group))
        }
    }
    return result;
}

function arrayToCsv(array) {
    let rows = [];
    for (let row of array) {
        let cells = [];
        for (let cell of row) {
            if (cell == null) {
                cells.push(null);
            } else {
                cells.push("\"" + cell.replaceAll("\"", "\"\"") + "\"");
            }
        }
        rows.push(cells.join(","));
    }
    return rows.join("\n");
}

function parsedTableToCsv(parsedTable) {
    let result = [];
    for (let group of parsedTable) {
        result.push(arrayToCsv(group));
    }
    return result.join("\n");
}

function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadData(data, type, name) {
    let blob = new Blob([data], { type });
    let url = window.URL.createObjectURL(blob);
    downloadURI(url, name);
    window.URL.revokeObjectURL(url);
}

function getOffsetTop(element) {
    if (element.offsetParent != null) {
        return getOffsetTop(element.offsetParent) + element.offsetTop;
    }
    return element.offsetTop;
}

function getOffsetLeft(element) {
    if (element.offsetParent != null) {
        return getOffsetLeft(element.offsetParent) + element.offsetLeft;
    }
    return element.offsetLeft;
}

function startPicking() {
    pickAction = null;

    let tables = document.getElementsByTagName("table");
    let stopPicking = null;

    let backgroundOverlay = document.createElement("div");
    backgroundOverlay.style.left = "0";
    backgroundOverlay.style.top = "0";
    backgroundOverlay.style.width = "100%";
    backgroundOverlay.style.height = "100%";
    backgroundOverlay.style.position = "fixed";
    backgroundOverlay.style.zIndex = Number.MAX_SAFE_INTEGER;
    backgroundOverlay.style.backgroundColor = "rgba(0,0,0,0.3)";
    backgroundOverlay.addEventListener("click", function (event) {
        stopPicking();
    });
    document.body.appendChild(backgroundOverlay);

    let overlays = [];
    for (let table of tables) {
        let overlay = document.createElement("div");
        overlay.style.left = getOffsetLeft(table) + "px";
        overlay.style.top = getOffsetTop(table) + "px";
        overlay.style.width = table.offsetWidth + "px";
        overlay.style.height = table.offsetHeight + "px";
        overlay.style.position = "absolute";
        overlay.style.zIndex = Number.MAX_SAFE_INTEGER;
        overlay.style.backgroundColor = "rgba(255,0,0,0.1)";
        overlay.addEventListener("mouseenter", function (event) {
            overlay.style.backgroundColor = "rgba(255,0,0,0.2)";
        });
        overlay.addEventListener("mouseleave", function (event) {
            overlay.style.backgroundColor = "rgba(255,0,0,0.1)";
        });
        overlay.addEventListener("click", function (event) {
            let parsedTable = parseTable(table);
            let resultCsv = parsedTableToCsv(parsedTable);
            downloadData(resultCsv, "text/csv", "HtmlTable.csv");
            stopPicking();
        });
        document.body.appendChild(overlay);
        overlays.push(overlay);
    }

    let keydownListener = function (event) {
        if (event.key == "Escape") {
            stopPicking();
        }
    };
    document.addEventListener("keydown", keydownListener);

    stopPicking = function () {
        document.removeEventListener("keydown", keydownListener);
        document.body.removeChild(backgroundOverlay);
        for (let overlay of overlays) {
            document.body.removeChild(overlay);
        }
        pickAction = startPicking;
    };
}

let pickAction = startPicking;

browser.runtime.onMessage.addListener(function (message) {
    pickAction();
});
