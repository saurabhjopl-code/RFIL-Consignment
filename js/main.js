import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';
import { parseFile } from './parser.js';
import {
  validateSales,
  validateFBFStock,
  validateSellerStock
} from './validator.js';
import { normalizeData } from './normalizer.js';
import { applyStockCover } from './stockCoverLogic.js';
import { decide } from './decisionEngine.js';
import { calculateQuantities } from './quantityLogic.js';
import { getRemarks } from './remarksLogic.js';
import { renderTable } from './reportBuilder.js';
import {
  exportShipment,
  exportRecall,
  exportWholeWorking
} from './exportLogic.js';

const salesFile = document.getElementById('salesFile');
const fbfFile = document.getElementById('fbfStockFile');
const sellerFile = document.getElementById('sellerStockFile');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

let fixedData = {};
let finalData = [];

async function init() {
  statusDiv.innerText = 'Loading fixed reference files...';
  fixedData = await loadFixedCSVs();
  statusDiv.innerText = 'Ready. Upload files and click Generate Report.';
}

generateBtn.addEventListener('click', async () => {
  try {
    // 🔒 HARD FILE VALIDATION
    if (!salesFile.files.length ||
        !fbfFile.files.length ||
        !sellerFile.files.length) {
      alert('Please upload ALL required files.');
      return;
    }

    statusDiv.innerText = 'Reading files...';

    const salesRaw = await loadFile(salesFile.files[0]);
    const fbfRaw = await loadFile(fbfFile.files[0]);
    const sellerRaw = await loadFile(sellerFile.files[0]);

    statusDiv.innerText = 'Parsing files...';

    const sales = parseFile(salesRaw);
    const fbf = parseFile(fbfRaw);
    const seller = parseFile(sellerRaw);

    statusDiv.innerText = 'Validating columns...';

    validateSales(sales);
    validateFBFStock(fbf);
    validateSellerStock(seller);

    statusDiv.innerText = 'Processing stock cover logic...';

    const base = normalizeData(
      { sales, fbfStock: fbf, sellerStock: seller },
      fixedData
    );

    finalData = base.map(row => {
      const sc = applyStockCover(row);
      const decision = decide(sc);
      const qty = calculateQuantities(sc, decision);
      return {
        ...qty,
        decision,
        remarks: getRemarks(qty, decision)
      };
    });

    renderTable(finalData);

    statusDiv.innerText =
      `Report generated successfully (${finalData.length} rows).`;

    console.log('FINAL DATA:', finalData);

  } catch (err) {
    console.error(err);
    alert(err.message);
    statusDiv.innerText = 'ERROR: ' + err.message;
  }
});

// EXPORT BUTTONS (SAFE GUARDS)
document.getElementById('exportShipment').onclick = () => {
  if (!finalData.length) {
    alert('Generate report first');
    return;
  }
  exportShipment(finalData);
};

document.getElementById('exportRecall').onclick = () => {
  if (!finalData.length) {
    alert('Generate report first');
    return;
  }
  exportRecall(finalData);
};

document.getElementById('exportWorking').onclick = () => {
  if (!finalData.length) {
    alert('Generate report first');
    return;
  }
  exportWholeWorking(finalData);
};

init();
