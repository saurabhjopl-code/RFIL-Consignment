export function decide(row) {
  // Hard blocks
  if (row.uniwareStatus === 'CLOSE') {
    return 'DO NOT SEND';
  }

  if (row.sellerStock < 10) {
    return 'DO NOT SEND';
  }

  // High return risk
  if (row.returnPct > 30) {
    return 'DISCUSS';
  }

  // Non-moving
  if (row.gsv === 0) {
    return 'RECALL';
  }

  // Stock cover logic
  if (row.stockCover < 30) {
    return 'SEND';
  }

  if (row.stockCover <= 45) {
    return 'DISCUSS';
  }

  return 'RECALL';
}
