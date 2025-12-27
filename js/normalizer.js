function normalizeKey(key) {
  return key.toString().toLowerCase().replace(/\s+/g, '');
}

function get(row, keys) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (keys.some(x => nk.includes(x))) return row[k];
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ---------- Seller → Uniware SKU MAP ---------- */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [seller, uniware] = r.split(',');
    if (seller && uniware) {
      sellerToUniware[seller.trim()] = uniware.trim();
    }
  });

  /* ---------- Uniware Remark Map ---------- */
  const remarkMap = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [uniwareSKU, remark] = r.split(',');
    if (uniwareSKU && remark) {
      remarkMap[uniwareSKU.trim()] = remark.trim();
    }
  });

  /* ---------- Uniware Stock (SUM ATP) ---------- */
  const uniwareStock = {};
  sellerStock.forEach(r => {
    const sku = get(r, ['skucode']);
    const qty = Number(get(r, ['available', 'atp'])) || 0;
    if (!sku) return;
    uniwareStock[sku] = (uniwareStock[sku] || 0) + qty;
  });

  /* ---------- FBF Stock (v1.2 logic – DO NOT CHANGE) ---------- */
  const fbfMap = {};
  fbfStock.forEach(r => {
    const sellerSKU = get(r, ['sku']);
    const fc = get(r, ['warehouse']);
    const qty = Number(get(r, ['live'])) || 0;
    if (!sellerSKU || !fc) return;
    const key = `${sellerSKU}||${fc}`;
    fbfMap[key] = (fbfMap[key] || 0) + qty;
  });

  /* ---------- Sales (v1.2 logic – DO NOT CHANGE) ---------- */
  const salesMap = {};
  sales.forEach(r => {
    const sellerSKU = get(r, ['skuid']);
    const fc = get(r, ['location']);
    const qty = Number(get(r, ['grossunits'])) || 0;
    const ret = Number(get(r, ['returnunits'])) || 0;
    if (!sellerSKU || !fc) return;
    const key = `${sellerSKU}||${fc}`;
    if (!salesMap[key]) salesMap[key] = { gross: 0, ret: 0 };
    salesMap[key].gross += qty;
    salesMap[key].ret += ret;
  });

  /* ---------- Build Working Data (v1.2 preserved) ---------- */
  const working = [];

  Object.keys(fbfMap).forEach(key => {
    const [sellerSKU, fc] = key.split('||');
    const uniwareSKU = sellerToUniware[sellerSKU] || '';

    working.push({
      fc,
      sellerSKU,
      uniwareSKU,

      gross30DSale: salesMap[key]?.gross || 0,
      return30D: salesMap[key]?.ret || 0,

      currentFCStock: fbfMap[key],
      sellerStock: uniwareStock[uniwareSKU] || 0,

      uniwareRemark: remarkMap[uniwareSKU] || ''
    });
  });

  return working;
}
