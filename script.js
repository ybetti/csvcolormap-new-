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

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
});

document.getElementById('applyButton').addEventListener('click', function() {
    const table = document.querySelector('table');
    if (table) {
        table.style.fontSize = '12px';  // フォントサイズを小さく設定
    }
});

document.getElementById('fullscreenButton').addEventListener('click', function() {
    // 新しいウィンドウを開く
    const newWindow = window.open('', '', 'width=800,height=600');

    // 新しいウィンドウにHTMLを追加
    newWindow.document.write(`
        <html>
        <head>
            <title>全体図</title>
            <style>
                .highlight {
                    position: relative;
                    box-shadow: 0 0 0 4px red;
                    border-radius: 50%;
                    z-index: 10;
                }
            </style>
        </head>
        <body></body>
        </html>
    `);

    const colorMapContainer = newWindow.document.body;
    const colorMapElement = document.getElementById('colorMap');
    
    // テーブルを新しいウィンドウにコピー
    const tableContainer = colorMapElement.cloneNode(true);
    colorMapContainer.appendChild(tableContainer);

    const table = colorMapContainer.querySelector('table');
    const rows = table.querySelectorAll('tr');

    // 最小値を取得
    const minValue = parseFloat(document.getElementById('minValue').value);

    // テーブル内のセルをループし、最小値のセルに丸い枠を追加
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            const cellValue = parseFloat(cell.textContent);
            if (!isNaN(cellValue) && cellValue === minValue) {
                cell.classList.add('highlight');
            }
        });
    });

    // テーブルの縮小（10分の1）
    const scale = 0.1;
    table.style.transform = `scale(${scale})`;
    table.style.transformOrigin = 'top left'; // 縮小の起点を左上に設定

    // 最小値セルのボックスシャドウをリサイズ
    const minCells = table.querySelectorAll('.highlight');
    minCells.forEach(cell => {
        cell.style.boxShadow = `${4 * scale}px ${4 * scale}px 0 ${4 * scale}px red`;
    });

    // スクロール可能にする
    colorMapContainer.style.overflow = 'auto';

    // 必要に応じて追加のスタイルを設定
    newWindow.document.close(); // 新しいウィンドウの書き込みを終了
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
