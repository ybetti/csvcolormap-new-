let globalData = null;
let autoMinValue = Number.POSITIVE_INFINITY;
let autoMaxValue = Number.NEGATIVE_INFINITY;

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
        globalData = reader.result;
        calculateMinMax();
        updateColorMap();
    };
});

document.getElementById('fullscreenButton').addEventListener('click', function() {
    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write('<html><head><title>全体図</title></head><body></body></html>');
    const colorMapContainer = newWindow.document.body;
    const tableContainer = document.getElementById('colorMap').cloneNode(true);
    colorMapContainer.appendChild(tableContainer);
    const table = colorMapContainer.querySelector('table');
    table.style.transform = 'scale(0.1)';
    table.style.transformOrigin = 'top left';
    colorMapContainer.style.overflow = 'auto';
    newWindow.document.close();
});

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
    findMinValueCell();
    findTop3MinValueCells();
});

document.getElementById('applyButton').addEventListener('click', function() {
    const table = document.querySelector('table');
    if (table) {
        table.style.fontSize = '12px';
    }
});

function calculateMinMax() {
    if (!globalData) return;
    const lines = globalData.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach(cell => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                if (numericValue < autoMinValue) autoMinValue = numericValue;
                if (numericValue > autoMaxValue) autoMaxValue = numericValue;
            }
        });
    }
    document.getElementById('minValue').value = autoMinValue;
    document.getElementById('maxValue').value = autoMaxValue;
}

function updateColorMap() {
    if (!globalData) return;

    const minValue = parseFloat(document.getElementById('minValue').value);
    const maxValue = parseFloat(document.getElementById('maxValue').value);
    const lines = globalData.split('\n');
    const headers = lines[0].split(',');
    const colorMap = document.getElementById('colorMap');
    colorMap.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const row = document.createElement('tr');
        rowData.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                td.style.backgroundColor = getColorForValue(numericValue, minValue, maxValue);
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    }

    colorMap.appendChild(table);
}

function getColorForValue(value, min, max) {
    const ranges = [
        parseFloat(document.getElementById('range1').value),
        parseFloat(document.getElementById('range2').value),
        parseFloat(document.getElementById('range3').value),
        parseFloat(document.getElementById('range4').value),
        parseFloat(document.getElementById('range5').value),
        parseFloat(document.getElementById('range6').value),
        parseFloat(document.getElementById('range7').value),
        parseFloat(document.getElementById('range8').value),
        parseFloat(document.getElementById('range9').value),
        parseFloat(document.getElementById('range10').value)
    ];

    const colors = [
        document.getElementById('color1').value,
        document.getElementById('color2').value,
        document.getElementById('color3').value,
        document.getElementById('color4').value,
        document.getElementById('color5').value,
        document.getElementById('color6').value,
        document.getElementById('color7').value,
        document.getElementById('color8').value,
        document.getElementById('color9').value,
        document.getElementById('color10').value
    ];

    if (value <= min) {
        return colors[0];
    } else if (value > max) {
        return colors[colors.length - 1];
    } else {
        const percentage = (value - min) / (max - min) * 100;
        for (let i = 0; i < ranges.length; i++) {
            if (percentage <= ranges[i]) {
                return colors[i];
            }
        }
        return colors[colors.length - 1];
    }
}

function findMinValueCell() {
    if (!globalData) return;

    const lines = globalData.split('\n');
    let minValue = Number.POSITIVE_INFINITY;
    let minCell = null;
    let minRow = -1;
    let minCol = -1;

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach((cell, colIndex) => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue) && numericValue < minValue) {
                minValue = numericValue;
                minRow = i;
                minCol = colIndex;
            }
        });
    }

    const tableRows = document.querySelectorAll('#colorMap table tr');
    if (tableRows[minRow]) {
        const targetCell = tableRows[minRow].children[minCol];
        targetCell.style.border = '15px solid black';
        targetCell.style.backgroundColor = '#ffcccc';
    }
}

function findTop3MinValueCells() {
    if (!globalData) return;

    const lines = globalData.split('\n');
    const minCells = [];

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach((cell, colIndex) => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                minCells.push({ value: numericValue, row: i, col: colIndex });
            }
        });
    }

    minCells.sort((a, b) => a.value - b.value);
    const top3MinCells = minCells.slice(0, 3);
    const tableRows = document.querySelectorAll('#colorMap table tr');
    top3MinCells.forEach((cellData, index) => {
        const row = tableRows[cellData.row];
        if (row) {
            const targetCell = row.children[cellData.col];
            if (index === 0) {
                targetCell.style.border = '15px solid black';
                targetCell.style.backgroundColor = '#ffcccc';
            } else if (index === 1) {
                targetCell.style.border = '15px solid orange';
                targetCell.style.backgroundColor = '#ffe5cc';
            } else if (index === 2) {
                targetCell.style.border = '15px solid purple';
                targetCell.style.backgroundColor = '#ffffcc';
            }
        }
    });
}

// セルクリック時に周囲の詳細情報を表示する機能を追加
document.getElementById('colorMap').addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'TD') {
        const cellIndex = target.cellIndex;
        const rowIndex = target.parentNode.rowIndex;
        const rows = document.querySelectorAll('#colorMap table tr');

        const infoTable = document.createElement('table');
        infoTable.style.border = '1px solid black';
        infoTable.style.marginTop = '10px';

        for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
            if (i >= 1 && i < rows.length) {
                const row = document.createElement('tr');
                const cells = rows[i].children;

                for (let j = cellIndex - 1; j <= cellIndex + 1; j++) {
                    if (j >= 0 && j < cells.length) {
                        const cell = document.createElement('td');
                        cell.textContent = cells[j].textContent;
                        cell.style.border = '1px solid black';
                        cell.style.padding = '5px';
                        row.appendChild(cell);
                    }
                }
                infoTable.appendChild(row);
            }
        }

        const existingInfo = document.getElementById('cellInfo');
        if (existingInfo) {
            existingInfo.remove();
        }

        const infoDiv = document.createElement('div');
        infoDiv.id = 'cellInfo';
        infoDiv.innerHTML = '<h3>クリックしたセルの付近情報</h3>';
        infoDiv.appendChild(infoTable);

        document.body.appendChild(infoDiv);
    }
});
