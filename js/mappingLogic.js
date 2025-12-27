export async function loadFixedCSVs() {
  const skuMap = await fetch('./data/seller_sku_vs_uniware_sku.csv').then(r => r.text());
  const statusMap = await fetch('./data/seller_sku_vs_status.csv').then(r => r.text());

  return {
    skuMap,
    statusMap
  };
}
