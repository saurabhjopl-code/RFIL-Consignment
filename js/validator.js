function hasColumns(row, requiredCols) {
  return requiredCols.every(col => Object.prototype.hasOwnProperty.call(row, col));
}

export function validateSales(data) {
  const required = ['SKU ID', 'Location Id', 'Gross Units', 'Return Units'];
  if (!hasColumns(data[0], required)) {
    throw new Error(
      'Sales file column mismatch. Required: ' + required.join(', ')
    );
  }
}

export function validateFBFStock(data) {
  const required = ['Warehouse Id', 'SKU', 'Live on Website (FBF Stock)'];
  if (!hasColumns(data[0], required)) {
    throw new Error(
      'FBF Stock file column mismatch. Required: ' + required.join(', ')
    );
  }
}

export function validateSellerStock(data) {
  const required = ['Seller SKU', 'Available Stock'];
  if (!hasColumns(data[0], required)) {
    throw new Error(
      'Seller Stock file column mismatch. Required: ' + required.join(', ')
    );
  }
}
