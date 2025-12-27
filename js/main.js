import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';
import { parseFile } from './parser.js';
import {
  validateSales,
  validateFBFStock,
  validateSellerStock
} from './validator.js';
import { normalizeData } from './normalizer.js';

const salesInput = document.getElementById('salesFile');
const fbfInput = document.getElementById('fbfStockFile');
const sellerInput = document.getElementById('sellerStockFile');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

let fixedData = {};
let parsedData = {};
let workingData = [];

async function init() {
  statusDiv.innerText = 'Loading fixed reference files...';
  fixedData = await loadFixedCSVs();
  statusDiv.innerText = 'Fixed files loaded. Upload required files.';
}

generateBtn.addEventListener('click', async () => {
  try {
    if (!salesInput.files[0] || !fbfInput.files[0] || !sellerInput.files[0]) {
      alert('Please upload all required files');
      return;
    }

    statusDiv.innerText = 'Reading & parsing files...';

    parsedData.sales = parseFile(await loadFile(salesInput.files[0]));
    parsedData.fbfStock = parseFile(await loadFile(fbfInput.files[0]));
    parsedData.sellerStock = parseFile(await loadFile(sellerInput.files[0]));

    validateSales(parsedData.sales);
    validateFBFStock(parsedData.fbfStock);
    validateSellerStock(parsedData.sellerStock);

    statusDiv.innerText = 'Normalizing & joining data...';

    workingData = normalizeData(parsedData, fixedData);

    console.log('FINAL WORKING DATA (Phase 3):', workingData);

    statusDiv.innerText = `Phase 3 complete. ${workingData.length} rows created.`;

  } catch (err) {
    console.error(err);
    alert(err.message);
    statusDiv.innerText = 'ERROR: ' + err.message;
  }
});

init();
