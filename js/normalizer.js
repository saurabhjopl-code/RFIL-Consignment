function normalizeKey(key) {
  return key.toLowerCase().replace(/\s+/g, '');
}

function get(row, keywords) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (keywords.some(w => nk.includes(w))) return row[k];
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* Seller → Uniware SKU */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [seller, uniware] = r.split(',');
    if (seller && uniware) sellerToUniware[seller.trim()] = uniware.trim();
  });

  /* Uniware Status */
  const statusMap = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [sku, status] = r.split(',');
    if (sku && status) statusMap[sku.trim()] = status.trim();
  });

  /* Uniware Stock (SUM ATP by Uniware SKU) */
  const uniwareStock = {};
  sellerStock.forEach(r => {
    const sku = get(r, ['skucode']);
    const qty = Number(get(r, ['available', 'atp'])) || 0;
    if (!sku) return;
    uniwareStock[sku] = (uniwareStock[sku] || 0) + qty;
  });

  /* FBF Stock (SUM Live on Website by Seller SKU + FC) */
  const fbfMap = {};
  fbfStock.forEach(r => {
    const sku = get(r, ['sku']);
    const fc = get(r, ['warehouse']);
    const qty = Number(get(r, ['live'])) || 0;
    if (!sku || !fc) return;
    const key = `${sku}||${fc}`;
    fbfMap[key] = (fbfMap[key] || 0) + qty;
  });

  /* Sales (SUM Gross Units by Seller SKU + FC) */
  const salesMap = {};
  sales.forEach(r => {
    const sku = get(r, ['skuid']);
    const fc = get(r, ['location']);
    const qty = Number(get(r, ['grossunits'])) || 0;
    const ret = Number(get(r, ['returnunits'])) || 0;
    if (!sku || !fc) return;
    const key = `${sku}||${fc}`;
    if (!salesMap[key]) salesMap[key] = { gross: 0, ret: 0 };
    salesMap[key].gross += qty;
    salesMap[key].ret += ret;
  });

  /* Build Working Data */
  const working = [];

  Object.keys(salesMap).forEach(key => {
    const [sellerSKU, fc] = key.split('||');
    const uniwareSKU = sellerToUniware[sellerSKU] || '';
    working.push({
      fc,
      sellerSKU,
      uniwareSKU,
      gross30DSale: salesMap[key].gross,
      return30D: salesMap[key].ret,
      currentFCStock: fbfMap[key] || 0,
      sellerStock: uniwareStock[uniwareSKU] || 0,
      uniwareStatus: statusMap[uniwareSKU] || 'OPEN'
    });
  });

  Object.keys(fbfMap).forEach(key => {
    if (salesMap[key]) return;
    const [sellerSKU, fc] = key.split('||');
    const uniwareSKU = sellerToUniware[sellerSKU] || '';
    working.push({
      fc,
      sellerSKU,
      uniwareSKU,
      gross30DSale: 0,
      return30D: 0,
      currentFCStock: fbfMap[key],
      sellerStock: uniwareStock[uniwareSKU] || 0,
      uniwareStatus: statusMap[uniwareSKU] || 'OPEN'
    });
  });

  return working;
}
