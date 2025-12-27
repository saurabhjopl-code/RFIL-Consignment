function normalizeKey(key) {
  return key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\(\)\-]/g, '');
}

function getValue(row, keywords) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (keywords.some(w => nk.includes(w))) {
      return row[k];
    }
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ---------- UNIWARE STATUS MAP ---------- */
  const skuStatus = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [uniwareSKU, status] = r.split(',');
    if (uniwareSKU && status) {
      skuStatus[uniwareSKU.trim()] = status.trim();
    }
  });

  /* ---------- UNIWARE STOCK (USE TOTAL INVENTORY ONLY) ---------- */
  const sellerStockMap = {};
  sellerStock.forEach(r => {
    const sku = getValue(r, ['sku code', 'sku']);
    const stock = Number(getValue(r, ['total inventory'])) || 0;

    if (!sku) return;

    sellerStockMap[sku] = (sellerStockMap[sku] || 0) + stock;
  });

  /* ---------- FBF STOCK (SUM Live on Website) ---------- */
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const sku = getValue(r, ['sku']);
    const fc = getValue(r, ['warehouse', 'location']);
    const stock = Number(getValue(r, ['live'])) || 0;

    if (!sku || !fc) return;

    const key = `${sku}||${fc}`;
    fbfStockMap[key] = (fbfStockMap[key] || 0) + stock;
  });

  /* ---------- SALES (SUM Gross Units) ---------- */
  const salesMap = {};
  sales.forEach(r => {
    const sku = getValue(r, ['sku id', 'sku']);
    const fc = getValue(r, ['location', 'warehouse']);
    const gross = Number(getValue(r, ['gross units'])) || 0;
    const ret = Number(getValue(r, ['return units'])) || 0;

    if (!sku || !fc) return;

    const key = `${sku}||${fc}`;
    if (!salesMap[key]) {
      salesMap[key] = { gross: 0, returns: 0 };
    }

    salesMap[key].gross += gross;
    salesMap[key].returns += ret;
  });

  /* ---------- BUILD FINAL UNIQUE DATASET ---------- */
  const working = [];

  Object.keys(salesMap).forEach(key => {
    const [sku, fc] = key.split('||');

    working.push({
      fc,
      sellerSKU: sku,

      gross30DSale: salesMap[key].gross,
      return30D: salesMap[key].returns,

      currentFCStock: fbfStockMap[key] || 0,
      sellerStock: sellerStockMap[sku] || 0,

      uniwareStatus: skuStatus[sku] || 'OPEN'
    });
  });

  /* ---------- INCLUDE FBF STOCK WITH NO SALES ---------- */
  Object.keys(fbfStockMap).forEach(key => {
    if (salesMap[key]) return;

    const [sku, fc] = key.split('||');

    working.push({
      fc,
      sellerSKU: sku,

      gross30DSale: 0,
      return30D: 0,

      currentFCStock: fbfStockMap[key],
      sellerStock: sellerStockMap[sku] || 0,

      uniwareStatus: skuStatus[sku] || 'OPEN'
    });
  });

  return working;
}
