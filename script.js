let globalData = null;
let autoMinValue = Number.POSITIVE_INFINITY;
let autoMaxValue = Number.NEGATIVE_INFINITY;
let minCellCoordinates = null;  // 最小値のセル位置を保存するための変数

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

function calculateMinMax() {
    if (!globalData) return;

    const lines = globalData.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach((cell, j) => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                if (numericValue < autoMinValue) {
                    autoMinValue = numericValue;
                    minCellCoordinates = { row: i, col: j };  // 最小値のセルの位置を保存
                }
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
        rowData.forEach((cell, j) => {
            const td = document.createElement('td');
            td.textContent = cell;
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                td.style.backgroundColor = getColorForValue(numericValue, minValue, maxValue);
            }

            // 最小値のセルの場合、ピンク色の枠をつける
            if (minCellCoordinates && i === minCellCoordinates.row && j === minCellCoordinates.col) {
                td.classList.add('min-cell');
            }

            row.appendChild(td);
        });
        table.appendChild(row);
    }

    colorMap.appendChild(table);
}
