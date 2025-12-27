function normalizeKey(key) {
  return key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\(\)\-]/g, '');
}

function getValue(row, aliases) {
  const keys = Object.keys(row);
  for (const k of keys) {
    if (aliases.includes(normalizeKey(k))) {
      return row[k];
    }
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ---------- FIXED CSV MAPS ---------- */
  const skuToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, uniwareSKU] = r.split(',');
    if (sellerSKU && uniwareSKU) {
      skuToUniware[sellerSKU.trim()] = uniwareSKU.trim();
    }
  });

  const skuStatus = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [sellerSKU, status] = r.split(',');
    if (sellerSKU && status) {
      skuStatus[sellerSKU.trim()] = status.trim();
    }
  });

  /* ---------- SELLER STOCK MAP (FIXED) ---------- */
  const sellerStockMap = {};
  sellerStock.forEach(r => {
    const sku = getValue(r, ['seller sku', 'sku']);
    const stock = getValue(r, [
      'available stock',
      'available qty',
      'available quantity',
      'current stock',
      'stock available'
    ]);
    sellerStockMap[sku] = Number(stock) || 0;
  });

  /* ---------- FBF STOCK MAP ---------- */
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const sku = getValue(r, ['sku']);
    const fc = getValue(r, ['warehouse id']);
    const stock = getValue(r, [
      'live on website fbf stock',
      'live on website stock',
      'live on website'
    ]);
    fbfStockMap[`${sku}|${fc}`] = Number(stock) || 0;
  });

  /* ---------- BUILD WORKING DATA ---------- */
  const working = [];

  sales.forEach(r => {
    const sku = getValue(r, ['sku id']);
    const fc = getValue(r, ['location id']);

    working.push({
      fc,
      sellerSKU: sku,

      gross30DSale: Number(getValue(r, ['gross units'])) || 0,
      return30D: Number(getValue(r, ['return units'])) || 0,

      currentFCStock: fbfStockMap[`${sku}|${fc}`] || 0,
      sellerStock: sellerStockMap[sku] || 0,

      uniwareSKU: skuToUniware[sku] || '',
      uniwareStatus: skuStatus[sku] || 'OPEN'
    });
  });

  return working;
}
