export function calculateQuantities(row, decision) {
  let sendQty = 0;
  let recallQty = 0;

  // SEND
  if (decision === 'SEND') {
    sendQty = Math.floor(
      Math.max(row.targetStock - row.currentFCStock, 0)
    );
  }

  // DISCUSS – High Return Rate ONLY → allow send
  if (
    decision === 'DISCUSS' &&
    row.returnPct > 30 &&
    row.stockCover < 30
  ) {
    sendQty = Math.floor(
      Math.max(row.targetStock - row.currentFCStock, 0)
    );
  }

  // RECALL
  if (decision === 'RECALL') {
    recallQty = Math.floor(
      Math.max(row.currentFCStock - row.targetStock, 0)
    );
  }

  return {
    ...row,
    sendQty,
    recallQty
  };
}
