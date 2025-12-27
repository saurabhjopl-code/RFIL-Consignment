import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';
import { parseFile } from './parser.js';
import { validateSales, validateFBFStock, validateSellerStock } from './validator.js';
import { normalizeData } from './normalizer.js';
import { applyStockCover } from './stockCoverLogic.js';
import { decide } from './decisionEngine.js';
import { calculateQuantities } from './quantityLogic.js';
import { getRemarks } from './remarksLogic.js';
import { renderTable } from './reportBuilder.js';
import { exportShipment, exportRecall, exportWholeWorking } from './exportLogic.js';

const salesFile = document.getElementById('salesFile');
const fbfFile = document.getElementById('fbfStockFile');
const sellerFile = document.getElementById('sellerStockFile');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

let fixedData = {};
let finalData = [];

async function init() {
  fixedData = await loadFixedCSVs();
}

generateBtn.onclick = async () => {
  try {
    statusDiv.innerText = 'Processing...';

    const sales = parseFile(await loadFile(salesFile.files[0]));
    const fbf = parseFile(await loadFile(fbfFile.files[0]));
    const seller = parseFile(await loadFile(sellerFile.files[0]));

    validateSales(sales);
    validateFBFStock(fbf);
    validateSellerStock(seller);

    const base = normalizeData({ sales, fbfStock: fbf, sellerStock: seller }, fixedData);

    finalData = base.map(r => {
      const sc = applyStockCover(r);
      const decision = decide(sc);
      const qty = calculateQuantities(sc, decision);

      return {
        ...qty,
        decision,
        remarks: getRemarks(qty, decision)
      };
    });

    renderTable(finalData);
    statusDiv.innerText = `Report Generated (${finalData.length} rows)`;

  } catch (err) {
    alert(err.message);
    statusDiv.innerText = 'Error occurred';
  }
};

document.getElementById('exportShipment').onclick = () => exportShipment(finalData);
document.getElementById('exportRecall').onclick = () => exportRecall(finalData);
document.getElementById('exportWorking').onclick = () => exportWholeWorking(finalData);

init();
