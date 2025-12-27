export function calculateQuantities(row, decision) {
  let sendQty = 0;
  let recallQty = 0;

  if (decision === 'SEND') {
    sendQty = Math.floor(
      Math.max(row.targetStock - row.currentFCStock, 0)
    );
  }

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
