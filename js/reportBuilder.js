export function renderTable(data) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  data.sort((a, b) => b.gross30DSale - a.gross30DSale);

  const groups = {};
  data.forEach(r => {
    if (!groups[r.fc]) groups[r.fc] = [];
    groups[r.fc].push(r);
  });

  Object.keys(groups).forEach(fc => {
    const header = document.createElement('div');
    header.innerText = `FC: ${fc} (Rows: ${groups[fc].length})`;
    header.style.fontWeight = 'bold';
    header.style.cursor = 'pointer';
    header.style.padding = '6px';
    header.style.background = '#eee';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'none';

    header.onclick = () => {
      wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';
    };

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>SKU</th>
          <th>Current Stock</th>
          <th>30D Sale</th>
          <th>Stock Cover</th>
          <th>Decision</th>
          <th>Send Qty</th>
          <th>Recall Qty</th>
          <th>Target FC</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${groups[fc].map(r => `
          <tr style="background:${
            r.decision === 'RECALL' ? '#f8d7da' :
            r.decision === 'DISCUSS' ? '#fff3cd' :
            r.decision === 'SEND' ? '#d4edda' : '#e2e3e5'
          }">
            <td>${r.sellerSKU}</td>
            <td>${r.currentFCStock}</td>
            <td>${r.gross30DSale}</td>
            <td>${r.stockCover ?? '-'}</td>
            <td>${r.decision}</td>
            <td>${r.sendQty}</td>
            <td>${r.recallQty}</td>
            <td>${r.targetFC || '-'}</td>
            <td>${r.remarks}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    wrapper.appendChild(table);
    container.appendChild(header);
    container.appendChild(wrapper);
  });
}
