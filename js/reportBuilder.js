export function renderTable(data) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  // Sort by 30D Sale DESC
  data.sort((a, b) => b.gross30DSale - a.gross30DSale);

  const fcGroups = {};
  data.forEach(r => {
    if (!fcGroups[r.fc]) fcGroups[r.fc] = [];
    fcGroups[r.fc].push(r);
  });

  Object.keys(fcGroups).forEach(fc => {
    const section = document.createElement('div');
    section.style.marginBottom = '16px';

    const header = document.createElement('div');
    header.style.fontWeight = 'bold';
    header.style.cursor = 'pointer';
    header.style.padding = '8px';
    header.style.background = '#f0f0f0';
    header.innerText =
      fc === 'LOC979d1d9aca154ae0a5d72fc1a199aece'
        ? `Seller FC (Non-FBF) – Rows: ${fcGroups[fc].length}`
        : `FC: ${fc} – Rows: ${fcGroups[fc].length}`;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'none';

    header.onclick = () => {
      wrapper.style.display =
        wrapper.style.display === 'none' ? 'block' : 'none';
    };

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>SKU</th>
          <th>Current Stock</th>
          <th>30D Sale</th>
          <th>Suggested Target FC</th>
        </tr>
      </thead>
      <tbody>
        ${fcGroups[fc]
          .map(
            r => `
          <tr>
            <td>${r.sellerSKU}</td>
            <td>${r.currentFCStock}</td>
            <td>${r.gross30DSale}</td>
            <td>${r.targetFC || '-'}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    `;

    wrapper.appendChild(table);
    section.appendChild(header);
    section.appendChild(wrapper);
    container.appendChild(section);
  });
}
