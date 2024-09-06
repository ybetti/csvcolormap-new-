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
    const newWindow = window.open('', '', 'width=1200,height=800');
    newWindow.document.write('<html><head><title>全体図</title></head><body></body></html>');

    const colorMapContainer = newWindow.document.body;
    const tableContainer = document.getElementById('colorMap').cloneNode(true);
    colorMapContainer.appendChild(tableContainer);

    const table = colorMapContainer.querySelector('table');
    table.style.width = '1000px';
    table.style.height = 'auto';

    colorMapContainer.style.overflow = 'auto';

    const lens = newWindow.document.createElement('div');
    lens.id = 'zoomLens';
    colorMapContainer.appendChild(lens);

    const zoomImg = newWindow.document.createElement('img');
    lens.appendChild(zoomImg);

    html2canvas(table).then(canvas => {
        zoomImg.src = canvas.toDataURL();
    });

    newWindow.document.addEventListener('mousemove', function(event) {
        const rect = table.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;

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
    const colors = ['#ff2e2e', '#f9b030', '#fcff33', '#87fb28', '#00db04', '#2effaf', '#13ecdd', '#0084ff', '#0062ff', '#0000ff'];
    const range = (max - min) / (colors.length - 1);
    
    if (value <= min) {
        return colors[0];
    } else if (value >= max) {
        return colors[colors.length - 1];
    } else {
        const index = Math.floor((value - min) / range);
        return colors[index];
    }
}
