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

    // 拡大鏡の要素を作成
    const magnifier = newWindow.document.createElement('div');
    magnifier.style.position = 'absolute';
    magnifier.style.border = '3px solid black';
    magnifier.style.width = '150px';
    magnifier.style.height = '150px';
    magnifier.style.borderRadius = '50%';
    magnifier.style.overflow = 'hidden';
    magnifier.style.pointerEvents = 'none';
    magnifier.style.display = 'none';
    magnifier.style.zIndex = '100';  // 拡大鏡が上に表示されるようにする
    colorMapContainer.appendChild(magnifier);

    const magnifiedArea = newWindow.document.createElement('div');
    magnifiedArea.style.position = 'absolute';
    magnifiedArea.style.width = `${table.offsetWidth * 5}px`;  // 元のテーブルの5倍のサイズ
    magnifiedArea.style.height = `${table.offsetHeight * 5}px`;
    magnifiedArea.style.backgroundImage = `url(${captureTableAsImage(table)})`;  // テーブルの画像を背景として使用
    magnifiedArea.style.backgroundSize = `${table.offsetWidth * 5}px ${table.offsetHeight * 5}px`;
    magnifier.appendChild(magnifiedArea);

    // マウスの動きに合わせて拡大鏡を表示
    colorMapContainer.addEventListener('mousemove', function(e) {
        const rect = colorMapContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 拡大鏡の表示位置
        magnifier.style.left = `${x - 75}px`;
        magnifier.style.top = `${y - 75}px`;
        magnifier.style.display = 'block';

        // 拡大領域の背景位置を調整
        magnifiedArea.style.backgroundPosition = `-${x * 5}px -${y * 5}px`;
    });

    colorMapContainer.addEventListener('mouseleave', function() {
        magnifier.style.display = 'none';  // マウスが離れたら拡大鏡を非表示
    });

    newWindow.document.close();  // 新しいウィンドウの書き込みを終了
});

// テーブルを画像としてキャプチャする関数
function captureTableAsImage(table) {
    const clonedTable = table.cloneNode(true);
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.appendChild(clonedTable);
    document.body.appendChild(tempDiv);

    const canvas = document.createElement('canvas');
    canvas.width = clonedTable.offsetWidth;
    canvas.height = clonedTable.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.scale(1, 1);
    ctx.drawImage(clonedTable, 0, 0);

    document.body.removeChild(tempDiv);
    return canvas.toDataURL('image/png');
}

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
