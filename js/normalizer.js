const UNIWARE_ONLY_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

/* ===============================
   SKU NORMALIZATION
   =============================== */
function normalizeSKU(val) {
  if (!val) return '';
  return val
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\u00A0/g, '')
    .replace(/\s+/g, '');
}

function normalizeKey(key) {
  return key
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()]/g, '');
}

function findColumn(row, mustContainAll) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (mustContainAll.every(x => nk.includes(x))) {
      return k;
    }
  }
  return null;
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ===============================
     Seller → Uniware SKU mapping
     =============================== */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [seller, uniware] = r.split(',');
    if (!seller || !uniware) return;
    sellerToUniware[normalizeSKU(seller)] = normalizeSKU(uniware);
  });

  /* ===============================
     Uniware Remarks (Closed etc.)
     =============================== */
  const remarkMap = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [sku, remark] = r.split(',');
    if (!sku || !remark) return;
    remarkMap[normalizeSKU(sku)] = remark.trim();
  });

  /* ===============================
     ✅ CORRECT UNIWARE STOCK
     =============================== */
  const uniwareStock = {};

  sellerStock.forEach(r => {
    const skuCol = findColumn(r, ['skucode']);
    if (!skuCol) return;

    const uniwareSKU = normalizeSKU(r[skuCol]);
    if (!uniwareSKU) return;

    // Priority-based stock column detection
    const totalStockCol =
      findColumn(r, ['total', 'stock']) ||
      findColumn(r, ['total', 'inventory']) ||
      findColumn(r, ['available', 'atp']);

    const qty = Number(r[totalStockCol]) || 0;

    uniwareStock[uniwareSKU] =
      (uniwareStock[uniwareSKU] || 0) + qty;
  });

  /* ===============================
     FBF Stock (unchanged)
     =============================== */
  const fbfMap = {};
  fbfStock.forEach(r => {
    const skuCol = findColumn(r, ['sku']);
    const fcCol = findColumn(r, ['warehouse']);
    const liveCol = findColumn(r, ['live']);

    if (!skuCol || !fcCol || !liveCol) return;

    const sellerSKU = normalizeSKU(r[skuCol]);
    const fc = r[fcCol];
    const qty = Number(r[liveCol]) || 0;

    if (!sellerSKU || !fc) return;
    const key = `${sellerSKU}||${fc}`;
    fbfMap[key] = (fbfMap[key] || 0) + qty;
  });

  /* ===============================
     Sales (unchanged)
     =============================== */
  const salesMap = {};
  sales.forEach(r => {
    const skuCol = findColumn(r, ['skuid']);
    const fcCol = findColumn(r, ['location']);
    const qtyCol = findColumn(r, ['grossunits']);
    const retCol = findColumn(r, ['returnunits']);

    if (!skuCol || !fcCol || !qtyCol) return;

    const sellerSKU = normalizeSKU(r[skuCol]);
    const fc = r[fcCol];
    const qty = Number(r[qtyCol]) || 0;
    const ret = Number(r[retCol]) || 0;

    if (!sellerSKU || !fc) return;
    const key = `${sellerSKU}||${fc}`;

    if (!salesMap[key]) salesMap[key] = { gross: 0, ret: 0 };
    salesMap[key].gross += qty;
    salesMap[key].ret += ret;
  });

  /* ===============================
     Build Working Dataset
     =============================== */
  const working = [];
  const keys = new Set([
    ...Object.keys(fbfMap),
    ...Object.keys(salesMap)
  ]);

  keys.forEach(key => {
    const [sellerSKU, fc] = key.split('||');
    const uniwareSKU = sellerToUniware[sellerSKU] || '';
    const uniStock = uniwareStock[uniwareSKU] || 0;

    let currentFCStock = fbfMap[key] || 0;

    // Uniware-only FC
    if (fc === UNIWARE_ONLY_FC) {
      currentFCStock = uniStock;
    }

    working.push({
      fc,
      sellerSKU,
      uniwareSKU,
      gross30DSale: salesMap[key]?.gross || 0,
      return30D: salesMap[key]?.ret || 0,
      currentFCStock,
      sellerStock: uniStock,
      uniwareRemark: remarkMap[uniwareSKU] || '',
      recommendedFC: ''
    });
  });

  return working;
}
