export function renderTable(data) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  // Group by FC
  const fcGroups = {};
  data.forEach(r => {
    if (!fcGroups[r.fc]) fcGroups[r.fc] = [];
    fcGroups[r.fc].push(r);
  });

  Object.keys(fcGroups).forEach(fc => {
    const section = document.createElement('div');
    section.style.marginBottom = '15px';

    const header = document.createElement('div');
    header.style.cursor = 'pointer';
    header.style.fontWeight = 'bold';
    header.style.background = '#eaeaea';
    header.style.padding = '8px';
    header.innerText = `FC: ${fc} (Rows: ${fcGroups[fc].length})`;

    const tableWrapper = document.createElement('div');
    tableWrapper.style.display = 'none';

    header.onclick = () => {
      tableWrapper.style.display =
        tableWrapper.style.display === 'none' ? 'block' : 'none';
    };

    const table = document.createElement('table');

    const headers = [
      'SKU','Current Stock','30D Sale',
      'Stock Cover','Decision','Send Qty','Recall Qty','Remarks'
    ];

    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.innerText = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    fcGroups[fc].forEach(r => {
      const tr = document.createElement('tr');
      [
        r.sellerSKU,
        r.currentFCStock,
        r.gross30DSale,
        r.stockCover,
        r.decision,
        r.sendQty,
        r.recallQty,
        r.remarks
      ].forEach(v => {
        const td = document.createElement('td');
        td.innerText = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    section.appendChild(header);
    section.appendChild(tableWrapper);
    container.appendChild(section);
  });
}
