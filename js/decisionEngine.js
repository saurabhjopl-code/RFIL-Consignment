export function decide(row) {

  // 🔴 CLOSED SKU OVERRIDE
  if (row.uniwareRemark &&
      row.uniwareRemark.toLowerCase().includes('closed')) {
    return 'DO NOT SEND';
  }

  if (row.sellerStock < 10) {
    return 'DO NOT SEND';
  }

  if (row.returnPct > 30) {
    return 'DISCUSS';
  }

  if (row.gsv === 0) {
    return 'RECALL';
  }

  if (row.stockCover < 30) {
    return 'SEND';
  }

  if (row.stockCover <= 45) {
    return 'DISCUSS';
  }

  return 'RECALL';
}
