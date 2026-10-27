/**
 * Utility for exporting data tables to CSV format
 * Formatted with UTF-8 BOM for seamless compatibility with Microsoft Excel, Google Sheets, and LibreOffice.
 */

export const exportToCsv = (arg1, arg2, arg3) => {
  let columns = [];
  let data = [];
  let filename = 'attendance-report.csv';

  // Polymorphic support:
  // Signature A: exportToCsv(dataArray, filename)
  // Signature B: exportToCsv(columnsArray, dataArray, filename)
  if (Array.isArray(arg1) && (typeof arg2 === 'string' || arg2 === undefined)) {
    data = arg1;
    filename = arg2 || 'attendance-report.csv';
    if (data.length > 0) {
      columns = Object.keys(data[0]).map((key) => ({ key, label: key }));
    }
  } else {
    columns = arg1 || [];
    data = arg2 || [];
    filename = arg3 || 'attendance-report.csv';
  }

  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return false;
  }

  // 1. Generate Header Row
  const headerRow = columns.map((col) => {
    const title = col.label || col.key;
    return `"${String(title).replace(/"/g, '""')}"`;
  }).join(',');

  // 2. Generate Data Rows
  const rows = data.map((item) => {
    return columns.map((col) => {
      let value = '';
      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else if (col.key && item[col.key] !== undefined && item[col.key] !== null) {
        value = item[col.key];
      }

      // Convert value to string and escape quotes
      const strValue = String(value ?? '');
      return `"${strValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  // 3. Assemble CSV with UTF-8 BOM
  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger Browser Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
