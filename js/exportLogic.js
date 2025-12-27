function downloadExcel(rows, fileName) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, fileName);
}

export function exportShipment(data) {
  const rows = data
    .filter(r =>
      (r.decision === 'SEND' || r.decision === 'DISCUSS') &&
      r.sendQty >= 0 &&
      r.currentFCStock < r.targetStock
    )
    .map(r => ({
      'Warehouse Id': r.fc,
      'Seller SKU': r.sellerSKU,
      'Stock to Send': r.sendQty,
      'Decision': r.decision,
      'Remarks': r.remarks
    }));

  downloadExcel(rows, 'shipment_plan.xlsx');
}

export function exportRecall(data) {
  const rows = data
    .filter(r =>
      (r.decision === 'RECALL' || r.decision === 'DISCUSS') &&
      r.currentFCStock > r.targetStock
    )
    .map(r => ({
      'Warehouse Id': r.fc,
      'Seller SKU': r.sellerSKU,
      'Stock to Recall': r.recallQty,
      'Decision': r.decision,
      'Remarks': r.remarks
    }));

  downloadExcel(rows, 'recall_plan.xlsx');
}

export function exportWholeWorking(data) {
  const rows = data.map(r => ({
    'Warehouse Id': r.fc,
    'Seller SKU': r.sellerSKU,
    'Current FC Stock': r.currentFCStock,
    '30D Gross Sale': r.gross30DSale,
    'Stock Cover': r.stockCover,
    'Decision': r.decision,
    'Remarks': r.remarks
  }));

  downloadExcel(rows, 'whole_working.xlsx');
}
