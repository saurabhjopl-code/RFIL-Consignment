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

// ✅ FIX: properly bind DOM elements
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
    // 🔒 File presence validation
    if (
      !salesFile.files.length ||
      !fbfFile.files.length ||
      !sellerFile.files.length
    ) {
      alert('Please upload ALL required files.');
      return;
    }

    statusDiv.innerText = 'Reading files...';

    const sales = parseFile(await loadFile(salesFile.files[0]));
    const fbf = parseFile(await loadFile(fbfFile.files[0]));
    const seller = parseFile(await loadFile(sellerFile.files[0]));

    statusDiv.innerText = 'Processing data...';

    const base = normalizeData(
      { sales, fbfStock: fbf, sellerStock: seller },
      fixedData
    );

    finalData = base.map(r => {
      // Seller FC (Non-FBF)
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
    console.error(err);
    alert(err.message);
    statusDiv.innerText = 'ERROR: ' + err.message;
  }
});

init();
