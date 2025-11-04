  var ZONES;
  $(async function(){
    ZONES = await PlZoneInstance.getSelectZone();
    $('#saveEditMachine').on('click', async () => {
      const f = new Form({ formSelector: '#editForm' });
      const v = f.validateInput();
      if (!v) {
        return;
      }
      const data = await PlElementMachineInstance.getDataEditForm();
      const response = await PlMachineInstance.updateMachine(data);
      if(!response.success){
        let err = (response.data && response.data[0] && response.data[0].path && response.data[0].message) ? `${response.data[0].path[0]} : ${response.data[0].message}` : response.data;
        if (err.includes('SequelizeForeignKeyConstraintError')) {
          Notification.error('ไม่มี Zone ดังกล่าว');
        } else {
          Notification.error(err);
        }
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
      const dataObj = await PlElementMachineInstance.getDataAddForm();
      const { success, data } = await PlMachineInstance.createMachine(dataObj);
      if(!success){
        let err = (data && data[0] && data[0].path && data[0].message) ? `${data[0].path[0]} : ${data[0].message}` : data;
        Notification.error(err);
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
      let data;
      const machineId = $('#machineIdSearch').val()?.trim();
      const machineName = $('#machineNameSearch').val()?.trim();
      const zoneCode = $('#zoneCodeSearch').val()?.trim();
      const isActive = $('#isActiveSearch').val();
      const filterData = {
        machine_id: machineId || null,
        machine_name: machineName || null,
        zone_code: zoneCode || null,
        is_active: isActive != null && isActive !== '' ? Number(isActive) : null
      };
      await PlElementMachineInstance.setData(filterData)
      try {
        Axios.showLoadingIcon();
        response = await PlMachineInstance.getMachine(page, pageSize);
        data = response.data.data.map(p => ({
          ...p,
          zone_name: ZONES.data.data.find(j => j.zone_code === p.zone_code)?.zone_name || '',
        }));
      } catch (error) {
        console.error('API Error:', err);
        Notification.error();
      } finally {
        Axios.hideLoading();
      }
      return { total: response.data.total, data: data };
    };
    const myTable = new Table({
      dataSource: dataSource,
      checkboxCol: false,
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
          width: '15%',
          pinned: true,
          align: 'center',
          cellsalign: 'center',
          cellsrenderer: function (_row, _columnfield, value, _defaulthtml, _columnproperties, rowdata) {
            if (!value) return '';
            return `
              <div class="status-container">
                <span class="zone_color_bg ${value}">
                  ${value}
                </span>
              </div>
            `;
          }
        },
        {
          text: 'Zone Name',
          dataField: 'zone_name',
          width: '25%',
          pinned: true,
          align: 'start',
        },
        {
          text: 'Machine Code',
          dataField: 'machine_id',
          width: '20%',
          pinned: true,
          align: 'start',
        },
        {
          text: 'Machine Name',
          dataField: 'machine_name',
          width: '25%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'Active',
          dataField: 'is_active',
          width: '15%',
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
            } else {
              badgeClass = 'bg-secondary';
              displayText = value;
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
        { name: 'machine_id', type: 'string' },
        { name: 'machine_name', type: 'string' },
        { name: 'is_active', type: 'number' },
      ],
      enableRowEdit: true,
      editModalId: 'editModal',
      onRowEdit: async (updatedData) => {
      },
      fieldMap: {
        id: '#editRowIndex',
        machine_id: '#editMachineCode .autocomplete-input',
      },
      rowsPerPage: showRows,
    });

    $('#editModal').on('show.bs.modal', async () => {
      if (!myTable.currentEditRow) return;
      await PlElementMachineInstance.setData({machine_id: myTable.currentEditRow.data.machine_id});
      const { success, data } = await PlMachineInstance.getMachineOne();
      await PlElementMachineInstance.setData(data.data[0]);
      await PlElementMachineInstance.renderDataForm();
    });

    Input.splitButtonDropdown({
      containerSelector: '#actionButtonGroup',
      normalItems: [
        { label: '<span class="CANCEL">CANCEL</span>', value: 'cancel', id: 'cancel' },
      ],
      moduleName: 'template',
      menuId: '4',
    });

    const machines = await PlMachineInstance.getSelectMachine();
    const sortedMachines = machines.data.data.filter((obj, index, self) => index === self.findIndex(o => o.machine_id === obj.machine_id)).sort((a, b) => a.machine_id.localeCompare(b.machine_id)); 
    const selectMachine = sortedMachines.map(p => ({
      text: p.machine_id + ' : ' + p.machine_name,
      value: p.machine_id
    }));
    $('.machineIdSearch').dropdownSelect2({
      options: selectMachine,
      placeholder: 'เลือก Machine',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    console.log('ZONES' ,ZONES)
    const allZones = ZONES.data.data;
    const activeZones = allZones.filter(z => z.is_active === 1);

    const uniqueAllZones = allZones.filter((obj, index, self) => index === self.findIndex(o => o.zone_code === obj.zone_code)).sort((a, b) => a.zone_code.localeCompare(b.zone_code));
    const uniqueActiveZones = activeZones.filter((obj, index, self) => index === self.findIndex(o => o.zone_code === obj.zone_code)).sort((a, b) => a.zone_code.localeCompare(b.zone_code));

    const selectAll = uniqueAllZones.map(p => ({
      text: `${p.zone_code} : ${p.zone_name}`,
      value: p.zone_code
    }));

    const selectActive = uniqueActiveZones.map(p => ({
      text: `${p.zone_code} : ${p.zone_name}`,
      value: p.zone_code
    }));
    const selectAllWithDisabled = uniqueAllZones.map(p => ({
      text: `${p.zone_code} : ${p.zone_name}`,
      value: p.zone_code,
      disabled: p.is_active === 0
    }));
    $('.zoneCode').dropdownSelect2({
      options: selectActive,
      placeholder: 'เลือก ZONE',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });
    $('.editZoneCode').dropdownSelect2({
      options: selectAllWithDisabled,
      placeholder: 'เลือก ZONE',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });
    uniqueAllZones.forEach(zone => {
      if (zone.is_active === 0) {
        $('#editZoneCode option[value="' + zone.zone_code + '"]').prop('disabled', true);
      }
    });
    $('#editZoneCode').trigger('change.select2');

    $('.zoneCodeSearch').dropdownSelect2({
      options: selectAll,
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
      placeholder: 'เลือก สถานะ',
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
        const machineId = $('#machineIdSearch').val()?.trim();
        const machineName = $('#machineNameSearch').val()?.trim();
        const zoneCode = $('#zoneCodeSearch').val()?.trim();
        const zoneName = '';
        const isActive = $('#isActiveSearch').val();

        PlSearchInstance.setSearch('machine', {
          machine_id: machineId,
          machine_name: machineName,
          zone_code: zoneCode,
          zone_name: zoneName,
          is_active: (isActive === '1' || isActive === '0') ? isActive : '',
        });

        chipContainer.empty();
        const addChip = (label, value) => {
          if (value) chipContainer.append(`<div class="chip"><span class="filter-chip-text">${label}: ${value}</span></div>`);
        };

        addChip('MACHINE', machineId);
        addChip('MACHINE NAME', machineName);
        addChip('ZONE CODE', zoneCode);
        addChip('ZONE NAME', zoneName);
        addChip('STATUS', isActive === '1' ? 'ACTIVE' : isActive === '0' ? 'INACTIVE' : '');
        myTable.loadTable(1);
        $('.search-list-expand').removeClass('show');
      });

      $('#clearSearchButton').on('click', () => {
        $('#machineIdSearch').val(null).trigger('change');
        $('#machineNameSearch').val('');
        $('#zoneCodeSearch').val(null).trigger('change');
        $('#isActiveSearch').val('');
        PlSearchInstance.setSearch('machine',{
          machine_id: null,
          machine_name: null,
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

      const save = PlSearchInstance.getSearch('machine');
      loadSearchChips(save, {
        fieldMap: {
          machine_id: '#machineIdSearch',
          machine_name: '#machineNameSearch',
          zone_code: '#zoneCodeSearch',
          zone_name: '#zoneNameSearch',
          is_active: '#isActiveSearch',
        },
        labelMap: {
          machine_id: 'MACHINE',
          machine_name: 'MACHINE NAME',
          zone_code: 'ZONE CODE',
          zone_name: 'ZONE NAME',
          is_active: 'STATUS',
        },
        displayFn: {
          is_active: v => v === '1' ? 'ACTIVE' : v === '0' ? 'INACTIVE' : '',
        },
        displayOrder: ['machine_id', 'machine_name', 'zone_code', 'zone_name', 'is_active'],
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

  var PlElementMachineInstance = (() => {
    let dataObj = {};
    return {
      setData(obj) {
        dataObj = obj;
      },
      
      getData() {
        return dataObj;
      },

      getDataEditForm() {
        const obj = {
            machine_id: $('#editMachineCode').val(),
            machine_name:$('#editMachineName .autocomplete-input').val(),
            zone_code: $('#editZoneCode').val(),
            is_active: Number($('input[name="listGroupRadioEdit"]').filter(':checked').val() || 1)
        };
        dataObj = obj;
        return obj;
      },

      getDataAddForm() {
        const obj = {
            machine_id: $('#machineCode').val(),
            machine_name: $('#machineName .autocomplete-input').val(),
            zone_code: $('#zoneCode').val(),
            is_active: Number($('input[name="listGroupRadioAdd"]').filter(':checked').val() || 1)
        };
        dataObj = obj;
        return obj;
      },

      async renderDataForm() {
        const rowData = dataObj;
        $('#editMachineCode').val(rowData.machine_id);
        $('#editMachineName .autocomplete-input').val(rowData.machine_name);
        $('#editZoneCode').val(rowData.zone_code).trigger('change');
        if (rowData.is_active === '1' || rowData.is_active === 1) {
            $('input[name="listGroupRadioEdit"]').filter('#active').prop('checked', true);
        } else {
            $('input[name="listGroupRadioEdit"]').filter('#inactive').prop('checked', true);
        }
      }
    };
  })();