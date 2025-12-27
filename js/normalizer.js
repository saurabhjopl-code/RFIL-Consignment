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

const EXCLUDED_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ---------- UNIWARE STATUS ---------- */
  const skuStatus = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [sku, status] = r.split(',');
    if (sku && status) skuStatus[sku.trim()] = status.trim();
  });

  /* ---------- SELLER STOCK (SUM) ---------- */
  const sellerStockMap = {};
  sellerStock.forEach(r => {
    const sku = getValue(r, ['sku']);
    const stock = Number(getValue(r, ['available', 'qty', 'stock'])) || 0;
    if (!sku) return;
    sellerStockMap[sku] = (sellerStockMap[sku] || 0) + stock;
  });

  /* ---------- FBF STOCK (SUM) ---------- */
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const sku = getValue(r, ['sku']);
    const fc = getValue(r, ['warehouse', 'location']);
    const stock = Number(getValue(r, ['live'])) || 0;

    if (!sku || !fc || fc === EXCLUDED_FC) return;

    const key = `${sku}||${fc}`;
    fbfStockMap[key] = (fbfStockMap[key] || 0) + stock;
  });

  /* ---------- SALES (SUM) ---------- */
  const salesMap = {};
  sales.forEach(r => {
    const sku = getValue(r, ['sku id', 'sku']);
    const fc = getValue(r, ['location', 'warehouse']);
    const gross = Number(getValue(r, ['gross units'])) || 0;
    const ret = Number(getValue(r, ['return units'])) || 0;

    if (!sku || !fc || fc === EXCLUDED_FC) return;

    const key = `${sku}||${fc}`;
    if (!salesMap[key]) salesMap[key] = { gross: 0, returns: 0 };
    salesMap[key].gross += gross;
    salesMap[key].returns += ret;
  });

  /* ---------- BUILD FINAL DATA ---------- */
  const working = [];

  const allKeys = new Set([
    ...Object.keys(salesMap),
    ...Object.keys(fbfStockMap)
  ]);

  allKeys.forEach(key => {
    const [sku, fc] = key.split('||');

    const gross = salesMap[key]?.gross || 0;
    const returns = salesMap[key]?.returns || 0;
    const stock = fbfStockMap[key] || 0;

    // 🔴 REMOVE ZERO–ZERO ROWS
    if (gross === 0 && stock === 0) return;

    working.push({
      fc,
      sellerSKU: sku,
      gross30DSale: gross,
      return30D: returns,
      currentFCStock: stock,
      sellerStock: sellerStockMap[sku] || 0,
      uniwareStatus: skuStatus[sku] || 'OPEN'
    });
  });

  return working;
}
