export function decide(row) {

  // 🔴 HARD OVERRIDE: CLOSED SKU
  if (row.uniwareRemark && row.uniwareRemark.toLowerCase().includes('closed')) {
    return 'DO NOT SEND';
  }

  // Seller stock below minimum
  if (row.sellerStock < 10) {
    return 'DO NOT SEND';
  }

  // High return risk
  if (row.returnPct > 30) {
    return 'DISCUSS';
  }

  // Non-moving SKU
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
