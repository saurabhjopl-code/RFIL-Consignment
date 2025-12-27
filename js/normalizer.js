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

  /* ---------- SELLER SKU → UNIWARE SKU MAP ---------- */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, uniwareSKU] = r.split(',');
    if (sellerSKU && uniwareSKU) {
      sellerToUniware[clean(sellerSKU)] = clean(uniwareSKU);
    }
  });

  /* ---------- UNIWARE STATUS MAP ---------- */
  const uniwareStatus = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, status] = r.split(',');
    if (sellerSKU && status) {
      uniwareStatus[clean(sellerSKU)] = status.trim();
    }
  });

  /* ---------- UNIWARE STOCK (SUM ATP) ---------- */
  const uniwareStockMap = {};
  sellerStock.forEach(r => {
    const rawUniwareSKU = getValue(r, ['sku code', 'sku']);
    if (!rawUniwareSKU) return;

    const uniwareSKU = clean(rawUniwareSKU);
    const stock = Number(getValue(r, ['available', 'atp'])) || 0;

    uniwareStockMap[uniwareSKU] =
      (uniwareStockMap[uniwareSKU] || 0) + stock;
  });

  /* ---------- FBF STOCK (SUM, MAP TO UNIWARE SKU) ---------- */
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const rawSellerSKU = getValue(r, ['sku']);
    const fc = getValue(r, ['warehouse', 'location']);
    if (!rawSellerSKU || !fc) return;

    const sellerSKU = clean(rawSellerSKU);
    const uniwareSKU = sellerToUniware[sellerSKU];
    if (!uniwareSKU) return;

    const stock = Number(getValue(r, ['live'])) || 0;
    const key = `${uniwareSKU}||${fc}`;

    fbfStockMap[key] = (fbfStockMap[key] || 0) + stock;
  });

  /* ---------- SALES (SUM, MAP TO UNIWARE SKU) ---------- */
  const salesMap = {};
  sales.forEach(r => {
    const rawSellerSKU = getValue(r, ['sku id', 'sku']);
    const fc = getValue(r, ['location', 'warehouse']);
    if (!rawSellerSKU || !fc) return;

    const sellerSKU = clean(rawSellerSKU);
    const uniwareSKU = sellerToUniware[sellerSKU];
    if (!uniwareSKU) return;

    const gross = Number(getValue(r, ['gross units'])) || 0;
    const ret = Number(getValue(r, ['return units'])) || 0;

    const key = `${uniwareSKU}||${fc}`;
    if (!salesMap[key]) salesMap[key] = { gross: 0, returns: 0 };

    salesMap[key].gross += gross;
    salesMap[key].returns += ret;
  });

  /* ---------- BUILD FINAL DATASET (UNIWARE SKU KEYED) ---------- */
  const working = [];
  const allKeys = new Set([
    ...Object.keys(salesMap),
    ...Object.keys(fbfStockMap)
  ]);

  allKeys.forEach(key => {
    const [uniwareSKU, fc] = key.split('||');

    const gross = salesMap[key]?.gross || 0;
    const returns = salesMap[key]?.returns || 0;
    const stock = fbfStockMap[key] || 0;

    if (gross === 0 && stock === 0) return;

    working.push({
      fc,
      uniwareSKU,
      gross30DSale: gross,
      return30D: returns,
      currentFCStock: stock,
      sellerStock: uniwareStockMap[uniwareSKU] || 0,
      uniwareStatus: uniwareStatus[uniwareSKU] || 'OPEN'
    });
  });

  return working;
}
