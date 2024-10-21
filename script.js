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

    // クリックイベントを追加
    table.addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName === 'TD') {
            const cellIndex = target.cellIndex;
            const rowIndex = target.parentNode.rowIndex;
            const rows = table.querySelectorAll('tr');

            const detailWindow = window.open('', '', 'width=400,height=300');
            detailWindow.document.write('<html><head><title>詳細情報</title></head><body><h3>クリックしたセルの付近情報</h3></body></html>');
            detailWindow.document.close();
            
            const detailBody = detailWindow.document.body;
            const infoTable = detailWindow.document.createElement('table');
            infoTable.style.border = '1px solid black';
            infoTable.style.marginTop = '10px';

            for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
                if (i >= 1 && i < rows.length) {
                    const row = detailWindow.document.createElement('tr');
                    const cells = rows[i].children;

                    for (let j = cellIndex - 1; j <= cellIndex + 1; j++) {
                        if (j >= 0 && j < cells.length) {
                            const cell = detailWindow.document.createElement('td');
                            cell.textContent = cells[j].textContent;
                            cell.style.border = '1px solid black';
                            cell.style.padding = '5px';
                            cell.style.backgroundColor = cells[j].style.backgroundColor;  
                            row.appendChild(cell);
                        }
                    }
                    infoTable.appendChild(row);
                }
            }

            detailBody.appendChild(infoTable);
        }
    });
});

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
    findMinValueCell(); 
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
    if (!globalData) return [];

    const lines = globalData.split('\n');
    const minValues = [];

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach((cell) => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                minValues.push({ value: numericValue, row: i, col: rowData.indexOf(cell) });
            }
        });
    }

    minValues.sort((a, b) => a.value - b.value);
    return minValues.slice(0, 3); // 上位3つの最小値を返す
}

document.getElementById('highlightTop3Button').addEventListener('click', function() {
    const top3Cells = findTop3MinValueCells();
    const tableRows = document.querySelectorAll('#colorMap table tr');

    // 最初にすべてのスタイルをリセット
    tableRows.forEach(row => {
        Array.from(row.children).forEach(cell => {
            cell.style.border = '';
            cell.style.backgroundColor = ''; // 背景色をリセット
        });
    });

    top3Cells.forEach(cellInfo => {
        const targetCell = tableRows[cellInfo.row].children[cellInfo.col];
        targetCell.style.border = '15px solid blue'; // セルを青枠で囲む
        targetCell.style.backgroundColor = '#ccccff'; // 背景色も変更
    });
});
