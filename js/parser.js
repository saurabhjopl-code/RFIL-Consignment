export function parseFile(rawData) {
  const workbook = XLSX.read(rawData, { type: 'binary' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!json.length) {
    throw new Error('Uploaded file is empty');
  }

  return json;
}
