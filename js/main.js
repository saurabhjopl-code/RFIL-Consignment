import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';
import { parseFile } from './parser.js';
import {
  validateSales,
  validateFBFStock,
  validateSellerStock
} from './validator.js';

const salesInput = document.getElementById('salesFile');
const fbfInput = document.getElementById('fbfStockFile');
const sellerInput = document.getElementById('sellerStockFile');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

let fixedData = {};
let parsedData = {};

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

    statusDiv.innerText = 'Reading files...';

    const salesRaw = await loadFile(salesInput.files[0]);
    const fbfRaw = await loadFile(fbfInput.files[0]);
    const sellerRaw = await loadFile(sellerInput.files[0]);

    statusDiv.innerText = 'Parsing files...';

    parsedData.sales = parseFile(salesRaw, 'Sales');
    parsedData.fbfStock = parseFile(fbfRaw, 'FBF Stock');
    parsedData.sellerStock = parseFile(sellerRaw, 'Seller Stock');

    statusDiv.innerText = 'Validating columns...';

    validateSales(parsedData.sales);
    validateFBFStock(parsedData.fbfStock);
    validateSellerStock(parsedData.sellerStock);

    console.log('✅ Parsed & Validated Data:', parsedData);
    statusDiv.innerText = 'Phase 2 complete. Data validated successfully.';

  } catch (err) {
    console.error(err);
    statusDiv.innerText = '❌ Error: ' + err.message;
    alert(err.message);
  }
});

init();
