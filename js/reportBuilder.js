export function renderTable(data) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  const table = document.createElement('table');
  const headers = [
    'FC','SKU','Current Stock','30D Sale',
    'Stock Cover','Decision','Send Qty','Recall Qty','Remarks'
  ];

  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.innerText = h;
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  data.forEach(r => {
    const tr = document.createElement('tr');
    [
      r.fc,
      r.sellerSKU,
      r.currentFCStock,
      r.gross30DSale,
      r.stockCover,
      r.decision,
      r.sendQty,
      r.recallQty,
      r.remarks
    ].forEach(val => {
      const td = document.createElement('td');
      td.innerText = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
