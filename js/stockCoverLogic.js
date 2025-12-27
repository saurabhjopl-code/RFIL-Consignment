export function applyStockCover(row) {
  const gsv = row.gross30DSale / 30;

  const stockCover =
    gsv > 0 ? row.currentFCStock / gsv : Infinity;

  const returnPct =
    row.gross30DSale > 0
      ? (row.return30D / row.gross30DSale) * 100
      : 0;

  return {
    ...row,
    gsv,
    stockCover: Number(stockCover.toFixed(1)),
    returnPct: Number(returnPct.toFixed(1)),
    targetStock: gsv * 30
  };
}
