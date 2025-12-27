export function calculateQuantities(row, decision) {
  const targetStock = row.targetStock;

  let sendQty = 0;
  let recallQty = 0;

  // SEND → same as v1.1
  if (decision === 'SEND') {
    sendQty = Math.floor(
      Math.max(targetStock - row.currentFCStock, 0)
    );
  }

  // RECALL → same as v1.1
  if (decision === 'RECALL') {
    recallQty = Math.floor(
      Math.max(row.currentFCStock - targetStock, 0)
    );
  }

  // 🆕 DISCUSS → INDICATIVE quantities (NEW)
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
