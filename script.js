document.getElementById('colorMap').addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'TD') {
        // クリックされたセルの位置を取得
        const cellIndex = target.cellIndex;
        const rowIndex = target.parentNode.rowIndex;

        // テーブルの全行を取得
        const rows = document.querySelectorAll('#colorMap table tr');

        // 周囲3x3セルの情報を表示するためのテーブル作成
        const infoTable = document.createElement('table');
        infoTable.style.border = '1px solid black';
        infoTable.style.marginTop = '10px';

        for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
            if (i >= 1 && i < rows.length) { // 行の範囲チェック
                const row = document.createElement('tr');
                const cells = rows[i].children;

                for (let j = cellIndex - 1; j <= cellIndex + 1; j++) {
                    if (j >= 0 && j < cells.length) { // 列の範囲チェック
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

        // 既存の詳細情報を削除してから新しい情報を追加
        const existingInfo = document.getElementById('cellInfo');
        if (existingInfo) {
            existingInfo.remove();
        }

        const infoDiv = document.createElement('div');
        infoDiv.id = 'cellInfo';
        infoDiv.innerHTML = '<h3>クリックしたセルの付近情報</h3>';
        infoDiv.appendChild(infoTable);

        // カラーマップの下に表示
        document.body.appendChild(infoDiv);
    }
});
