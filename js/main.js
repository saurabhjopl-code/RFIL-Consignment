import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';

const salesInput = document.getElementById('salesFile');
const fbfInput = document.getElementById('fbfStockFile');
const sellerInput = document.getElementById('sellerStockFile');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

let fixedData = {};
let uploadedFiles = {};

async function init() {
  statusDiv.innerText = 'Loading fixed reference files from GitHub...';

  try {
    fixedData = await loadFixedCSVs();
    console.log('Fixed CSVs Loaded:', fixedData);
    statusDiv.innerText = 'Fixed files loaded successfully. Please upload required files.';
  } catch (err) {
    console.error(err);
    statusDiv.innerText = 'Error loading fixed reference files.';
  }
}

generateBtn.addEventListener('click', async () => {
  if (!salesInput.files[0] || !fbfInput.files[0] || !sellerInput.files[0]) {
    alert('Please upload all three required files.');
    return;
  }

  statusDiv.innerText = 'Reading uploaded files...';

  uploadedFiles.sales = await loadFile(salesInput.files[0]);
  uploadedFiles.fbfStock = await loadFile(fbfInput.files[0]);
  uploadedFiles.sellerStock = await loadFile(sellerInput.files[0]);

  console.log('Uploaded Sales File:', uploadedFiles.sales);
  console.log('Uploaded FBF Stock File:', uploadedFiles.fbfStock);
  console.log('Uploaded Seller Stock File:', uploadedFiles.sellerStock);

  statusDiv.innerText = 'Files loaded successfully. Ready for Phase 2 (Parsing & Validation).';
});

init();
