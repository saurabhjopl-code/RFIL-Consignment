const UNIWARE_ONLY_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

function clean(val) {
  return (val || '').toString().trim();
}

function key(val) {
  return clean(val).toUpperCase();
}

function getVal(row, keywords) {
  for (const k of Object.keys(row)) {
    const nk = k.toLowerCase();
    if (keywords.some(w => nk.includes(w))) return row[k];
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ---------- Seller → Uniware SKU map ---------- */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [s, u] = r.split(',');
    if (!s || !u) return;
    sellerToUniware[key(s)] = key(u);
  });

  /* ---------- Uniware Status ---------- */
  const uniwareStatus = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [u, status] = r.split(',');
    if (!u) return;
    uniwareStatus[key(u)] = clean(status || '');
  });

  /* ---------- Uniware Stock (Total Inventory) ---------- */
  const uniwareStockMap = {};
  sellerStock.forEach(r => {
    const uSku = key(getVal(r, ['sku']));
    const qty = Number(getVal(r, ['total inventory'])) || 0;
    if (!uSku) return;
    uniwareStockMap[uSku] = (uniwareStockMap[uSku] || 0) + qty;
  });

  /* ---------- FBF Stock ---------- */
  const fbfMap = {};
  fbfStock.forEach(r => {
    const sSku = key(getVal(r, ['sku']));
    const fc = clean(getVal(r, ['warehouse', 'location']));
    const qty = Number(getVal(r, ['live'])) || 0;
    if (!sSku || !fc) return;
    const k = `${sSku}||${fc}`;
    fbfMap[k] = (fbfMap[k] || 0) + qty;
  });

  /* ---------- Sales ---------- */
  const salesMap = {};
  sales.forEach(r => {
    const sSku = key(getVal(r, ['sku']));
    const fc = clean(getVal(r, ['location']));
    const gross = Number(getVal(r, ['gross units'])) || 0;
    const ret = Number(getVal(r, ['return units'])) || 0;
    if (!sSku || !fc) return;
    const k = `${sSku}||${fc}`;
    if (!salesMap[k]) salesMap[k] = { gross: 0, ret: 0 };
    salesMap[k].gross += gross;
    salesMap[k].ret += ret;
  });

  /* ---------- Build Final Dataset ---------- */
  const out = [];
  const keys = new Set([
    ...Object.keys(fbfMap),
    ...Object.keys(salesMap)
  ]);

  keys.forEach(k => {
    const [sellerSKU, fc] = k.split('||');
    const uniwareSKU = sellerToUniware[sellerSKU] || '';
    const uniStock = uniwareStockMap[uniwareSKU] || 0;

    let currentFCStock = fbfMap[k] || 0;

    // 🔴 STEP-1 LOGIC: Uniware-only FC
    if (fc === UNIWARE_ONLY_FC) {
      currentFCStock = uniStock;
    }

    out.push({
      fc,
      sellerSKU,
      uniwareSKU,

      gross30DSale: salesMap[k]?.gross || 0,
      return30D: salesMap[k]?.ret || 0,

      currentFCStock,
      sellerStock: uniStock,

      uniwareStatus: uniwareStatus[uniwareSKU] || 'OPEN'
    });
  });

  return out;
}
