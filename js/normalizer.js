const SELLER_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

function clean(v) {
  return v.toString().trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeKey(k) {
  return k.toLowerCase().replace(/\s+/g, ' ');
}

function getValue(row, keys) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (keys.some(x => nk.includes(x))) return row[k];
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* Seller → Uniware map */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [s, u] = r.split(',');
    if (s && u) sellerToUniware[clean(s)] = clean(u);
  });

  /* Uniware stock */
  const uniwareStock = {};
  sellerStock.forEach(r => {
    const u = clean(getValue(r, ['sku code', 'sku']));
    const st = Number(getValue(r, ['available', 'atp'])) || 0;
    if (!u) return;
    uniwareStock[u] = (uniwareStock[u] || 0) + st;
  });

  /* Sales */
  const salesMap = {};
  sales.forEach(r => {
    const s = clean(getValue(r, ['sku id', 'sku']));
    const fc = getValue(r, ['location', 'warehouse']);
    if (!s || !fc) return;
    const u = sellerToUniware[s];
    if (!u) return;
    const g = Number(getValue(r, ['gross units'])) || 0;
    const key = `${s}|${u}|${fc}`;
    salesMap[key] = (salesMap[key] || 0) + g;
  });

  /* FBF stock */
  const stockMap = {};
  fbfStock.forEach(r => {
    const s = clean(getValue(r, ['sku']));
    const fc = getValue(r, ['warehouse', 'location']);
    if (!s || !fc) return;
    const u = sellerToUniware[s];
    if (!u) return;
    const st = Number(getValue(r, ['live'])) || 0;
    const key = `${s}|${u}|${fc}`;
    stockMap[key] = (stockMap[key] || 0) + st;
  });

  /* Build base rows */
  const rows = [];
  const keys = new Set([...Object.keys(salesMap), ...Object.keys(stockMap)]);

  keys.forEach(k => {
    const [s, u, fc] = k.split('|');
    rows.push({
      fc,
      sellerSKU: s,
      uniwareSKU: u,
      gross30DSale: salesMap[k] || 0,
      currentFCStock: stockMap[k] || 0,
      sellerStock: uniwareStock[u] || 0
    });
  });

  /* Momentum map (FBF only) */
  const momentum = {};
  rows.forEach(r => {
    if (r.fc === SELLER_FC) return;
    if (!momentum[r.uniwareSKU] || momentum[r.uniwareSKU].sale < r.gross30DSale) {
      momentum[r.uniwareSKU] = { fc: r.fc, sale: r.gross30DSale };
    }
  });

  /* Add target FC */
  return rows.map(r => ({
    ...r,
    targetFC:
      r.fc === SELLER_FC
        ? momentum[r.uniwareSKU]?.fc || 'MANUAL'
        : ''
  }));
}
