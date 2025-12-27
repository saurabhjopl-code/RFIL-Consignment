import { loadFixedCSVs } from './mappingLogic.js';
import { loadFile } from './fileLoader.js';
import { parseFile } from './parser.js';
import { normalizeData } from './normalizer.js';
import { applyStockCover } from './stockCoverLogic.js';
import { decide } from './decisionEngine.js';
import { calculateQuantities } from './quantityLogic.js';
import { getRemarks } from './remarksLogic.js';
import { renderFCTables } from './reportBuilder.js';
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
  statusDiv.innerText = 'Ready. Upload files and generate report.';
}

generateBtn.onclick = async () => {
  statusDiv.innerText = 'Processing...';

  const sales = parseFile(await loadFile(salesFile.files[0]));
  const fbf = parseFile(await loadFile(fbfFile.files[0]));
  const uniware = parseFile(await loadFile(sellerFile.files[0]));

  const base = normalizeData(
    { sales, fbfStock: fbf, sellerStock: uniware },
    fixedData
  );

  finalData = base
    .map(r => {
      const sc = applyStockCover(r);
      const decision = decide(sc);
      const qty = calculateQuantities(sc, decision);
      return {
        ...qty,
        decision,
        remarks: getRemarks(qty, decision)
      };
    })
    .filter(r => !(r.currentFCStock === 0 && r.gross30DSale === 0));

  renderFCTables(finalData);
  statusDiv.innerText = `Report generated. ${finalData.length} rows.`;
};

document.getElementById('exportShipment').onclick = () => exportShipment(finalData);
document.getElementById('exportRecall').onclick = () => exportRecall(finalData);
document.getElementById('exportWorking').onclick = () => exportWholeWorking(finalData);

init();
