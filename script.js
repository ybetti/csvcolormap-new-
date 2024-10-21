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
    // 新しいウィンドウを開く
    const newWindow = window.open('', '', 'width=800,height=600');

    // 新しいウィンドウにHTMLを追加
    newWindow.document.write('<html><head><title>全体図</title></head><body></body></html>');

    const colorMapContainer = newWindow.document.body;

    // コンテナを作成
    const tableContainer = document.getElementById('colorMap').cloneNode(true);
    colorMapContainer.appendChild(tableContainer);

    const table = colorMapContainer.querySelector('table');

    // テーブルの縮小（10分の1）
    table.style.transform = 'scale(0.1)';
    table.style.transformOrigin = 'top left'; // 縮小の起点を左上に設定

    // スクロール可能にする
    colorMapContainer.style.overflow = 'auto';

    // 必要に応じて追加のスタイルを設定
    newWindow.document.close(); // 新しいウィンドウの書き込みを終了
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

    // 最小値を探す
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

    // 最小値のセルを強調表示する
    const tableRows = document.querySelectorAll('#colorMap table tr');
    if (tableRows[minRow]) {
        const targetCell = tableRows[minRow].children[minCol];
        targetCell.style.border = '15px solid black'; // 最小値のセルを赤枠で囲む
        targetCell.style.backgroundColor = '#ffcccc'; // 背景色も変更
    }
}

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
    findMinValueCell(); // カラーマップ更新後に最小値のセルを強調表示
});

function findTop3MinValueCells() {
    if (!globalData) return;

    const lines = globalData.split('\n');
    const minCells = [];

    // 全ての数値をチェックして、行・列・値を格納
    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach((cell, colIndex) => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                minCells.push({ value: numericValue, row: i, col: colIndex });
            }
        });
    }

    // 値の小さい順にソート
    minCells.sort((a, b) => a.value - b.value);

    // 最小値トップ3を取得（配列が3未満の場合はあるだけ取得）
    const top3MinCells = minCells.slice(0, 3);

    // 最小値トップ3のセルを強調表示
    const tableRows = document.querySelectorAll('#colorMap table tr');
    top3MinCells.forEach((cellData, index) => {
        const row = tableRows[cellData.row];
        if (row) {
            const targetCell = row.children[cellData.col];
            if (index === 0) {
                targetCell.style.border = '15px solid black'; // 最も小さい値を赤枠で強調表示
                targetCell.style.backgroundColor = '#ffcccc';
            } else if (index === 1) {
                targetCell.style.border = '15px solid orange'; // 2番目をオレンジ枠で強調表示
                targetCell.style.backgroundColor = '#ffe5cc';
            } else if (index === 2) {
                targetCell.style.border = '15px solid purple'; // 3番目を黄色枠で強調表示
                targetCell.style.backgroundColor = '#ffffcc';
            }
        }
    });
}

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
    findTop3MinValueCells(); // カラーマップ更新後にトップ3の最小値のセルを強調表示
});

document.getElementById('colorMap').addEventListener('click', function(event) {
    const targetCell = event.target;

    // クリックしたセルが<td>要素か確認
    if (targetCell.tagName === 'TD') {
        const row = targetCell.parentElement.rowIndex; // 行番号
        const col = targetCell.cellIndex; // 列番号

        console.log(`Clicked Cell - Row: ${row}, Col: ${col}`); // デバッグ情報

        // 周囲の値を取得して新しいウィンドウに表示
        displaySurroundingValues(row, col);
    }
});

function displaySurroundingValues(row, col) {
    if (!globalData) return;

    const lines = globalData.split('\n');
    const surroundingValues = [];

    // 周囲のセルの範囲を指定（-1から1までの範囲）
    for (let r = row - 1; r <= row + 1; r++) {
        if (r < 1 || r >= lines.length) continue; // 行範囲のチェック
        const rowData = lines[r].split(',');
        for (let c = col - 1; c <= col + 1; c++) {
            if (c < 0 || c >= rowData.length) continue; // 列範囲のチェック
            const numericValue = parseFloat(rowData[c]);
            if (!isNaN(numericValue)) {
                surroundingValues.push(numericValue);
            }
        }
    }

    console.log(`Surrounding Values: ${surroundingValues.join(', ')}`); // デバッグ情報

    // 新しいウィンドウを開く
    const newWindow = window.open('', '', 'width=400,height=300');
    newWindow.document.write('<html><head><title>周囲の数値</title></head><body>');
    newWindow.document.write('<h1>周囲の数値</h1>');
    newWindow.document.write(`<p>${surroundingValues.join(', ')}</p>`);
    newWindow.document.write('</body></html>');
    newWindow.document.close(); // 新しいウィンドウの書き込みを終了
}
