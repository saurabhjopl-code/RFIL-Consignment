function hasColumns(row, cols) {
  return cols.every(col => Object.prototype.hasOwnProperty.call(row, col));
}

export function validateSales(data) {
  const cols = ['SKU ID', 'Location Id', 'Gross Units', 'Return Units'];
  if (!hasColumns(data[0], cols)) {
    throw new Error('Sales file columns mismatch');
  }
}

export function validateFBFStock(data) {
  const cols = ['Warehouse Id', 'SKU', 'Live on Website (FBF Stock)'];
  if (!hasColumns(data[0], cols)) {
    throw new Error('FBF Stock file columns mismatch');
  }
}

export function validateSellerStock(data) {
  const cols = ['Seller SKU', 'Available Stock'];
  if (!hasColumns(data[0], cols)) {
    throw new Error('Seller Stock file columns mismatch');
  }
}
