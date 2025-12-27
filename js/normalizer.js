const UNIWARE_ONLY_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

function normalizeKey(key) {
  return key
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()]/g, '');
}

function getLoose(row, keys) {
  for (const k of Object.keys(row)) {
    const nk = normalizeKey(k);
    if (keys.every(x => nk.includes(x))) return row[k];
  }
  return '';
}

export function normalizeData({ sales, fbfStock, sellerStock }, fixedData) {

  /* ===============================
     1. Seller → Uniware SKU mapping
     =============================== */
  const sellerToUniware = {};
  fixedData.skuMap.split('\n').slice(1).forEach(r => {
    const [seller, uniware] = r.split(',');
    if (seller && uniware) {
      sellerToUniware[seller.trim()] = uniware.trim();
    }
  });

  /* ===============================
     2. Uniware Remark (Closed etc.)
     =============================== */
  const remarkMap = {};
  fixedData.statusMap.split('\n').slice(1).forEach(r => {
    const [sku, remark] = r.split(',');
    if (sku && remark) {
      remarkMap[sku.trim()] = remark.trim();
    }
  });

  /* ===============================
     3. ✅ FIXED: Uniware Stock
     =============================== */
  const uniwareStock = {};

  sellerStock.forEach(r => {
    const uniwareSKU = getLoose(r, ['skucode']);
    if (!uniwareSKU) return;

    // 🔴 Robust detection of Available (ATP)
    const atp = Number(
      getLoose(r, ['available', 'atp'])
    ) || 0;

    uniwareStock[uniwareSKU] =
      (uniwareStock[uniwareSKU] || 0) + atp;
  });

  /* ===============================
     4. FBF Stock (unchanged)
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
     5. Sales (unchanged)
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
     6. Build Working Dataset
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

    // 🔴 Uniware-only FC logic
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
