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

  /* ======================================================
     1) SELLER → UNIWARE SKU MAP  (THE BRIDGE)
     ====================================================== */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, uniwareSKU] = r.split(',');
    if (!sellerSKU || !uniwareSKU) return;
    sellerToUniware[key(sellerSKU)] = key(uniwareSKU);
  });

  /* ======================================================
     2) UNIWARE STATUS (BY UNIWARE SKU)
     ====================================================== */
  const uniwareStatus = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [uSku, remark] = r.split(',');
    if (!uSku) return;
    uniwareStatus[key(uSku)] = clean(remark || '');
  });

  /* ======================================================
     3) UNIWARE STOCK (BY UNIWARE SKU)
        SOURCE = Total Inventory (LOCKED)
     ====================================================== */
  const uniwareStock = {};
  sellerStock.forEach(r => {
    const uSku = key(getVal(r, ['sku code', 'sku']));
    const qty = Number(getVal(r, ['total inventory'])) || 0;
    if (!uSku) return;
    uniwareStock[uSku] = (uniwareStock[uSku] || 0) + qty;
  });

  /* ======================================================
     4) FBF STOCK (BY SELLER SKU + FC)
     ====================================================== */
  const fbfMap = {};
  fbfStock.forEach(r => {
    const sSku = key(getVal(r, ['sku']));
    const fc = clean(getVal(r, ['warehouse', 'location']));
    const qty = Number(getVal(r, ['live'])) || 0;
    if (!sSku || !fc) return;
    const k = `${sSku}||${fc}`;
    fbfMap[k] = (fbfMap[k] || 0) + qty;
  });

  /* ======================================================
     5) SALES (BY SELLER SKU + FC)
     ====================================================== */
  const salesMap = {};
  sales.forEach(r => {
    const sSku = key(getVal(r, ['sku id', 'sku']));
    const fc = clean(getVal(r, ['location', 'warehouse']));
    const gross = Number(getVal(r, ['gross units'])) || 0;
    const ret = Number(getVal(r, ['return units'])) || 0;
    if (!sSku || !fc) return;
    const k = `${sSku}||${fc}`;
    if (!salesMap[k]) salesMap[k] = { gross: 0, ret: 0 };
    salesMap[k].gross += gross;
    salesMap[k].ret += ret;
  });

  /* ======================================================
     6) BUILD FINAL DATASET (CORRECT JOIN ORDER)
     ====================================================== */
  const out = [];
  const keys = new Set([
    ...Object.keys(fbfMap),
    ...Object.keys(salesMap)
  ]);

  keys.forEach(k => {
    const [sellerSKU, fc] = k.split('||');

    // 🔑 CRITICAL STEP: MAP FIRST
    const uniwareSKU = sellerToUniware[sellerSKU] || '';

    out.push({
      fc,
      sellerSKU,
      uniwareSKU,

      gross30DSale: salesMap[k]?.gross || 0,
      return30D: salesMap[k]?.ret || 0,

      currentFCStock: fbfMap[k] || 0,
      uniwareStock: uniwareStock[uniwareSKU] || 0,

      uniwareStatus: uniwareStatus[uniwareSKU] || 'OPEN'
    });
  });

  return out;
}
