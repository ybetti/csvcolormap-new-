let globalData = null;
let autoMinValue = Number.POSITIVE_INFINITY;
let autoMaxValue = Number.NEGATIVE_INFINITY;

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (!file) {
        console.log('ファイルが選択されていません。');
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
        globalData = reader.result;
        calculateMinMax();  // 最小値・最大値の計算
        updateColorMap();   // カラーマップの更新
    };

    reader.onerror = function() {
        console.log('ファイルの読み込みに失敗しました。');
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

    // 拡大鏡ボタンの作成
    const magnifierButton = newWindow.document.createElement('button');
    magnifierButton.textContent = '拡大鏡';
    magnifierButton.style.fontSize = '16px';
    magnifierButton.style.margin = '10px';
    colorMapContainer.appendChild(magnifierButton);

    // テーブルの縮小（10分の1）
    const table = colorMapContainer.querySelector('table');
    table.style.transform = 'scale(0.1)';
    table.style.transformOrigin = 'top left';

    // スクロール可能にする
    colorMapContainer.style.overflow = 'auto';

    // 拡大鏡機能の実装
    let magnifierActive = false;

    magnifierButton.addEventListener('click', function() {
        magnifierActive = !magnifierActive;
        if (magnifierActive) {
            newWindow.document.body.style.cursor = 'none'; // カーソルを隠す
            activateMagnifier(newWindow, table);
        } else {
            newWindow.document.body.style.cursor = 'auto'; // カーソルを元に戻す
            deactivateMagnifier(newWindow);
        }
    });

    newWindow.document.close();
});

function activateMagnifier(newWindow, table) {
    const magnifier = newWindow.document.createElement('div');
    magnifier.id = 'magnifier';
    magnifier.style.position = 'absolute';
    magnifier.style.pointerEvents = 'none'; // マウスイベントを無視
    newWindow.document.body.appendChild(magnifier);

    table.addEventListener('mousemove', function(e) {
        const x = e.clientX;
        const y = e.clientY;

        magnifier.style.left = (x - 75) + 'px'; // 中心を合わせるために調整
        magnifier.style.top = (y - 75) + 'px';
        
        // テーブルの内容を画像として描画し、拡大鏡に表示
        html2canvas(table, { scale: 2 }).then(canvas => {
            magnifier.innerHTML = '';
            magnifier.appendChild(canvas);
        });
    });

    table.addEventListener('mouseleave', function() {
        magnifier.style.display = 'none';
    });

    table.addEventListener('mouseenter', function() {
        magnifier.style.display = 'block';
    });
}

function deactivateMagnifier(newWindow) {
    const magnifier = newWindow.document.getElementById('magnifier');
    if (magnifier) {
        magnifier.remove();
    }
}

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
    let index = 1;

    function processLine() {
        if (index >= lines.length) {
            document.getElementById('minValue').value = autoMinValue;
            document.getElementById('maxValue').value = autoMaxValue;
            return;
        }

        const rowData = lines[index].split(',');
        rowData.forEach(cell => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                if (numericValue < autoMinValue) autoMinValue = numericValue;
                if (numericValue > autoMaxValue) autoMaxValue = numericValue;
            }
        });

        index++;
        requestAnimationFrame(processLine);
    }

    processLine();
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

    let index = 1;

    function processRow() {
        if (index >= lines.length) {
            colorMap.appendChild(table);
            return;
        }

        const rowData = lines[index].split(',');
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

        index++;
        requestAnimationFrame(processRow);
    }

    processRow();
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
