export function parseFile(rawData, fileName) {
  const workbook = XLSX.read(rawData, { type: 'binary' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!json.length) {
    throw new Error(`File ${fileName} is empty`);
  }

  return json;
}
