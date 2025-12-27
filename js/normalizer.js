const SELLER_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

function clean(value) {
  return value
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

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

  /* ---------- SELLER → UNIWARE MAP ---------- */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, uniwareSKU] = r.split(',');
    if (sellerSKU && uniwareSKU) {
      sellerToUniware[clean(sellerSKU)] = clean(uniwareSKU);
    }
  });

  /* ---------- UNIWARE STOCK ---------- */
  const uniwareStockMap = {};
  sellerStock.forEach(r => {
    const uniwareSKU = clean(getValue(r, ['sku code', 'sku']));
    const stock = Number(getValue(r, ['available', 'atp'])) || 0;
    if (!uniwareSKU) return;
    uniwareStockMap[uniwareSKU] =
      (uniwareStockMap[uniwareSKU] || 0) + stock;
  });

  /* ---------- SALES MAP ---------- */
  const salesMap = {};
  sales.forEach(r => {
    const sellerSKU = clean(getValue(r, ['sku id', 'sku']));
    const fc = getValue(r, ['location', 'warehouse']);
    if (!sellerSKU || !fc) return;

    const uniwareSKU = sellerToUniware[sellerSKU];
    if (!uniwareSKU) return;

    const gross = Number(getValue(r, ['gross units'])) || 0;

    const key = `${sellerSKU}||${uniwareSKU}||${fc}`;
    salesMap[key] = (salesMap[key] || 0) + gross;
  });

  /* ---------- FBF STOCK MAP ---------- */
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const sellerSKU = clean(getValue(r, ['sku']));
    const fc = getValue(r, ['warehouse', 'location']);
    if (!sellerSKU || !fc) return;

    const uniwareSKU = sellerToUniware[sellerSKU];
    if (!uniwareSKU) return;

    const stock = Number(getValue(r, ['live'])) || 0;
    const key = `${sellerSKU}||${uniwareSKU}||${fc}`;

    fbfStockMap[key] = (fbfStockMap[key] || 0) + stock;
  });

  /* ---------- BUILD DATA ---------- */
  const rows = [];

  Object.keys(salesMap).forEach(key => {
    const [sellerSKU, uniwareSKU, fc] = key.split('||');

    rows.push({
      fc,
      sellerSKU,
      uniwareSKU,
      gross30DSale: salesMap[key],
      currentFCStock: fbfStockMap[key] || 0,
      sellerStock: uniwareStockMap[uniwareSKU] || 0
    });
  });

  /* ---------- FC MOMENTUM MAP ---------- */
  const momentum = {};
  rows.forEach(r => {
    if (r.fc === SELLER_FC) return;
    const k = r.uniwareSKU;
    if (!momentum[k] || momentum[k].gross30DSale < r.gross30DSale) {
      momentum[k] = { fc: r.fc, sale: r.gross30DSale };
    }
  });

  /* ---------- FINAL OUTPUT ---------- */
  return rows.map(r => ({
    ...r,
    targetFC:
      r.fc === SELLER_FC
        ? momentum[r.uniwareSKU]?.fc || 'MANUAL (New FC Allocation)'
        : ''
  }));
}
