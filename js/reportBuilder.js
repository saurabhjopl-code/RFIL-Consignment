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

    const wrapper = document.createElement('div');
    wrapper.style.display = 'none';
    header.onclick = () =>
      wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';

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
      'Recommended FC',
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
      [
        r.sellerSKU,
        r.currentFCStock,
        r.sellerStock,
        r.gross30DSale,
        r.stockCover,
        r.decision,
        r.sendQty,
        r.recallQty,
        r.recommendedFC,
        r.remarks
      ].forEach(v => {
        const td = document.createElement('td');
        td.innerText = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    section.appendChild(header);
    section.appendChild(wrapper);
    container.appendChild(section);
  });
}
