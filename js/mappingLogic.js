export async function loadFixedCSVs() {
  const skuMapping = await fetch('./data/seller_sku_vs_uniware_sku.csv')
    .then(res => {
      if (!res.ok) throw new Error('SKU mapping file not found');
      return res.text();
    });

  const skuStatus = await fetch('./data/seller_sku_vs_status.csv')
    .then(res => {
      if (!res.ok) throw new Error('SKU status file not found');
      return res.text();
    });

  return {
    skuMapping,
    skuStatus
  };
}
