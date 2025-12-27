const UNIWARE_ONLY_FC = 'LOC979d1d9aca154ae0a5d72fc1a199aece';

export function calculateQuantities(row, decision) {

  let sendQty = 0;
  let recallQty = 0;

  if (decision === 'SEND') {
    sendQty = Math.max(row.targetStock - row.currentFCStock, 0);
  }

  if (decision === 'RECALL') {
    recallQty = Math.max(row.currentFCStock - row.targetStock, 0);
  }

  if (decision === 'DISCUSS') {
    sendQty = Math.max(row.targetStock - row.currentFCStock, 0);
    recallQty = Math.max(row.currentFCStock - row.targetStock, 0);
  }

  // 🔴 STEP-1 RULE: No recall for Uniware-only FC
  if (row.fc === UNIWARE_ONLY_FC) {
    recallQty = 0;
  }

  return {
    ...row,
    sendQty: Math.floor(sendQty),
    recallQty: Math.floor(recallQty)
  };
}
