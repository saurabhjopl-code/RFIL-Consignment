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

const salesInput = document.getElementById('salesFile');
const fbfInput = document.getElementById('fbfStockFile');
const sellerInput = document.getElementById('sellerStockFile');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

let fixedData = {};
let workingData = [];
let finalData = [];

async function init() {
  statusDiv.innerText = 'Loading fixed reference files...';
  fixedData = await loadFixedCSVs();
  statusDiv.innerText = 'Fixed files loaded. Upload required files.';
}

generateBtn.addEventListener('click', async () => {
  try {
    statusDiv.innerText = 'Processing...';

    const sales = parseFile(await loadFile(salesInput.files[0]));
    const fbf = parseFile(await loadFile(fbfInput.files[0]));
    const seller = parseFile(await loadFile(sellerInput.files[0]));

    validateSales(sales);
    validateFBFStock(fbf);
    validateSellerStock(seller);

    workingData = normalizeData(
      { sales, fbfStock: fbf, sellerStock: seller },
      fixedData
    );

    finalData = workingData.map(row => {
      const withSC = applyStockCover(row);
      const decision = decide(withSC);
      const withQty = calculateQuantities(withSC, decision);
      const remarks = getRemarks(withQty, decision);

      return {
        ...withQty,
        decision,
        remarks
      };
    });

    console.log('FINAL DATA (Phase 4):', finalData);

    statusDiv.innerText =
      `Phase 4 complete. ${finalData.length} rows processed.`;

  } catch (err) {
    console.error(err);
    alert(err.message);
    statusDiv.innerText = 'ERROR: ' + err.message;
  }
});

init();
