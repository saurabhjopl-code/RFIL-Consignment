const UNIWARE_ONLY_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

function normalizeKey(key) {
  return key
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()]/g, ''); // 🔴 IMPORTANT FIX
}

function getExact(row, exactName) {
  for (const k of Object.keys(row)) {
    if (k.trim().toLowerCase() === exactName.toLowerCase()) {
      return row[k];
    }
  }
  return '';
}

function getLoose(row, keys) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (keys.some(x => nk.includes(x))) return row[k];
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ===============================
     Seller → Uniware SKU mapping
     =============================== */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [seller, uniware] = r.split(',');
    if (seller && uniware) {
      sellerToUniware[seller.trim()] = uniware.trim();
    }
  });

  /* ===============================
     Uniware Remark (Closed etc.)
     =============================== */
  const remarkMap = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [uniwareSKU, remark] = r.split(',');
    if (uniwareSKU && remark) {
      remarkMap[uniwareSKU.trim()] = remark.trim();
    }
  });

  /* ===============================
     ✅ FIXED: Uniware Stock
     =============================== */
  const uniwareStock = {};
  sellerStock.forEach(r => {
    const sku =
      getLoose(r, ['skucode']) ||
      getLoose(r, ['sku code']);

    // 🔴 HARD MAP EXACT COLUMN
    let qty = getExact(r, 'Available (ATP)');

    qty = Number(qty) || 0;
    if (!sku) return;

    uniwareStock[sku] = (uniwareStock[sku] || 0) + qty;
  });

  /* ===============================
     FBF Stock (unchanged)
     =============================== */
  const fbfMap = {};
  fbfStock.forEach(r => {
    const sellerSKU = getLoose(r, ['sku']);
    const fc = getLoose(r, ['warehouse']);
    const qty = Number(getLoose(r, ['live'])) || 0;
    if (!sellerSKU || !fc) return;
    const key = `${sellerSKU}||${fc}`;
    fbfMap[key] = (fbfMap[key] || 0) + qty;
  });

  /* ===============================
     Sales (unchanged)
     =============================== */
  const salesMap = {};
  sales.forEach(r => {
    const sellerSKU = getLoose(r, ['skuid']);
    const fc = getLoose(r, ['location']);
    const qty = Number(getLoose(r, ['grossunits'])) || 0;
    const ret = Number(getLoose(r, ['returnunits'])) || 0;
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

    // 🔴 Uniware-only FC
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
