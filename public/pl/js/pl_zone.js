  $(async function(){
    $('#saveEditRows').on('click', async () => {
      const f = new Form({ formSelector: '#editForm' });
      const v = f.validateInput();
      if (!v) {
        return;
      }
      const data = await PlElementZoneInstance.getDataEditForm();
      const response = await PlZoneInstance.updateZone(data);
      if (!response.success) {
        Notification.error(response.data);
      }else{
        $('#editModal').modal('hide');
        Notification.success();
        myTable.refresh();
      }
    });

    $('#addRowData').on('click', async () => {
      const f = new Form({ formSelector: '#addForm' });
      const v = f.validateInput();
      if (!v) {
        return;
      }
      const dataObj = await PlElementZoneInstance.getDataAddForm();
      try {
        Axios.showLoadingModal();
        const { success, data } = await PlZoneInstance.createZone(dataObj);
        if (!success) {
          let msg = '';
          if (Array.isArray(data) && data[0]?.path && data[0]?.message) {
            msg = `${data[0].path[0]} : ${data[0].message}`;
          } else {
            msg = typeof data === 'string' ? data : JSON.stringify(data);
          }
          if (msg.includes('UniqueConstraintError') || msg.includes('SequelizeUniqueConstraintError')) {
            Notification.error(`Zone "${dataObj.zone_code}" มีอยู่ในระบบแล้ว`);
          } else if (msg.includes('Validation error')) {
            Notification.error(`กรุณาตรวจสอบข้อมูลอีกครั้ง`);
          } else if (msg.includes('REFERENCE constraint') || msg.includes('ForeignKey')) {
            Notification.error(`Zone "${dataObj.zone_code}" ถูกใช้งานอยู่ในระบบ`);
          } else {
            Notification.error(msg || 'ไม่สามารถบันทึกข้อมูลได้');
          }
        } else {
          Notification.success();
          $('#editModal').modal('hide');
          myTable.refresh();
        }
      } catch (err) {
        console.error('API Error:', err);
        Notification.error();
      } finally {
        Axios.hideLoading();
      }

      const { success, data } = await PlZoneInstance.createZone(dataObj);
      if (!success) {
        let msg = '';
        if (Array.isArray(data) && data[0]?.path && data[0]?.message) {
          msg = `${data[0].path[0]} : ${data[0].message}`;
        } else {
          msg = typeof data === 'string' ? data : JSON.stringify(data);
        }
        if (msg.includes('UniqueConstraintError') || msg.includes('SequelizeUniqueConstraintError')) {
          Notification.error(`Zone "${dataObj.zone_code}" มีอยู่ในระบบแล้ว`);
        } else if (msg.includes('Validation error')) {
          Notification.error(`กรุณาตรวจสอบข้อมูลอีกครั้ง`);
        } else if (msg.includes('REFERENCE constraint') || msg.includes('ForeignKey')) {
          Notification.error(`Zone "${dataObj.zone_code}" ถูกใช้งานอยู่ในระบบ`);
        } else {
          Notification.error(msg || 'ไม่สามารถบันทึกข้อมูลได้');
        }
      }else{
        $('#addModal').find('input').val('');
        $('#addModal').modal('hide');
        Notification.success();
        myTable.goToPage(1);
      }
    });

    $('#addRow').on('click', function () {
      $('#addModal').modal('show');
    });

    const showRowsInit = 25;
    let showRows = showRowsInit;
    const showRowsOptions = [
      { text: 'ALL', value: 'ALL' },
      { text: '25', value: 25 },
      { text: '50', value: 50 },
      { text: '100', value: 100 },
      { text: '300', value: 300 },
      { text: '500', value: 500 },
    ];
    $('.showRows').dropdownSelect2({
      options: showRowsOptions,
      selectedValue: showRowsInit,
      allowClear: false,
    });
    $('#showRows').on('change', function () {
      const selectedValue = $(this).val();
      showRows = selectedValue;
      myTable.rowsPerPage = (showRows == "ALL")? 1000 : showRows;
      myTable.goToPage(1);
    });
    const dataSource = async (page, pageSize) => {
      let response;
      try {
        Axios.showLoadingIcon();
        response =  await PlZoneInstance.getZone(page, pageSize);
      } catch (error) {
        console.error('API Error:', err);
        Notification.error();
      } finally {
        Axios.hideLoading();
      }
      return { total: response.data.total, data: response.data.data };
    };
    const myTable = new Table({
      dataSource: dataSource,
      checkboxCol: true,
      columns: [
        {
          text: 'id',
          dataField: 'id',
          pinned: true,
          align: 'start',
          hidden: true
        },
        {
          text: 'Zone Code',
          dataField: 'zone_code',
          width: '25%',
          pinned: true,
          align: 'center',
          cellsalign: 'center',
          cellsrenderer: function (_row, _columnfield, value, _defaulthtml, _columnproperties, rowdata) {
            const zoneClass = value || '';
            return `<div class="status-container">
                      <span class="zone_color_bg ${zoneClass}">
                        ${value}
                      </span>
                    </div>
            `;
          }
        },
        {
          text: 'Zone Name',
          dataField: 'zone_name',
          width: '50%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'Status',
          dataField: 'is_active',
          width: '22%',
          align: 'center',
          cellsrenderer: function (_row, _columnfield, value) {
            let badgeClass = 'bg-secondary';
            let displayText = '';

            if (value === '1' || value === 1) {
              badgeClass = 'bg-success';
              displayText = 'ACTIVE';
            } else if (value === '0' || value === 0) {
              badgeClass = 'bg-danger';
              displayText = 'INACTIVE';
            }

            return `
              <div class="status-container">
                <span class="status-badge ${badgeClass}">
                  ${displayText}
                </span>
              </div>
            `;
          }
        }
      ],
      // groupable: true,
      // groups: ['productName'],
      dataFields: [
        { name: 'id', type: 'number' },
        { name: 'zone_code', type: 'string' },
        { name: 'zone_name', type: 'string' },
        { name: 'is_active', type: 'number' },
      ],
      enableRowEdit: true,
      editModalId: 'editModal',
      onRowEdit: async (updatedData) => {
      },
      fieldMap: {
        id: '#editRowIndex',
        zone_code: '#editZoneCode .autocomplete-input',
      },
      rowsPerPage: showRows,
    });

    $('#editModal').on('show.bs.modal', async () => {
      if (!myTable.currentEditRow) return;
      const { success, data } = await PlZoneInstance.getZoneOne({zone_code: myTable.currentEditRow.data.zone_code});
      await PlElementZoneInstance.setData(data.data[0]);
      await PlElementZoneInstance.renderDataForm();
    });

    Input.splitButtonDropdown({
      containerSelector: '#actionButtonGroup',
      normalItems: [
        { label: '<span class="DELETE">DELETE</span>', value: 'delete', id: 'delete' },
        //{ label: '<span class="CANCEL">CANCEL</span>', value: 'cancel', id: 'cancel' },
      ],
      moduleName: 'template',
      menuId: '4',
    });

    $('.table-action').on('click', '#delete', async (e) => {
      e.preventDefault();
      const selectedRows = myTable.getSelectedRowData();
      if (!selectedRows || selectedRows.length === 0) {
        Notification.error('กรุณาเลือกอย่างน้อย 1 แถว');
        return;
      }

      const confirmModal = new ConfirmModal({
        confirmHeader: 'CONFIRM DELETE',
        confirmMessage: 'Are you sure you want to delete?',
      });
      const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'));
      confirmModalEl.show();
      confirmModal.onConfirm(async (isConfirm) => {
        if (!isConfirm) {
          return;
        }
        const successCodes = [];
        const errorItems = [];
        const deletedIds = [];
        let isCanceled = false;
        try {
          Axios.controller = new AbortController();
          Axios.showLoadingModal();
          for (let i = 0; i < selectedRows.length; i++) {
            if (Axios.controller?.signal.aborted) {
              isCanceled = true;
              break;
            }
            const row = selectedRows[i];
            Axios.modalContent = `<div>กำลังลบ (${row.zone_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
            const response = await PlZoneInstance.deleteZone({ data: { zone_code: row.zone_code }});
            if (response === 'null') {
              isCanceled = true;
              break;
            }
            if (response.success === 0) {
              let reason = response.data || response.message || 'Unknown reason';
              console.log('reason' ,reason)
              if (reason.includes('REFERENCE constraint')) {
                reason = `ถูกใช้งานอยู่ในระบบ`;
              } else if (reason.includes('Cannot find zone')) {
                  reason = `ไม่พบ Zone ในระบบ`;
              }
              errorItems.push({ code: row.zone_code, reason: reason });
              break;
            }
            if (response.success) {
              successCodes.push(row.zone_code);
              deletedIds.push(row.id);
              Axios.modalContent = `<div>กำลังลบ (${row.zone_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
            } else {
              const reason = response.data || response.message || 'Unknown reason';
              errorItems.push({ code: row.zone_code, reason: reason });
              break;
            }
          }
          Axios.hideLoading();

          if (isCanceled) {
            if (deletedIds.length > 0) {
              myTable.currentPageData = myTable.currentPageData.filter(row => !deletedIds.includes(row.id));
              deletedIds.forEach(id => {
                myTable.selectedRowIds.delete(id);
                $(`.row-checkbox[data-row-id="${id}"]`).closest('div[role="row"]').remove();
              });
            }
            if (successCodes.length > 0) {
              Notification.success(`ลบสำเร็จทั้งหมด ${successCodes.length} รายการ`);
            } else {
              Notification.warning('การลบถูกยกเลิก');
            }
            return;
          }
          
          if (successCodes.length > 0 && errorItems.length === 0) {
            myTable.currentPageData = myTable.currentPageData.filter(row => !deletedIds.includes(row.id));
            deletedIds.forEach(id => {
              myTable.selectedRowIds.delete(id);
            });
            myTable.refresh();
            myTable.clearSelection();
            Notification.success(`ลบสำเร็จทั้งหมด ${successCodes.length} รายการ`);
          } else if (successCodes.length > 0 || errorItems.length > 0) {
            if (deletedIds.length > 0) {
              myTable.currentPageData = myTable.currentPageData.filter(row => !deletedIds.includes(row.id));
              deletedIds.forEach(id => {
                myTable.selectedRowIds.delete(id);
                $(`.row-checkbox[data-row-id="${id}"]`).closest('div[role="row"]').remove();
              });
            }
            let summaryHtml = '<div style="text-align: left;">';
            if (errorItems.length > 0) {
              errorItems.forEach(item => {
                summaryHtml += `${item.code} : ${item.reason}<br>`;
              });
            }
            summaryHtml += '</div>';
            Swal.fire({
              title: 'Delete',
              html: summaryHtml,
              icon: 'warning',
              confirmButtonText: 'OK'
            });
          }
        } catch (err) {
          console.error('API Error:', err);
          Axios.hideLoading();
          Alert.error({ 
            title: 'เกิดข้อผิดพลาด',
            text: err.message || 'Unknown error'
          });
        }
      });
    });

    const zones = await PlZoneInstance.getSelectZone();
    const sortedOutbound = zones.data.data.filter((obj, index, self) => index === self.findIndex(o => o.zone_code === obj.zone_code)).sort((a, b) => a.zone_code.localeCompare(b.zone_code)); 
    const selectOutbound = sortedOutbound.map(p => ({
      text: p.zone_code + ' : ' + p.zone_name,
      value: p.zone_code
    }));
    $('.zoneCodeSearch').dropdownSelect2({
      options: selectOutbound,
      placeholder: 'เลือก ZONE',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const statusData = [
      { text: 'ACTIVE', value: 1 },
      { text: 'INACTIVE', value: 0 },
    ];            
    $('.isActiveSearch').dropdownSelect2({
      options: statusData,
      placeholder: 'เลือก STATUS',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    function search() {
      const chipContainer = $('.table-search-value');
      $('#searchButton').on('click', () => {
        $('.search-list-expand').toggleClass('show');
      });
      $('#applySearchButton').on('click', () => {
        const zoneCode = $('#zoneCodeSearch').val()?.trim();
        const zoneName = $('#zoneNameSearch').val()?.trim();
        const isActive = $('#isActiveSearch').val();
        const zoneText = $('#zoneCodeSearch').find('option:selected').text();
        PlSearchInstance.setSearch('zone', {
          zone_code: zoneCode,
          zone_name: zoneName,
          is_active: (isActive === '1' || isActive === '0') ? isActive : '',
        });

        chipContainer.empty();
        const addChip = (label, value) => {
          if (value) chipContainer.append(`<div class="chip"><span class="filter-chip-text">${label}: ${value}</span></div>`);
        };

        addChip('ZONE CODE', zoneCode);
        addChip('ZONE NAME', zoneName);
        addChip('STATUS', isActive === '1' ? 'ACTIVE' : isActive === '0' ? 'INACTIVE' : '');
        myTable.loadTable(1);
        $('.search-list-expand').removeClass('show');
      });

      $('#clearSearchButton').on('click', () => {
        $('#zoneCodeSearch').val(null).trigger('change');
        $('#zoneNameSearch').val("");
        $('#isActiveSearch').val(null).trigger('change');
        PlSearchInstance.setSearch('zone', {
          zone_code: null,
          zone_name: null,
          is_active: null,
        });
        chipContainer.empty();
      });

      $(document).on('click', (e) => {
        if (!$(e.target).closest('.search-list-container').length) {
          $('.search-list-expand').removeClass('show');
        }
      });

      const save = PlSearchInstance.getSearch('zone');
      loadSearchChips(save, {
        fieldMap: {
          zone_code: '#zoneCodeSearch',
          zone_name: '#zoneNameSearch',
          is_active: '#isActiveSearch',
        },
        labelMap: {
          zone_code: 'ZONE CODE',
          zone_name: 'ZONE NAME',
          is_active: 'STATUS',
        },
        displayFn: {
          is_active: v => v === '1' ? 'ACTIVE' : v === '0' ? 'INACTIVE' : '',
        },
        displayOrder: ['zone_code', 'zone_name', 'is_active'],
      });

    }
    search();

  });

  function loadSearchChips(saved, config) {
    const chipContainer = $('.table-search-value');
    chipContainer.empty();
    config.displayOrder.forEach(key => {
      const value = saved[key];
      if (value === null || value === undefined || value === '' || value === 0) return;

      const label = config.labelMap[key] || key;
      const displayValue = config.displayFn?.[key] ? config.displayFn[key](value) : value;

      chipContainer.append(
        `<div class="chip"><span class="filter-chip-text">${label}: ${displayValue}</span></div>`
      );

      if (config.fieldMap?.[key]) {
        const $input = $(config.fieldMap[key]);
        const inputVal = value === null || value === undefined || value === 0 ? '' : value;

        if ($input.hasClass('dropdown-select2')) {
          if ($input.find(`option[value="${inputVal}"]`).length === 0) {
            $input.append(new Option(inputVal, inputVal, true, true));
          }
          $input.val(inputVal).trigger('change.select2');
        } else {
          $input.val(inputVal);
        }
      }
    });
  }

  var PlElementZoneInstance = (() => {
    let dataObj = {};
    
    return {
      setData(obj) {
        dataObj = obj;
      },
      
      getData() {
        return dataObj;
      },
      
      getDataAddForm() {
        const obj = {
          zone_code: $('#zoneCode .autocomplete-input').val(),
          zone_name: $('#zoneName .autocomplete-input').val(),
          is_active: Number( $('input[name="listGroupRadioAdd"]').filter(':checked').val() || 1)
        };
        dataObj = obj;
        return obj;
      },

      getDataEditForm() {
        const obj = {
          zone_code: $('#editZoneCode .autocomplete-input').val(),
          zone_name: $('#editZoneName .autocomplete-input').val(),
          is_active: Number($('input[name="listGroupRadioEdit"]').filter(':checked').val() || 1)
        };
        dataObj = obj;
        return obj;
      },
      
      async renderDataForm() {
        const rowData = dataObj;

        $('#editZoneCode .autocomplete-input').val(rowData.zone_code);
        $('#editZoneName .autocomplete-input').val(rowData.zone_name);
        if (rowData.is_active === '1' || rowData.is_active === 1) {
          $('input[name="listGroupRadioEdit"]').filter('#active').prop('checked', true);
        } else {
          $('input[name="listGroupRadioEdit"]').filter('#inactive').prop('checked', true);
        }
      }
    };
  })();
