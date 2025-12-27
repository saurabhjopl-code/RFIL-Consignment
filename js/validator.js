function normalizeKey(key) {
  return key
    .toString()
    .trim()
    .replace(/\s+/g, ' ');
}

function hasColumns(row, requiredCols) {
  const normalizedRowKeys = Object.keys(row).map(normalizeKey);
  const normalizedRequired = requiredCols.map(normalizeKey);

  return normalizedRequired.every(req =>
    normalizedRowKeys.includes(req)
  );
}

export function validateSales(data) {
  const required = ['SKU ID', 'Location Id', 'Gross Units', 'Return Units'];
  if (!hasColumns(data[0], required)) {
    console.error('Sales headers found:', Object.keys(data[0]));
    throw new Error(
      'Sales file columns mismatch. Required: ' + required.join(', ')
    );
  }
}

export function validateFBFStock(data) {
  const required = ['Warehouse Id', 'SKU', 'Live on Website (FBF Stock)'];
  if (!hasColumns(data[0], required)) {
    console.error('FBF headers found:', Object.keys(data[0]));
    throw new Error(
      'FBF Stock file columns mismatch. Required: ' + required.join(', ')
    );
  }
}

export function validateSellerStock(data) {
  const required = ['Seller SKU', 'Available Stock'];
  if (!hasColumns(data[0], required)) {
    console.error('Seller headers found:', Object.keys(data[0]));
    throw new Error(
      'Seller Stock file columns mismatch. Required: ' + required.join(', ')
    );
  }
}
