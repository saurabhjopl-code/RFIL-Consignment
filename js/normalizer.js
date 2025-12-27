export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  // --- Parse fixed CSVs into maps ---
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

  // --- Seller stock map ---
  const sellerStockMap = {};
  sellerStock.forEach(r => {
    sellerStockMap[r['Seller SKU']] = Number(r['Available Stock']) || 0;
  });

  // --- FBF stock map (SKU × FC) ---
  const fbfStockMap = {};
  fbfStock.forEach(r => {
    const key = `${r['SKU']}|${r['Warehouse Id']}`;
    fbfStockMap[key] = Number(r['Live on Website (FBF Stock)']) || 0;
  });

  // --- Build base working table from SALES ---
  const working = [];

  sales.forEach(r => {
    const sku = r['SKU ID'];
    const fc = r['Location Id'];

    const key = `${sku}|${fc}`;

    working.push({
      fc,
      sellerSKU: sku,

      gross30DSale: Number(r['Gross Units']) || 0,
      return30D: Number(r['Return Units']) || 0,

      currentFCStock: fbfStockMap[key] || 0,
      sellerStock: sellerStockMap[sku] || 0,

      uniwareSKU: skuToUniware[sku] || '',
      uniwareStatus: skuStatus[sku] || 'OPEN'
    });
  });

  return working;
}
