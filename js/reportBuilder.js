export function renderFCTables(data) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  const fcMap = {};
  data.forEach(r => {
    if (!fcMap[r.fc]) fcMap[r.fc] = [];
    fcMap[r.fc].push(r);
  });

  Object.keys(fcMap).sort().forEach(fc => {
    const section = document.createElement('div');
    section.style.marginBottom = '15px';

    const header = document.createElement('div');
    header.style.cursor = 'pointer';
    header.style.fontWeight = 'bold';
    header.style.background = '#ddd';
    header.style.padding = '8px';
    header.innerText = `FC: ${fc} (Rows: ${fcMap[fc].length})`;

    const tableWrapper = document.createElement('div');
    tableWrapper.style.display = 'none';

    header.onclick = () => {
      tableWrapper.style.display =
        tableWrapper.style.display === 'none' ? 'block' : 'none';
    };

    const table = document.createElement('table');

    const headers = [
      'SKU',
      'Current FC Stock',
      'Uniware Stock',
      '30D Sale',
      'Stock Cover',
      'Decision',
      'Send Qty',
      'Recall Qty',
      'Remarks'
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

    fcMap[fc].forEach(r => {
      const tr = document.createElement('tr');

      tr.appendChild(cell(r.sellerSKU));
      tr.appendChild(cell(r.currentFCStock));
      tr.appendChild(cell(r.sellerStock));
      tr.appendChild(cell(r.gross30DSale));
      tr.appendChild(cell(r.stockCover));

      const decisionCell = cell(r.decision);
      if (r.decision === 'SEND') {
        decisionCell.classList.add('decision-send');
      }
      tr.appendChild(decisionCell);

      tr.appendChild(cell(r.sendQty));

      const recallCell = cell(r.recallQty);
      if (r.decision === 'DO NOT SEND' && r.recallQty > 0) {
        recallCell.classList.add('recall-blocked');
      }
      tr.appendChild(recallCell);

      tr.appendChild(cell(r.remarks));

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    section.appendChild(header);
    section.appendChild(tableWrapper);
    container.appendChild(section);
  });
}

function cell(val) {
  const td = document.createElement('td');
  td.innerText = val;
  return td;
}
