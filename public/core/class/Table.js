class Table {
  constructor(config) {
    this.columns = config.columns;
    this.dataFields = config.dataFields;
    this.dataSource = config.dataSource;

    this.fieldMap = config.fieldMap || null;
    this.groups = config.groups || [];
    this.enabletooltips = config.enabletooltips !== false;
    this.sortable = config.sortable !== false;
    this.filterable = config.filterable !== false;
    this.columnsresize = config.columnsresize !== false;
    this.contextmenuenabled = config.contextmenuenabled === true;
    this.groupable = config.groupable === true;
    this.altrows = config.altrows !== false;
    this.checkboxCol = config.checkboxCol !== false;
    this.runningCol = config.runningCol === true;
    this.runningColHead = config.runningColHead || 'No.';
    this.enableRowEdit = config.enableRowEdit !== false;
    this.showfiltercolumnbackground = config.showfiltercolumnbackground === true;
    this.showpinnedcolumnbackground = config.showpinnedcolumnbackground === true;
    this.showsortcolumnbackground = config.showsortcolumnbackground === true;
    this.showgroupsheader = config.showgroupsheader === true;
    this.editModalId = config.editModalId || 'editModal';
    this.selectionmode = config.selectionmode || 'multiplecellsadvanced';
    this.width = config.width || '100%';
    this.height = config.height || '100%';
    this.onRowEdit = config.onRowEdit || null;
    this.rowsheight = config.rowsheight || 24;
    this.columnsheight = config.columnsheight || 24;
    this.scrollbarsize = config.scrollbarsize || 5;

    this.gridSelector = config.gridSelector || '.table-grid';
    this.paginationSelector = config.paginationSelector || '.table-pagination';
    this.pageSizeSelector = config.pageSizeSelector || null;
    this.showingStartSelector = config.showingStartSelector || '#showingStart';
    this.showingEndSelector = config.showingEndSelector || '#showingEnd';
    this.totalRecordsSelector = config.totalRecordsSelector || '#totalRecords';
    this.clearFilterButtonSelector =
      config.clearFilterButtonSelector || '.table-clear-filter-button';
    this.actionButtonSelector = config.actionButtonSelector || '.table-action-button button';
    this.selectedRowSelector = config.selectedRowSelector || '.selected-row';

    this.defaultGridOptions = {
      width: this.width,
      height: this.height,
      scrollbarsize: this.scrollbarsize,
      enabletooltips: this.enabletooltips,
      sortable: this.sortable,
      filterable: this.filterable,
      selectionmode: this.selectionmode,
      columnsresize: this.columnsresize,
      contextmenuenabled: this.contextmenuenabled,
      groupable: this.groupable,
      rowsheight: this.rowsheight,
      columnsheight: this.columnsheight,
      altrows: this.altrows,
      showfiltercolumnbackground: this.showfiltercolumnbackground,
      showpinnedcolumnbackground: this.showpinnedcolumnbackground,
      showsortcolumnbackground: this.showsortcolumnbackground,
      showgroupsheader: this.showgroupsheader,
    };

    this.gridOptions = { ...this.defaultGridOptions, ...(config.gridOptions || {}) };

    this.rowsPerPage = config.rowsPerPage || 'all';
    this.enablePagination = config.enablePagination !== false && !!this.paginationSelector;

    this.onCheckboxChange = config.onCheckboxChange || null;
    this.onPageChange = config.onPageChange || null;
    this.onFilterChange = config.onFilterChange || null;
    this.fieldId = config.fieldId || 'id';
    this.onRowDblClick = config.onRowDblClick || null;

    this.currentPage = 1;
    this.totalRecords = 0;
    this.totalPages = 0;
    this.grid = null;

    this.selectedRowIds = new Set();
    this.currentPageData = [];
    this.currentPageRowIds = [];
    this.mutationObserver = null;
    this.restoreTimeout = null;
    this.currentEditRow = null;
    this.editableColumns = this.getEditableColumns();

    this.init();
  }

  async init() {
    if (!this.dataSource) {
      console.error('dataSource is required');
    }
    if (!this.columns.length) {
      console.error('columns configuration is required');
    }
    if (!this.dataFields.length) {
      console.error('dataFields configuration is required');
    }

    if (this.enableRowEdit) {
      this.setupEditModalHandlers();
    }

    await this.loadTable(1);
    this.setupEventHandlers();
    this.setupMutationObserver();
  }

  setupEditModalHandlers() {
    $(document).off('click.editModal', `#${this.editModalId} .dropdown-item`);
    $(document).on('click.editModal', `#${this.editModalId} .dropdown-item`, (e) => {
      e.preventDefault();
      const item = $(e.target);
      const value = item.data('value');
      const text = item.text();

      const dropdown = item.closest('.dropdown');
      const button = dropdown.find('.dropdown-toggle');
      const hiddenInput = dropdown.find('input[type="hidden"]');

      button.text(text);
      hiddenInput.val(value);
    });

    $(document).off('click.editModal', '#saveEditRow');
    $(document).on('click.editModal', '#saveEditRow', (e) => {
      e.preventDefault();
      this.saveRowEdit();
    });

    $(document).off('submit.editModal', '#editForm');
    $(document).on('submit.editModal', '#editForm', (e) => {
      e.preventDefault();
      this.saveRowEdit();
    });
  }

  openEditModal(rowData, rowIndex) {
    if (!rowData) return;

    this.currentEditRow = { data: rowData, index: rowIndex };

    $('#editRowIndex').val(rowIndex);

    this.columns.forEach((col) => {
      const fieldName = col.dataField || col.datafield;
      let value = rowData[fieldName] ?? '';
      let field;
      const fieldMap = this.fieldMap;

      const optionValueMap = col.optionValueMap || {};
      if (optionValueMap[value]) {
        value = optionValueMap[value];
      }

      if (fieldMap[fieldName]) {
        field = $(fieldMap[fieldName]);
        if (field.is('input[type="checkbox"], input[type="radio"]')) {
          field.prop('checked', !!value).trigger('change');
        } else if (field.is('input, textarea, select')) {
          field.val(value).trigger('change');
        } else {
          field.text(value);
        }
      } else {
        const fieldId = `edit${this.capitalize(fieldName)}`;

        field = $(`#${fieldId}`);

        if (field.length) {
          field.val(value);
        } else {
          console.warn(`Field not found: ${fieldId}`);
        }
      }
    });

    formatDecimalNumberInput();
    $(`#${this.editModalId}`).modal('show');
  }

  capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch (error) {
      return str;
    }
  }

  async saveRowEdit() {
    if (!this.currentEditRow) return;

    const updatedData = { ...this.currentEditRow.data };
    let hasChanges = false;

    this.editableColumns.forEach((col) => {
      const fieldName = col.dataField || col.datafield;
      const fieldId = `edit${this.capitalize(fieldName)}`;
      const field = $(`#${fieldId}`);

      if (field.length) {
        let newValue = field.val();
        const oldValue = this.currentEditRow.data[fieldName];

        const fieldDef = this.dataFields.find((f) => f.name === fieldName);

        if (fieldDef?.type === 'number') {
          newValue = formatNumber(newValue);
        }

        if (newValue !== oldValue) {
          updatedData[fieldName] = newValue;
          hasChanges = true;
        }
      }
    });

    if (!hasChanges) {
      $(`#${this.editModalId}`).modal('hide');
      return;
    }

    try {
      if (this.onRowEdit) {
        const result = await this.onRowEdit(updatedData, this.currentEditRow.data);
        if (result === false) {
          return;
        }
      }

      this.currentPageData[this.currentEditRow.index] = updatedData;

      this.refreshCurrentPage();
    } catch (error) {
      console.error('Error saving row edit:', error);
    }
  }

  getEditableColumns() {
    return this.columns.filter((col) => {
      const fieldName = col.dataField || col.datafield;
      if (!fieldName) return false;
      if (col.editable === false) return false;
      if (col.readonly === true) return false;
      return true;
    });
  }

  refreshCurrentPage() {
    const currentPage = this.currentPage;
    this.loadTable(currentPage);
  }

  setupMutationObserver() {
    if (!this.checkboxCol) return;

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    const gridElement = $(this.gridSelector)[0];
    if (!gridElement) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldRestore = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if ($(node).find('.row-checkbox').length > 0 || $(node).hasClass('row-checkbox')) {
                shouldRestore = true;
              }
            }
          });
        }
      });

      if (shouldRestore) {
        if (this.restoreTimeout) {
          clearTimeout(this.restoreTimeout);
        }
        this.restoreTimeout = setTimeout(() => {
          this.restoreCheckboxStates();
          this.updateCheckAllState();
        }, 50);
      }
    });

    this.mutationObserver.observe(gridElement, {
      childList: true,
      subtree: true,
    });
  }

  getCheckboxColumn() {
    return {
      text: ' ',
      width: '2%',
      pinned: true,
      cellsrenderer: (_row, _columnfield, _value, _defaulthtml, _columnproperties, rowdata) => {
        const uniqueId = this.getUniqueRowId(rowdata);

        return `
                  <div class="row-checkbox-container">
                    <input class="form-check-input row-checkbox" type="checkbox" data-row-id="${uniqueId}" />
                  </div>
                `;
      },
      rendered: () => {
        setTimeout(() => {
          const columnHeader = $(this.gridSelector)
            .find(`.jqx-grid-column-header:contains(' ')`)
            .first();
          columnHeader.html(`
                              <div class="row-checkbox-container">
                                <input type="checkbox" id="checkAll" class="form-check-input">
                              </div>
                            `);

          columnHeader.off('click').on('click', (e) => {
            if (!$(e.target).is('#checkAll')) {
              e.preventDefault();
              e.stopPropagation();
            }
          });

          this.setupCheckboxHandlers();
          this.restoreCheckboxStates();
          this.updateCheckAllState();
        }, 100);
      },
    };
  }

  setupRowClickHandler() {
    if (!this.enableRowEdit) return;

    $(document).off('dblclick.rowEdit', `${this.gridSelector} div[role="row"]`);
    $(document).on('dblclick.rowEdit', `${this.gridSelector} div[role="row"]`, (e) => {
      if ($(e.target).is('input, button, a, .row-checkbox, .row-checkbox-container *')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      try {
        const row = $(e.currentTarget);

        let actualRowId = row.find('[data-row-id]').first().data('row-id');

        if (!actualRowId) {
          console.warn('No row ID found');
          return;
        }

        let rowData = null;
        let rowIndex = -1;

        if (this.currentPageData && this.currentPageData.length > 0) {
          rowIndex = this.currentPageData.findIndex((data) => {
            const dataId = this.getUniqueRowId(data);
            return dataId === actualRowId;
          });

          if (rowIndex !== -1) {
            rowData = this.currentPageData[rowIndex];
          }
        }

        if (rowData) {
          if (this.onRowDblClick) {
            this.onRowDblClick(rowData, rowIndex);
          }
          this.openEditModal(rowData, rowIndex);
        } else {
          console.error('No data in row id:', actualRowId);
        }
      } catch (error) {
        console.error('Error handling row click:', error);
      }
    });
  }

  prepareColumns() {
    let finalColumns = [...this.columns];

    finalColumns = finalColumns.map((col) => {
      const originalRenderer = col.cellsrenderer;

      return {
        ...col,
        cellsrenderer: (row, columnfield, value, defaulthtml, columnproperties, rowdata) => {
          let content;
          if (originalRenderer) {
            content = originalRenderer(
              row,
              columnfield,
              value,
              defaulthtml,
              columnproperties,
              rowdata
            );
          } else {
            content = defaulthtml;
          }

          if (content == null) content = '';

          const rowId = this.getUniqueRowId(rowdata);
          if (!rowId) {
            console.warn('No row ID found for row:', rowdata);
          }

          if (typeof content === 'string' && content.trim().startsWith('<div')) {
            content = content.replace(
              /^<div/,
              `<div data-row-id="${rowId || ''}" column-field="${columnfield}"`
            );
          } else {
            content = `<div data-row-id="${
              rowId || ''
            }" column-field="${columnfield}">${content}</div>`;
          }

          return content;
        },
      };
    });

    const runningNumberColumn = {
      text: this.runningColHead,
      width: '3%',
      pinned: true,
      align: 'center',
      cellsalign: 'center',
      cellsrenderer: (row, _columnfield, _value, _defaulthtml, _columnproperties, rowdata) => {
        const currentPage = this.currentPage || 1;
        const rowsPerPage = this.rowsPerPage === 'all' ? this.totalRecords : this.rowsPerPage;
        const startNumber = (currentPage - 1) * rowsPerPage;
        const rowId = this.getUniqueRowId(rowdata);
        return `<div class="custom-grid-cell running-no" data-row-id="${rowId}">${
          startNumber + row + 1
        }</div>`;
      },
    };

    if (this.checkboxCol) {
      finalColumns.unshift(this.getCheckboxColumn());
    }

    if (this.runningCol) {
      finalColumns.splice(1, 0, runningNumberColumn);
    }

    if (this.enableRowEdit) {
      setTimeout(() => {
        this.setupRowClickHandler();
      }, 200);
    }

    return finalColumns;
  }

  async fetchData(page = 1, pageSize = this.rowsPerPage) {
    const result = await this.dataSource(page, pageSize);
    this.totalRecords = result.total;
    this.rowsPerPage = pageSize;
    if (pageSize === 'all') pageSize = this.totalRecords;
    this.totalPages = Math.ceil(this.totalRecords / pageSize);
    return result.data;
  }

  getSelectedRowData() {
    const selectedIds = this.getSelectedRows();
    const selectedData = [];

    if (this.currentPageData && this.currentPageData.length > 0) {
      this.currentPageData.forEach((rowData) => {
        const rowId = this.getUniqueRowId(rowData);
        if (selectedIds.includes(rowId)) {
          selectedData.push(rowData);
        }
      });
    }

    return selectedData;
  }

  clearSelectionAfterApprove() {
    this.clearSelection();
  }

  async loadTable(page) {
    this.currentPage = page;
    let savedFilters = [];

    if (this.grid) {
      savedFilters = $(this.gridSelector).jqxGrid('getfilterinformation');
    }

    this.selectedRowIds.clear();

    const data = await this.fetchData(page, this.rowsPerPage);

    this.currentPageData = data;
    this.currentPageRowIds = this.extractRowIds(data);

    const source = {
      localdata: data,
      dataFields: this.dataFields,
    };

    const dataAdapter = new $.jqx.dataAdapter(source);

    const gridConfig = {
      ...this.gridOptions,
      source: dataAdapter,
      columns: this.prepareColumns(),
      groups: this.groups,
    };

    if (!this.grid) {
      this.grid = $(this.gridSelector).jqxGrid(gridConfig);

      if (this.gridOptions.filterable) {
        $(this.gridSelector).on('filter', () => {
          this.handleFilterChange();
        });
      }

      $(this.gridSelector).on('bindingcomplete', () => {
        setTimeout(() => {
          this.restoreCheckboxStates();
          this.updateCheckAllState();
        }, 100);
      });

      $(this.gridSelector).on('cellrender', () => {
        setTimeout(() => {
          this.restoreCheckboxStates();
        }, 10);
      });
    } else {
      $(this.gridSelector).jqxGrid({ source: dataAdapter, groups: this.groups });
      savedFilters.forEach((info) => {
        $(this.gridSelector).jqxGrid('addfilter', info.datafield, info.filter);
      });
      $(this.gridSelector).jqxGrid('applyfilters');
    }

    if (this.enablePagination) {
      this.updatePaginationInfo();
      this.renderPagination();
    }

    if (this.checkboxCol) {
      setTimeout(() => {
        this.setupCheckboxHandlers();
        this.restoreCheckboxStates();
        this.updateActionButtonVisibility();

        if (this.onCheckboxChange) {
          this.onCheckboxChange([]);
        }
      }, 150);
    }

    if (this.onPageChange) {
      this.onPageChange(page, data);
    }
  }

  getUniqueRowId(rowdata) {
    if (rowdata && rowdata.hasOwnProperty(this.fieldId) && rowdata[this.fieldId] != null) {
      return rowdata[this.fieldId];
    }

    if (rowdata.uniqueid) {
      return rowdata.uniqueid;
    }

    const dataField = this.dataFields.find((field) => field.name.toLowerCase() === this.fieldId);

    if (dataField && rowdata[dataField.name] != null) {
      return rowdata[dataField.name];
    }

    console.warn('No unique ID field found. Creating hash from row data.');
    return this.hashRowData(rowdata);
  }

  hashRowData(rowdata) {
    const str = JSON.stringify(rowdata);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  extractRowIds(data) {
    if (!data || !Array.isArray(data)) return [];

    return data.map((rowdata) => this.getUniqueRowId(rowdata));
  }

  getCurrentlyVisibleRowIds() {
    if (!this.grid) return [];

    try {
      const filteredData = $(this.gridSelector).jqxGrid('getdisplayrows');

      if (filteredData && filteredData.length > 0) {
        const normalRows = filteredData.filter((row) => !row.group);
        return normalRows.map((rowdata) => this.getUniqueRowId(rowdata));
      } else {
        return this.currentPageRowIds || [];
      }
    } catch (error) {
      console.warn('Could not get filtered data, using current page data:', error);
      return this.currentPageRowIds || [];
    }
  }

  areAllVisibleRowsSelected() {
    const visibleRowIds = this.getCurrentlyVisibleRowIds();
    if (visibleRowIds.length === 0) return false;
    return visibleRowIds.every((rowId) => this.selectedRowIds.has(rowId));
  }

  areSomeVisibleRowsSelected() {
    const visibleRowIds = this.getCurrentlyVisibleRowIds();
    if (visibleRowIds.length === 0) return false;
    return visibleRowIds.some((rowId) => this.selectedRowIds.has(rowId));
  }

  restoreCheckboxStates() {
    $('.row-checkbox').each((index, checkbox) => {
      const $checkbox = $(checkbox);
      const rowId = $checkbox.data('row-id');
      const shouldBeChecked = this.selectedRowIds.has(rowId);
      const isCurrentlyChecked = $checkbox.is(':checked');

      if (shouldBeChecked !== isCurrentlyChecked) {
        $checkbox.prop('checked', shouldBeChecked);
      }
    });
    this.updateCheckAllState();
  }

  setupEventHandlers() {
    if (this.enablePagination) {
      $(document).off('click', `${this.paginationSelector} .page-link`);
      $(document).on('click', `${this.paginationSelector} .page-link`, (e) => {
        e.preventDefault();
        const page = parseInt($(e.target).data('page'));
        if (page && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
          this.loadTable(page);
        }
      });

      if (this.pageSizeSelector) {
        $(this.pageSizeSelector).off('change');
        $(this.pageSizeSelector).on('change', () => {
          this.rowsPerPage = parseInt($(this.pageSizeSelector).val());
          this.loadTable(1);
        });
      }
    }

    if (this.clearFilterButtonSelector) {
      $(this.clearFilterButtonSelector).off('click');
      $(this.clearFilterButtonSelector).click(() => {
        $(this.gridSelector).jqxGrid('clearfilters');
      });
    }
  }

  setupCheckboxHandlers() {
    if (!this.checkboxCol) return;

    $(document).off('change.tableCheckbox', '.row-checkbox');
    $(document).off('click.tableCheckAll', '#checkAll');

    $(document).on('change.tableCheckbox', '.row-checkbox', (e) => {
      e.stopPropagation();
      const rowId = $(e.target).data('row-id');

      if ($(e.target).is(':checked')) {
        this.selectedRowIds.add(rowId);
      } else {
        this.selectedRowIds.delete(rowId);
      }

      this.updateCheckAllState();
      this.updateActionButtonVisibility();

      if (this.onCheckboxChange) {
        this.onCheckboxChange(this.getSelectedRows());
      }
    });

    $(document).on('click.tableCheckAll', '#checkAll', (e) => {
      e.stopPropagation();

      const visibleRowIds = this.getCurrentlyVisibleRowIds();
      if (visibleRowIds.length === 0) return;

      const allSelected = this.areAllVisibleRowsSelected();
      const someSelected = this.areSomeVisibleRowsSelected();

      if (allSelected || (someSelected && !allSelected)) {
        visibleRowIds.forEach((rowId) => {
          this.selectedRowIds.delete(rowId);
        });
      } else {
        visibleRowIds.forEach((rowId) => {
          this.selectedRowIds.add(rowId);
        });
      }

      this.restoreCheckboxStates();
      this.updateCheckAllState();
      this.updateActionButtonVisibility();

      if (this.onCheckboxChange) {
        this.onCheckboxChange(this.getSelectedRows());
      }
    });

    this.updateCheckAllState();
  }

  updateCheckAllState() {
    const checkAllCheckbox = $('#checkAll');

    const visibleRowIds = this.getCurrentlyVisibleRowIds();
    if (visibleRowIds.length === 0) {
      checkAllCheckbox.prop('checked', false).prop('indeterminate', false);
      return;
    }

    const allSelected = this.areAllVisibleRowsSelected();
    const someSelected = this.areSomeVisibleRowsSelected();

    if (allSelected) {
      checkAllCheckbox.prop('checked', true).prop('indeterminate', false);
    } else if (someSelected) {
      checkAllCheckbox.prop('checked', false).prop('indeterminate', true);
    } else {
      checkAllCheckbox.prop('checked', false).prop('indeterminate', false);
    }
  }

  updateActionButtonVisibility() {
    if (!this.actionButtonSelector) return;

    const actionButton = $(this.actionButtonSelector);
    const selectedRow = $(this.selectedRowSelector);
    const count = this.selectedRowIds.size;

    if (count > 0) {
      actionButton.removeClass('disabled');
      if (count > 1) selectedRow.text(`${count} rows selected`).show();
      else selectedRow.text(`${count} row selected`).show();
    } else {
      actionButton.addClass('disabled');
      selectedRow.text('').hide();
    }
  }

  getSelectedRows() {
    return Array.from(this.selectedRowIds);
  }

  getVisibleSelectedCount() {
    const visibleRowIds = this.getCurrentlyVisibleRowIds();
    return visibleRowIds.filter((rowId) => this.selectedRowIds.has(rowId)).length;
  }

  getVisibleTotalCount() {
    return this.getCurrentlyVisibleRowIds().length;
  }

  getVisibleSelectedRows() {
    const selectedRows = [];
    $('.row-checkbox:checked').each(function () {
      selectedRows.push($(this).data('row-id'));
    });
    return selectedRows;
  }

  getCurrentPageSelectedCount() {
    if (!this.currentPageRowIds) return 0;
    return this.currentPageRowIds.filter((rowId) => this.selectedRowIds.has(rowId)).length;
  }

  getCurrentPageTotalCount() {
    return this.currentPageRowIds ? this.currentPageRowIds.length : 0;
  }

  clearSelection() {
    this.selectedRowIds.clear();
    $('.row-checkbox').prop('checked', false);
    this.updateCheckAllState();
    this.updateActionButtonVisibility();

    if (this.onCheckboxChange) {
      this.onCheckboxChange([]);
    }
  }

  selectAllCurrentPage() {
    if (!this.currentPageRowIds) return;

    this.currentPageRowIds.forEach((rowId) => {
      this.selectedRowIds.add(rowId);
    });

    this.restoreCheckboxStates();
    this.updateActionButtonVisibility();

    if (this.onCheckboxChange) {
      this.onCheckboxChange(this.getSelectedRows());
    }
  }

  unselectAllCurrentPage() {
    if (!this.currentPageRowIds) return;

    this.currentPageRowIds.forEach((rowId) => {
      this.selectedRowIds.delete(rowId);
    });

    this.restoreCheckboxStates();
    this.updateActionButtonVisibility();

    if (this.onCheckboxChange) {
      this.onCheckboxChange(this.getSelectedRows());
    }
  }

  selectAllVisible() {
    const visibleRowIds = this.getCurrentlyVisibleRowIds();

    visibleRowIds.forEach((rowId) => {
      this.selectedRowIds.add(rowId);
    });

    this.restoreCheckboxStates();
    this.updateActionButtonVisibility();

    if (this.onCheckboxChange) {
      this.onCheckboxChange(this.getSelectedRows());
    }
  }

  unselectAllVisible() {
    const visibleRowIds = this.getCurrentlyVisibleRowIds();

    visibleRowIds.forEach((rowId) => {
      this.selectedRowIds.delete(rowId);
    });

    this.restoreCheckboxStates();
    this.updateActionButtonVisibility();

    if (this.onCheckboxChange) {
      this.onCheckboxChange(this.getSelectedRows());
    }
  }

  updatePaginationInfo() {
    if (!this.enablePagination) return;

    if (this.rowsPerPage === 'all') this.rowsPerPage = this.totalRecords;

    const startIndex = (this.currentPage - 1) * this.rowsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.rowsPerPage, this.totalRecords);

    if (this.showingStartSelector) {
      $(this.showingStartSelector).text(this.totalRecords > 0 ? startIndex : 0);
    }
    if (this.showingEndSelector) {
      $(this.showingEndSelector).text(endIndex);
    }
    if (this.totalRecordsSelector) {
      $(this.totalRecordsSelector).text(this.totalRecords);
    }
  }

  renderPagination() {
    if (!this.enablePagination) return;

    const pagination = $(this.paginationSelector);
    pagination.empty();

    if (this.totalPages <= 1) return;

    const firstDisabled = this.currentPage === 1 ? 'disabled' : '';
    pagination.append(`
                        <li class="page-item ${firstDisabled}">
                            <a class="page-link" href="#" data-page="1">
                                <i class="fa-solid fa-angles-left"></i>
                            </a>
                        </li>
                    `);

    const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
    pagination.append(`
                        <li class="page-item ${prevDisabled}">
                            <a class="page-link" href="#" data-page="${this.currentPage - 1}">
                            <i class="fa-solid fa-chevron-left"></i>
                            </a>
                        </li>
                    `);

    this.renderPageNumbers(pagination);

    const nextDisabled = this.currentPage === this.totalPages ? 'disabled' : '';
    pagination.append(`
                        <li class="page-item ${nextDisabled}">
                            <a class="page-link" href="#" data-page="${this.currentPage + 1}">
                            <i class="fa-solid fa-chevron-right"></i>
                            </a>
                        </li>
                    `);

    const lastDisabled = this.currentPage === this.totalPages ? 'disabled' : '';
    pagination.append(`
                        <li class="page-item ${lastDisabled}">
                            <a class="page-link" href="#" data-page="${this.totalPages}">
                            <i class="fa-solid fa-angles-right"></i>
                            </a>
                        </li>
                    `);
  }

  renderPageNumbers(pagination) {
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        const activeClass = i === this.currentPage ? 'active' : '';
        pagination.append(`
                            <li class="page-item ${activeClass}">
                                <a class="page-link" href="#" data-page="${i}">${i}</a>
                            </li>
                        `);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          const activeClass = i === this.currentPage ? 'active' : '';
          pagination.append(`
                                <li class="page-item ${activeClass}">
                                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                                </li>
                            `);
        }
        pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
        pagination.append(`
                            <li class="page-item">
                                <a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a>
                            </li>
                        `);
      } else if (this.currentPage >= this.totalPages - 3) {
        pagination.append(`
                            <li class="page-item">
                                <a class="page-link" href="#" data-page="1">1</a>
                            </li>
                        `);
        pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          const activeClass = i === this.currentPage ? 'active' : '';
          pagination.append(`
                                <li class="page-item ${activeClass}">
                                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                                </li>
                            `);
        }
      } else {
        pagination.append(`
                            <li class="page-item">
                                <a class="page-link" href="#" data-page="1">1</a>
                            </li>
                        `);
        pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);

        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          const activeClass = i === this.currentPage ? 'active' : '';
          pagination.append(`
                                <li class="page-item ${activeClass}">
                                <a class="page-link" href="#" data-page="${i}">${i}</a>
                                </li>
                            `);
        }

        pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
        pagination.append(`
                            <li class="page-item">
                                <a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a>
                            </li>
                        `);
      }
    }
  }

  handleFilterChange() {
    const filterInfo = $(this.gridSelector).jqxGrid('getfilterinformation');

    if (this.clearFilterButtonSelector) {
      const clearFilterButton = $(this.clearFilterButtonSelector);
      if (filterInfo.length > 0) {
        clearFilterButton.removeClass('d-none').show();
      } else {
        clearFilterButton.hide();
      }
    }

    setTimeout(() => {
      this.updateCheckAllState();
    }, 100);

    if (this.onFilterChange) {
      this.onFilterChange(filterInfo);
    }
  }

  formatConditionText(condition) {
    const conditions = {
      EQUAL: ':',
      NOT_EQUAL: '<i class="fa-solid fa-not-equal"></i>',
      LESS_THAN: '<i class="fa-solid fa-less-than"></i>',
      LESS_THAN_OR_EQUAL: '<i class="fa-solid fa-less-than-equal"></i>',
      GREATER_THAN: '<i class="fa-solid fa-greater-than"></i>',
      GREATER_THAN_OR_EQUAL: '<i class="fa-solid fa-greater-than-equal"></i>',
      CONTAINS: 'contains',
      DOES_NOT_CONTAIN: 'not contains',
      STARTS_WITH: 'starts with',
      ENDS_WITH: 'ends with',
      NULL: 'is null',
      NOT_NULL: 'is not null',
      EMPTY: 'is empty',
      NOT_EMPTY: 'is not empty',
    };

    return conditions[condition.toUpperCase()] || condition.toLowerCase().replace(/_/g, ' ');
  }

  refresh() {
    this.loadTable(this.currentPage);
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadTable(page);
    }
  }

  clearFilters() {
    $(this.gridSelector).jqxGrid('clearfilters');
    setTimeout(() => {
      this.updateCheckAllState();
    }, 100);
  }

  getGridInstance() {
    return this.grid;
  }

  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.restoreTimeout) {
      clearTimeout(this.restoreTimeout);
      this.restoreTimeout = null;
    }

    if (this.grid) {
      $(this.gridSelector).jqxGrid('destroy');
    }

    $(document).off('change.tableCheckbox', '.row-checkbox');
    $(document).off('click.tableCheckAll', '#checkAll');
    $(document).off('click.tableAction', this.actionButtonSelector);
    $(document).off('click', `${this.paginationSelector} .page-link`);
    $(document).off('dblclick.rowEdit', `${this.gridSelector} div[role="row"]`);
    $(document).off('click.editModal', `#${this.editModalId} .dropdown-item`);
    $(document).off('click.editModal', '#saveEditRow');
    $(document).off('submit.editModal', '#editForm');

    $(`#${this.editModalId}`).remove();

    this.selectedRowIds.clear();
    this.currentPageData = [];
    this.currentPageRowIds = [];
    this.currentEditRow = null;
  }
}
