const SELLER_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';
const PAGE_SIZE = 25;

export function renderFCTables(data) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  const fcMap = {};
  data.forEach(r => {
    if (!fcMap[r.fc]) fcMap[r.fc] = [];
    fcMap[r.fc].push(r);
  });

  Object.keys(fcMap).sort().forEach(fc => {
    let visibleCount = PAGE_SIZE;

    const section = document.createElement('div');
    section.style.marginBottom = '20px';

    const header = document.createElement('div');
    header.style.cursor = 'pointer';
    header.style.fontWeight = 'bold';
    header.style.background = '#ddd';
    header.style.padding = '8px';

    const displayName =
      fc === SELLER_FC ? 'FC: Seller (Surat)' : `FC: ${fc}`;

    header.innerText = `${displayName} (Rows: ${fcMap[fc].length})`;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'none';

    header.onclick = () => {
      wrapper.style.display =
        wrapper.style.display === 'none' ? 'block' : 'none';
    };

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');

    const headers = [
      'SKU',
      'Current FC Stock',
      'Uniware Stock',
      '30D Sale',
      'Stock Cover',
      'Decision',
      'Send Qty'
    ];

    if (fc !== SELLER_FC) {
      headers.push('Recall Qty');
    }

    if (fc === SELLER_FC) {
      headers.push('Recommended FC');
    }

    headers.push('Remarks');

    headers.forEach(h => {
      const th = document.createElement('th');
      th.innerText = h;
      trh.appendChild(th);
    });

    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    function renderRows() {
      tbody.innerHTML = '';
      fcMap[fc].slice(0, visibleCount).forEach(r => {
        const tr = document.createElement('tr');

        const cells = [
          r.sellerSKU,
          r.currentFCStock,
          r.sellerStock,
          r.gross30DSale,
          r.stockCover,
          r.decision,
          r.sendQty
        ];

        if (fc !== SELLER_FC) {
          cells.push(r.recallQty);
        }

        if (fc === SELLER_FC) {
          cells.push(r.recommendedFC || '');
        }

        cells.push(r.remarks);

        cells.forEach(v => {
          const td = document.createElement('td');
          td.innerText = v;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    renderRows();
    table.appendChild(tbody);
    wrapper.appendChild(table);

    const actions = document.createElement('div');
    actions.style.margin = '10px 0';

    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.innerText = 'Load More';
    loadMoreBtn.onclick = () => {
      visibleCount += PAGE_SIZE;
      if (visibleCount >= fcMap[fc].length) {
        loadMoreBtn.style.display = 'none';
        collapseBtn.style.display = 'inline-block';
        exportBtn.style.display = 'inline-block';
      }
      renderRows();
    };

    const collapseBtn = document.createElement('button');
    collapseBtn.innerText = 'Collapse All';
    collapseBtn.style.display = 'none';
    collapseBtn.onclick = () => {
      visibleCount = PAGE_SIZE;
      loadMoreBtn.style.display = 'inline-block';
      collapseBtn.style.display = 'none';
      exportBtn.style.display = 'none';
      renderRows();
    };

    const exportBtn = document.createElement('button');
    exportBtn.innerText = 'Export This FC';
    exportBtn.style.display = 'none';
    exportBtn.onclick = () => {
      window.exportWholeWorking(fcMap[fc]);
    };

    actions.appendChild(loadMoreBtn);
    actions.appendChild(collapseBtn);
    actions.appendChild(exportBtn);

    wrapper.appendChild(actions);
    section.appendChild(header);
    section.appendChild(wrapper);
    container.appendChild(section);
  });
}
