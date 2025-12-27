export function getRemarks(row, decision) {
  const remarks = [];

  if (row.uniwareStatus === 'CLOSE') {
    remarks.push('Uniware SKU closed');
  }

  if (row.sellerStock < 10) {
    remarks.push('Seller stock below minimum threshold');
  }

  if (row.returnPct > 30) {
    remarks.push('High return rate (>30%)');
  }

  if (row.gsv === 0) {
    remarks.push('Non-moving SKU (0 sales in 30 days)');
  }

  if (row.stockCover < 30) {
    remarks.push('Fast-moving, low stock cover');
  }

  if (row.stockCover > 30 && row.stockCover <= 45) {
    remarks.push('Borderline stock cover (30–45 days)');
  }

  if (row.stockCover > 45) {
    remarks.push('Overstocked (>45 days cover)');
  }

  return remarks.join(', ');
}
