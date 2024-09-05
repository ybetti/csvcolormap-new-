let globalData = null;

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
        globalData = reader.result;
        updateColorMap();
    };
});

document.getElementById('fullscreenButton').addEventListener('click', function() {
    // 新しいウィンドウを開く
    const newWindow = window.open('', '', 'width=1200,height=800');

    // 新しいウィンドウにHTMLを追加
    newWindow.document.write('<html><head><title>全体図</title></head><body></body></html>');

    const colorMapContainer = newWindow.document.body;

    // コンテナを作成
    const tableContainer = document.getElementById('colorMap').cloneNode(true);
    colorMapContainer.appendChild(tableContainer);

    const table = colorMapContainer.querySelector('table');

    // テーブルを横長に設定
    table.style.width = '1000px';  // 固定幅で横長にする
    table.style.height = 'auto';
    table.style.tableLayout = 'fixed';

    // スクロール可能にする
    colorMapContainer.style.overflow = 'auto';

    // 虫眼鏡機能の追加
    const lens = newWindow.document.createElement('div');
    lens.id = 'zoomLens';
    lens.style.position = 'absolute';
    lens.style.border = '2px solid #000';
    lens.style.borderRadius = '50%';
    lens.style.width = '100px';
    lens.style.height = '100px';
    lens.style.overflow = 'hidden';
    lens.style.pointerEvents = 'none';
    lens.style.zIndex = '100';
    colorMapContainer.appendChild(lens);

    const zoomImg = newWindow.document.createElement('div');
    zoomImg.id = 'zoomImg';
    lens.appendChild(zoomImg);

    newWindow.document.addEventListener('mousemove', function(event) {
        const rect = table.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // テーブル内でのみ拡大レンズを表示
        if (mouseX > rect.left && mouseX < rect.right && mouseY > rect.top && mouseY < rect.bottom) {
            lens.style.display = 'block';
            lens.style.left = (mouseX - lens.offsetWidth / 2) + 'px';
            lens.style.top = (mouseY - lens.offsetHeight / 2) + 'px';

            const zoomLevel = 2;
            zoomImg.style.transform = `scale(${zoomLevel})`;
            zoomImg.style.left = -((mouseX - rect.left) * zoomLevel - lens.offsetWidth / 2) + 'px';
            zoomImg.style.top = -((mouseY - rect.top) * zoomLevel - lens.offsetHeight / 2) + 'px';
        } else {
            lens.style.display = 'none';
        }
    });

    newWindow.document.close();
});

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
    // カラーマッピングのロジックをここに実装
    const colors = ['#ff2e2e', '#f9b030', '#fcff33', '#87fb28', '#00db04', '#2effaf', '#13ecdd', '#0084ff', '#0062ff', '#0000ff'];
    const percentage = (value - min) / (max - min) * 100;
    const index = Math.min(Math.floor(percentage / 10), colors.length - 1);
    return colors[index];
}
