import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';
import { parseFile } from './parser.js';
import { normalizeData } from './normalizer.js';
import { applyStockCover } from './stockCoverLogic.js';
import { decide } from './decisionEngine.js';
import { calculateQuantities } from './quantityLogic.js';
import { getRemarks } from './remarksLogic.js';
import { renderTable } from './reportBuilder.js';

const SELLER_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

let fixedData = {};
let finalData = [];

async function init() {
  fixedData = await loadFixedCSVs();
}

document.getElementById('generateBtn').onclick = async () => {

  const sales = parseFile(await loadFile(salesFile.files[0]));
  const fbf = parseFile(await loadFile(fbfFile.files[0]));
  const seller = parseFile(await loadFile(sellerFile.files[0]));

  const base = normalizeData({ sales, fbfStock: fbf, sellerStock: seller }, fixedData);

  finalData = base.map(r => {
    if (r.fc === SELLER_FC) {
      return {
        ...r,
        stockCover: 0,
        decision: 'SELLER_ONLY',
        sendQty: 0,
        recallQty: 0,
        remarks: 'Selling from seller FC'
      };
    }

    const sc = applyStockCover(r);
    const d = decide(sc);
    const q = calculateQuantities(sc, d);

    return {
      ...q,
      decision: d,
      remarks: getRemarks(q, d)
    };
  });

  renderTable(finalData);
};

init();
