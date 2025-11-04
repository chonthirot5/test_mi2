/**
 * ExcelExport Class
 * A utility class for exporting data to Excel format using SheetJS (XLSX)
 */
class ExcelExport {
  /**
   * Export data to Excel file
   * @param {Object} options - Export options
   * @param {Array} options.data - Array of objects to export
   * @param {Array} options.columns - Array of column definitions with headers and keys
   * @param {string} options.filename - Name of the exported file (without extension)
   * @param {string} options.sheetName - Name of the worksheet
   * @param {Object} options.headerStyle - Custom header styling (optional)
   */
  static exportToExcel({ data, columns, filename = 'export', sheetName = 'Sheet1', headerStyle = {} }) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      Alert.warning({
        title: 'No Data',
        text: 'There is no data to export.',
      });
      return;
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      Alert.warning({
        title: 'No Columns',
        text: 'Column definitions are required for export.',
      });
      return;
    }

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Prepare data for export
      const exportData = this.prepareData(data, columns);

      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Apply column widths
      const columnWidths = columns.map((col) => ({
        wch: col.width || 15,
      }));
      ws['!cols'] = columnWidths;

      // Apply header styles if xlsx-js-style is available
      if (typeof XLSX.utils.sheet_add_json !== 'undefined') {
        this.applyHeaderStyle(ws, columns, headerStyle);
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename with timestamp
      const timestamp = moment().format('YYYYMMDD_HHmmss');
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, fullFilename);

      Notification.success('File exported successfully!');
    } catch (error) {
      console.error('Excel export error:', error);
      Notification.error('Failed to export file. Please try again.');
    }
  }

  /**
   * Prepare data for export by mapping columns
   * @private
   */
  static prepareData(data, columns) {
    return data.map((row) => {
      const exportRow = {};
      columns.forEach((col) => {
        const header = col.header || col.text || col.dataField;
        const key = col.dataField || col.key;
        let value = row[key];

        // Format value if formatter is provided
        if (col.formatter && typeof col.formatter === 'function') {
          value = col.formatter(value, row);
        }

        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = '';
        }

        exportRow[header] = value;
      });
      return exportRow;
    });
  }

  /**
   * Apply styling to header row
   * @private
   */
  static applyHeaderStyle(ws, columns, customStyle = {}) {
    const defaultHeaderStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    const headerStyle = { ...defaultHeaderStyle, ...customStyle };

    // Apply style to each header cell
    columns.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellRef]) return;

      ws[cellRef].s = headerStyle;
    });
  }

  /**
   * Export table data directly from a Table instance
   * @param {Object} options - Export options
   * @param {Object} options.table - Table instance
   * @param {string} options.filename - Name of the exported file
   * @param {Array} options.columns - Optional custom column definitions (if not provided, uses table columns)
   */
  static exportTableToExcel({ table, filename = 'table_export', columns = null }) {
    if (!table) {
      Alert.warning({
        title: 'Invalid Table',
        text: 'Table instance is required for export.',
      });
      return;
    }

    // Get all data from table
    const tableData = table.getAllData ? table.getAllData() : table.getData();

    // Use provided columns or get from table
    const exportColumns =
      columns ||
      (table.columns || []).map((col) => ({
        header: col.text,
        dataField: col.dataField,
        width: parseInt(col.width) || 15,
      }));

    // Export to Excel
    this.exportToExcel({
      data: tableData,
      columns: exportColumns,
      filename: filename,
    });
  }
}
