export function calculateQuantities(row, decision) {

  // 🔴 HARD OVERRIDE: CLOSED SKU → FULL RECALL
  if (row.uniwareRemark && row.uniwareRemark.toLowerCase().includes('closed')) {
    return {
      ...row,
      sendQty: 0,
      recallQty: row.currentFCStock
    };
  }

  const targetStock = row.targetStock;
  let sendQty = 0;
  let recallQty = 0;

  if (decision === 'SEND') {
    sendQty = Math.floor(
      Math.max(targetStock - row.currentFCStock, 0)
    );
  }

  if (decision === 'RECALL') {
    recallQty = Math.floor(
      Math.max(row.currentFCStock - targetStock, 0)
    );
  }

  if (decision === 'DISCUSS') {
    sendQty = Math.floor(
      Math.max(targetStock - row.currentFCStock, 0)
    );
    recallQty = Math.floor(
      Math.max(row.currentFCStock - targetStock, 0)
    );
  }

  return {
    ...row,
    sendQty,
    recallQty
  };
}
