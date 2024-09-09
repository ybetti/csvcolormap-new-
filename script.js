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
    magnifier.style.border = '3px solid #000';
    magnifier.style.borderRadius = '50%';
    magnifier.style.width = '150px';
    magnifier.style.height = '150px';
    magnifier.style.overflow = 'hidden';
    magnifier.style.pointerEvents = 'none';
    magnifier.style.transform = 'scale(2)'; // 拡大倍率
    magnifier.style.background = '#fff';
    newWindow.document.body.appendChild(magnifier);

    newWindow.addEventListener('mousemove', function(e) {
        const mouseX = e.pageX;
        const mouseY = e.pageY;
        
        // 拡大鏡の位置をマウスに追従させる
        magnifier.style.left = `${mouseX - 75}px`; // 中心を合わせる
        magnifier.style.top = `${mouseY - 75}px`;

        // マウス位置に合わせてテーブルの拡大部分を表示
        magnifier.style.background = `url(${generateTableSnapshot(table)})`;
        magnifier.style.backgroundPosition = `-${mouseX * 2}px -${mouseY * 2}px`;
    });
}

function deactivateMagnifier(newWindow) {
    const magnifier = newWindow.document.getElementById('magnifier');
    if (magnifier) {
        magnifier.remove();
    }
}

function generateTableSnapshot(table) {
    // テーブルのスナップショットを画像化
    const canvas = document.createElement('canvas');
    canvas.width = table.offsetWidth;
    canvas.height = table.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2); // 拡大のためのスケーリング
    ctx.drawImage(table, 0, 0);
    return canvas.toDataURL();
}
