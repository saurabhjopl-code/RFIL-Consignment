function normalizeKey(key) {
  return key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\(\)\-]/g, '');
}

function hasColumnAlias(row, aliases) {
  const headers = Object.keys(row).map(normalizeKey);
  return aliases.some(a => headers.includes(normalizeKey(a)));
}

/* ---------- SALES VALIDATION ---------- */
export function validateSales(data) {
  const row = data[0];

  if (
    !hasColumnAlias(row, ['sku id']) ||
    !hasColumnAlias(row, ['location id']) ||
    !hasColumnAlias(row, ['gross units']) ||
    !hasColumnAlias(row, ['return units'])
  ) {
    console.error('Sales headers found:', Object.keys(row));
    throw new Error(
      'Sales file columns mismatch. Required: SKU ID, Location Id, Gross Units, Return Units'
    );
  }
}

/* ---------- FBF STOCK VALIDATION ---------- */
export function validateFBFStock(data) {
  const row = data[0];

  if (
    !hasColumnAlias(row, ['warehouse id']) ||
    !hasColumnAlias(row, ['sku']) ||
    !hasColumnAlias(row, [
      'live on website fbf stock',
      'live on website fbfstock',
      'live on website stock',
      'live on website'
    ])
  ) {
    console.error('FBF headers found:', Object.keys(row));
    throw new Error(
      'FBF Stock file columns mismatch. Required: Warehouse Id, SKU, Live on Website (FBF Stock)'
    );
  }
}

/* ---------- SELLER STOCK VALIDATION ---------- */
export function validateSellerStock(data) {
  const row = data[0];

  if (
    !hasColumnAlias(row, ['seller sku', 'sku']) ||
    !hasColumnAlias(row, [
      'available stock',
      'available qty',
      'available quantity',
      'current stock',
      'stock available'
    ])
  ) {
    console.error('Seller headers found:', Object.keys(row));
    throw new Error(
      'Seller Stock file columns mismatch. Required: Seller SKU, Available Stock'
    );
  }
}
