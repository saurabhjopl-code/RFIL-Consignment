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

  /* ===============================
     1. SELLER → UNIWARE SKU MAP
     =============================== */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, uniwareSKU] = r.split(',');
    if (sellerSKU && uniwareSKU) {
      sellerToUniware[sellerSKU.trim()] = uniwareSKU.trim();
    }
  });

  /* ===============================
     2. UNIWARE STATUS MAP
     =============================== */
  const uniwareStatusMap = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [uniwareSKU, status] = r.split(',');
    if (uniwareSKU && status) {
      uniwareStatusMap[uniwareSKU.trim()] = status.trim();
    }
  });

  /* ===============================
     3. UNIWARE STOCK (SUM ATP)
     =============================== */
  const uniwareStockMap = {};
  sellerStock.forEach(r => {
    const uniwareSKU = getValue(r, ['sku code']);
    const stock = Number(getValue(r, ['available', 'atp'])) || 0;

    if (!uniwareSKU) return;

    uniwareStockMap[uniwareSKU] =
      (uniwareStockMap[uniwareSKU] || 0) + stock;
  });

  /* ===============================
     4. FBF STOCK (SUM LIVE)
     =============================== */
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const sellerSKU = getValue(r, ['sku']);
    const fc = getValue(r, ['warehouse']);
    const stock = Number(getValue(r, ['live'])) || 0;

    if (!sellerSKU || !fc) return;

    const key = `${sellerSKU}||${fc}`;
    fbfStockMap[key] = (fbfStockMap[key] || 0) + stock;
  });

  /* ===============================
     5. SALES (SUM GROSS UNITS)
     =============================== */
  const salesMap = {};
  sales.forEach(r => {
    const sellerSKU = getValue(r, ['sku id']);
    const fc = getValue(r, ['location']);
    const gross = Number(getValue(r, ['gross units'])) || 0;
    const ret = Number(getValue(r, ['return units'])) || 0;

    if (!sellerSKU || !fc) return;

    const key = `${sellerSKU}||${fc}`;
    if (!salesMap[key]) {
      salesMap[key] = { gross: 0, returns: 0 };
    }
    salesMap[key].gross += gross;
    salesMap[key].returns += ret;
  });

  /* ===============================
     6. BUILD FINAL WORKING DATA
     =============================== */
  const working = [];

  Object.keys(salesMap).forEach(key => {
    const [sellerSKU, fc] = key.split('||');

    const uniwareSKU = sellerToUniware[sellerSKU] || '';
    const uniwareStock = uniwareStockMap[uniwareSKU] || 0;
    const uniwareStatus = uniwareStatusMap[uniwareSKU] || 'OPEN';

    working.push({
      fc,
      sellerSKU,
      uniwareSKU,

      gross30DSale: salesMap[key].gross,
      return30D: salesMap[key].returns,

      currentFCStock: fbfStockMap[key] || 0,
      sellerStock: uniwareStock,

      uniwareStatus
    });
  });

  /* ===============================
     7. INCLUDE FBF STOCK WITH NO SALES
     =============================== */
  Object.keys(fbfStockMap).forEach(key => {
    if (salesMap[key]) return;

    const [sellerSKU, fc] = key.split('||');
    const uniwareSKU = sellerToUniware[sellerSKU] || '';

    working.push({
      fc,
      sellerSKU,
      uniwareSKU,

      gross30DSale: 0,
      return30D: 0,

      currentFCStock: fbfStockMap[key],
      sellerStock: uniwareStockMap[uniwareSKU] || 0,

      uniwareStatus: uniwareStatusMap[uniwareSKU] || 'OPEN'
    });
  });

  return working;
}
