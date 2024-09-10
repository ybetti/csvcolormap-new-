let globalData = null;
let autoMinValue = Number.POSITIVE_INFINITY;
let autoMaxValue = Number.NEGATIVE_INFINITY;
let minCellCoordinates = { row: -1, col: -1 };  // 最小値のセル位置を保存するための変数

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
    minCellCoordinates = { row: -1, col: -1 };  // 初期化
    autoMinValue = Number.POSITIVE_INFINITY;
    autoMaxValue = Number.NEGATIVE_INFINITY;

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

    console.log('最小値のセル座標:', minCellCoordinates);  // デバッグ用ログ

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
            if (i === minCellCoordinates.row && j === minCellCoordinates.col) {
                td.classList.add('min-cell');
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
