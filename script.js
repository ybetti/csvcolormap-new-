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
});

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
});

document.getElementById('applyButton').addEventListener('click', function() {
    const table = document.querySelector('table');
    if (table) {
        table.style.fontSize = '12px'; 
    }
});

document.getElementById('rangeSelectButton').addEventListener('click', function() {
    isSelecting = !isSelecting;
    if (isSelecting) {
        document.getElementById('colorMap').addEventListener('mousedown', startSelection);
        document.getElementById('colorMap').addEventListener('mousemove', updateSelection);
        document.getElementById('colorMap').addEventListener('mouseup', endSelection);
    } else {
        document.getElementById('colorMap').removeEventListener('mousedown', startSelection);
        document.getElementById('colorMap').removeEventListener('mousemove', updateSelection);
        document.getElementById('colorMap').removeEventListener('mouseup', endSelection);
        clearSelection();
    }
});

let isSelecting = false;
let startX, startY, endX, endY;

function startSelection(e) {
    if (!isSelecting) return;
    startX = e.clientX;
    startY = e.clientY;
    document.getElementById('colorMap').style.cursor = 'crosshair';
}

function updateSelection(e) {
    if (!isSelecting || startX === undefined || startY === undefined) return;
    endX = e.clientX;
    endY = e.clientY;
    drawSelection();
}

function endSelection(e) {
    if (!isSelecting || startX === undefined || startY === undefined) return;
    endX = e.clientX;
    endY = e.clientY;
    showSelectedArea();
    document.getElementById('colorMap').style.cursor = 'default';
}

function drawSelection() {
    const colorMap = document.getElementById('colorMap');
    const rect = colorMap.getBoundingClientRect();
    const selectionBox = document.getElementById('selectionBox');

    if (!selectionBox) {
        const newBox = document.createElement('div');
        newBox.id = 'selectionBox';
        newBox.style.position = 'absolute';
        newBox.style.border = '2px dashed #000';
        colorMap.appendChild(newBox);
    }

    const selection = document.getElementById('selectionBox');
    selection.style.left = `${Math.min(startX, endX) - rect.left}px`;
    selection.style.top = `${Math.min(startY, endY) - rect.top}px`;
    selection.style.width = `${Math.abs(endX - startX)}px`;
    selection.style.height = `${Math.abs(endY - startY)}px`;
}

function clearSelection() {
    const selectionBox = document.getElementById('selectionBox');
    if (selectionBox) {
        selectionBox.remove();
    }
}

function showSelectedArea() {
    const colorMap = document.getElementById('colorMap');
    const rect = colorMap.getBoundingClientRect();
    const selectionBox = document.getElementById('selectionBox');
    
    if (!selectionBox) return;
    
    const rectLeft = parseInt(selectionBox.style.left);
    const rectTop = parseInt(selectionBox.style.top);
    const rectWidth = parseInt(selectionBox.style.width);
    const rectHeight = parseInt(selectionBox.style.height);

    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write('<html><head><title>拡大表示</title></head><body></body></html>');
    const newDocument = newWindow.document;

    const originalTable = document.querySelector('#colorMap table');
    if (originalTable) {
        const tableClone = originalTable.cloneNode(true);
        const tableWrapper = newDocument.createElement('div');
        tableWrapper.style.position = 'relative';
        tableWrapper.style.width = '300%';
        tableWrapper.style.height = '300%';
        tableWrapper.style.overflow = 'auto';
        newDocument.body.appendChild(tableWrapper);
        tableWrapper.appendChild(tableClone);

        const scale = 3;  
        tableClone.style.transform = `scale(${scale})`;
        tableClone.style.transformOrigin = 'top left';
        tableClone.style.position = 'absolute';
        tableClone.style.left = `-${rectLeft * scale}px`;
        tableClone.style.top = `-${rectTop * scale}px`;
    }
}

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
