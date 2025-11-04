  var JOBS;
  var MACHINES;
  var PALLETS;
  var ZONES;
  var PROCESS;
  $(async function(){
    const showRowsInit = 22;
    let showRows = showRowsInit;

    JOBS = await PlPalletInstance.getSelectJobData();
    MACHINES = await PlMachineInstance.getSelectMachine();
    PALLETS = await PlPalletInstance.getSelectPallet();
    ZONES = await PlZoneInstance.getSelectZone();
    PROCESS = await PlPalletInstance.getSelectProcess();
    const showRowsOptions = [
      { text: 'ALL', value: 'ALL' },
      { text: '15', value: 15 },
      { text: '22', value: 22 },
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
      try {
        Axios.showLoadingIcon();
        response = await PlPalletInstance.getPallet(page, pageSize);
        data = response.data.data.map(p => ({
          ...p,
          job_name: JOBS.data.find(j => j.job_id === p.job_id)?.job_name || '',
          machine_name: MACHINES.data.data.find(j => j.machine_id === p.machine_id)?.machine_name || '',
          next_machine_name: MACHINES.data.data.find(j => j.machine_id === p.next_machine_id)?.machine_name || '',
          process_name: PROCESS.data.find(j => j.process_id === p.process_id)?.process_name || '',
          next_process_name: PROCESS.data.find(j => j.process_id === p.next_process_id)?.process_name || '',
          zone_name: ZONES.data.data.find(j => j.zone_code === p.zone_code)?.zone_name || '',
          next_zone_name: ZONES.data.data.find(j => j.zone_code === p.next_zone_code)?.zone_name || ''
        }));
      } catch (err) {
        console.error('API Error:', err);
        Notification.error(err);
      } finally {
        Axios.hideLoading();
      }
      return { total: response.data.total, data: data };
    };
    const myTable = new Table({
      dataSource: dataSource,
      columns: [
        {
          text: 'Pallet Code',
          dataField: 'pallet_code',
          width: '7%',
          pinned: true,
          align: 'center',
          cellsrenderer: function (_row, _columnfield, value, _defaulthtml, _columnproperties, rowdata) {
            return `
                <div class="status-container">
                  <button type="button" class="btn btn-sm btn-link print-pallet" data-pallet-code="${rowdata.pallet_code}"> ${value} </button>
                </div>
            `;
          }
        },
        {
          text: 'ลำดับพาเลท',
          dataField: 'pallet_number',
          cellsformat: 'N',
          width: '6%',
          pinned: true,
          align: 'center',
          cellsalign: 'center'
        },
        {
          text: 'Job',
          dataField: 'job_id',
          width: '16%',
          align: 'start',
          filtertype: 'list',
          cellsrenderer: function (_row, _columnfield, value, _defaulthtml, _columnproperties, rowdata) {
            return `
              <div class="column-text" title="${rowdata.job_id}${rowdata.job_name ? ' : ' + rowdata.job_name : ''}">
                <span>
                  ${rowdata.job_id}${rowdata.job_name ? ' : ' + rowdata.job_name : ''}
                </span>
              </div>
            `;
          }
        },
        {
          text: 'Plan',
          dataField: 'plan_id',
          width: '5%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'ชิ้นส่วน',
          dataField: 'part_name',
          width: '12%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'ยก',
          dataField: 'sig',
          width: '3%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'จำนวน',
          dataField: 'qty',
          cellsformat: 'N',
          width: '4%',
          align: 'end',
          cellsalign: 'right',
        },
        {
          text: 'สะสม',
          dataField: 'accumulate_qty',
          cellsformat: 'N',
          width: '5%',
          align: 'end',
          cellsalign: 'right',
        },
        {
          text: 'ขั้นตอน',
          dataField: 'process_name',
          width: '10%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'ขั้นตอนถัดไป',
          dataField: 'next_process_name',
          width: '10%',
          align: 'start',
          filtertype: 'list',
        },
        {
          text: 'Outbound',
          dataField: 'zone_code',
          width: '6%',
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
          text: 'Inbound',
          dataField: 'next_zone_code',
          width: '6%',
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
          text: 'สถานะ',
          dataField: 'status',
          width: '8%',
          align: 'center',
          editable: false,
          filtertype: 'list',
          cellsrenderer: function (_row, _columnfield, value) {
            let badgeClass = 'bg-secondary';
            if (value === 'USED') badgeClass = 'success';
            else if (value === 'INBOUND') badgeClass = 'success';
            else if (value === 'OUTBOUND') badgeClass = 'received';
            else if (value === 'WAIT_DRY') badgeClass = 'pending';
            else if (value === 'REJECT') badgeClass = 'error';
            else if (value === 'AUTO_PASS') badgeClass = 'received';
            else if (value === 'PENDING_QC') badgeClass = 'pending';
            else if (value === 'CANCELLED') badgeClass = 'error';
            return `
                    <div class="status-container">
                      <span class="status-badge ${badgeClass}">
                        ${value}
                      </span>
                    </div>
                  `;
          },
        },
        {
          text: 'MACHINE',
          dataField: 'machine_id',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Next MACHINE',
          dataField: 'next_machine_id',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Process Name',
          dataField: 'process_id',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Next Process Name',
          dataField: 'next_process_id',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'ยกพับ',
          dataField: 'sig_folding',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Pallet Type',
          dataField: 'pallet_type',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Last Pallet',
          dataField: 'is_last_pallet',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Wait Dry',
          dataField: 'dry_finish_time',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Send Out',
          dataField: 'is_send_out',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'Plan Date',
          dataField: 'plan_date',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'is_wait_dry',
          dataField: 'is_wait_dry',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
        {
          text: 'job_name',
          dataField: 'job_name',
          width: '5%',
          align: 'start',
          filtertype: 'list',
          hidden: true
        },
      ],
      // groupable: true,
      // groups: ['productName'],
      dataFields: [
        { name: 'id', type: 'number' },
        { name: 'pallet_code', type: 'string' },
        { name: 'job_id', type: 'string' },
        { name: 'job_name', type: 'string' },
        { name: 'part_name', type: 'string' },
        { name: 'plan_id', type: 'string' },
        { name: 'pallet_number', type: 'string' },
        { name: 'sig', type: 'number' },
        { name: 'qty', type: 'number' },
        { name: 'accumulate_qty', type: 'number' },
        { name: 'process_id', type: 'number' },
        { name: 'process_name', type: 'string' },
        { name: 'zone_code', type: 'string' },
        { name: 'next_zone_code', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'machine_id', type: 'string' },
        { name: 'next_machine_id', type: 'string' },
        { name: 'next_process_id', type: 'number' },
        { name: 'next_process_name', type: 'string' },
        { name: 'sig_folding', type: 'string' },
        { name: 'pallet_type', type: 'string' },
        { name: 'is_last_pallet', type: 'string' },
        { name: 'is_wait_dry', type: 'string' },
        { name: 'dry_finish_time', type: 'string' },
        { name: 'is_send_out', type: 'string' },
        { name: 'plan_date', type: 'string' },
      ],
      enableRowEdit: true,
      editModalId: 'editModal',
      onRowEdit: async (createPalletdData) => {
      },
      fieldMap: {
        pallet_code: '#editPalletCode',
      },
      rowsPerPage: showRows,
    });

    $('#editModal').on('show.bs.modal', async () => {
      if (!myTable.currentEditRow) return;
      const { success, data } = await PlPalletInstance.getPalletOne({pallet_code: myTable.currentEditRow.data.pallet_code});
      const dataObj = data.data.map(p => ({
        ...p,
        job_name: JOBS.data.find(j => j.job_id === p.job_id)?.job_name || '',
        machine_name: MACHINES.data.data.find(j => j.machine_id === p.machine_id)?.machine_name || '',
        next_machine_name: MACHINES.data.data.find(j => j.machine_id === p.next_machine_id)?.machine_name || '',
        process_name: PROCESS.data.find(j => j.process_id === p.process_id)?.process_name || '',
        next_process_name: PROCESS.data.find(j => j.process_id === p.next_process_id)?.process_name || '',
        zone_name: ZONES.data.data.find(j => j.zone_code === p.zone_code)?.zone_name || '',
        next_zone_name: ZONES.data.data.find(j => j.zone_code === p.next_zone_code)?.zone_name || ''
      }));
      await PlElementInstance.setData(dataObj[0]);
      await PlElementInstance.renderDataForm();
    });

    $('.table-grid').on('click', '.print-pallet', function(e) {
      e.preventDefault();
      const pallet_code = $(this).data('pallet-code');
      window.open(`/view?module=pl&file=pl_print&folder=views/print&pallet_code=${pallet_code}`, '_blank');
    });

    Input.dropdownButton({
      containerSelector: '#exportButtonGroup',
      items: [
        {
          icon: '<i class="fa-solid fa-file-pdf"></i>',
          label: 'Export as PDF',
          value: 'exportPDF',
          id: 'exportPdf',
        },
        {
          icon: '<i class="fa-solid fa-file-excel"></i>',
          label: 'Export as Excel',
          value: 'exportExcel',
          id: 'exportExcel',
        },
      ],
      isActionButton: true,
    });

    $('#exportPdf').on('click', () => {
      console.log('Export as PDF');
    });

    $('#exportExcel').on('click', () => {
      console.log('Export as Excel');
    });

    const sortedPallets = PALLETS.data.data.sort((a, b) => b.pallet_code.localeCompare(a.pallet_code));
    const selectPallet = sortedPallets.map(p => ({
      text: p.pallet_code,
      value: p.pallet_code
    }));
    $('.searchPallet').dropdownSelect2({
      options: selectPallet,
      placeholder: 'เลือก Pallet Code',
      allowClear: true,
      selectedValue: '',
      allowSearch: true
    });

    const sortedJobs = PALLETS.data.data.filter((obj, index, self) => index === self.findIndex(o => o.job_id === obj.job_id)).sort((a, b) => b.job_id.localeCompare(a.job_id));
    const selectJob = sortedJobs.map(p => {
      const jobInfo = JOBS?.data?.find(j => j.job_id === p.job_id);
      const jobName = jobInfo ? jobInfo.job_name : '';
      const jobDisplay = jobName ? `${p.job_id} : ${jobName}` : p.job_id;
      return {
        text: jobDisplay,
        value: p.job_id
      };
    });
    $('.searchJob').dropdownSelect2({
      options: selectJob,
      placeholder: 'เลือก Job',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
    });

    const sortedPlans = PALLETS.data.data.filter((obj, index, self) => index === self.findIndex(o => o.plan_id === obj.plan_id)).sort((a, b) => Number(b.plan_id) - Number(a.plan_id));
    const selectPlans = sortedPlans.map(p => ({
      text: p.plan_id,
      value: p.plan_id
    }));
    $('.searchPlan').dropdownSelect2({
      options: selectPlans,
      placeholder: 'เลือก Plan ID',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const sortedPartName = PALLETS.data.data.filter((obj, index, self) => index === self.findIndex(o => o.part_name === obj.part_name)).sort((a, b) => a.part_name.localeCompare(b.part_name)); 
    const selectPartName = sortedPartName.map(p => ({
      text: p.part_name,
      value: p.part_name
    }));
    $('.searchPartName').dropdownSelect2({
      options: selectPartName,
      placeholder: 'เลือกชิ้นส่วน',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const processMap = new Map(PROCESS.data.map(p => [p.process_id, p.process_name]));
    const palletsWithName = PALLETS.data.data.map(p => ({
      ...p,
      process_name: processMap.get(p.process_id) || '(ไม่ทราบขั้นตอน)',
    }));
    const sortedProcess = palletsWithName.filter((obj, index, self) => index === self.findIndex(o => o.process_name === obj.process_name)).sort((a, b) => a.process_name.localeCompare(b.process_name)); 
    const selectProcess = sortedProcess.map(p => ({
      text: p.process_name,
      value: p.process_id
    }));
    $('.searchProcess').dropdownSelect2({
      options: selectProcess,
      placeholder: 'เลือกขั้นตอน',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });
    $('.searchNextProcess').dropdownSelect2({
      options: selectProcess,
      placeholder: 'เลือกขั้นตอนถัดไป',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });


    const sortedOutbound = ZONES.data.data.filter((obj, index, self) => index === self.findIndex(o => o.zone_code === obj.zone_code)).sort((a, b) => a.zone_code.localeCompare(b.zone_code)); 
    const selectOutbound = sortedOutbound.map(p => ({
      text: p.zone_code + ' : ' + p.zone_name,
      value: p.zone_code
    }));
    $('.searchOutbound').dropdownSelect2({
      options: selectOutbound,
      placeholder: 'เลือก ZONE',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const sortedInbound = ZONES.data.data.filter((obj, index, self) => index === self.findIndex(o => o.zone_code === obj.zone_code)).sort((a, b) => a.zone_code.localeCompare(b.zone_code)); 
    const selectInbound = sortedInbound.map(p => ({
      text: p.zone_code + ' : ' + p.zone_name,
      value: p.zone_code
    }));
    $('.searchInbound').dropdownSelect2({
      options: selectInbound,
      placeholder: 'เลือก ZONE',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const technicianIdData = [
      { text: 'Test1', value: '2660031' },
      { text: 'Test2', value: '2660032' },
    ];
    const technicianId = technicianIdData.map(m => ({
      text: `${m.value} : ${m.text}`,
      value: m.value,
    }));
    $('.technicianId').dropdownSelect2({
      options: technicianId,
      placeholder: 'เลือก ช่างพิมพ์',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const statusData = [
      { text: 'WAIT DRY', value: 'WAIT_DRY' },
      { text: 'PENDING QC', value: 'PENDING_QC' },
      { text: 'REJECT', value: 'REJECT' },
      { text: 'OUTBOUND', value: 'OUTBOUND' },
      { text: 'INBOUND', value: 'INBOUND' },
      { text: 'CANCELLED', value: 'CANCELLED' },
    ];            
    const status = statusData.map(m => ({
      text: `${m.text}`,
      value: m.value,
    }));
    $('.palletStatusSearch').dropdownSelect2({
      options: status,
      placeholder: 'เลือก สถานะ',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    const palletTypeData = [
      { text: 'พาเลททั่วไป', value: 'พาเลททั่วไป' },
      { text: 'พาเลทตัวอย่าง', value: 'พาเลทตัวอย่าง' },
      { text: 'พาเลท NCR', value: 'พาเลท NCR' },
      { text: 'Limit สีลูกค้า', value: 'Limit สีลูกค้า' },
      { text: 'พาเลท Quarantine', value: 'พาเลท Quarantine' },
    ];            
    const palletType = palletTypeData.map(m => ({
      text: `${m.text}`,
      value: m.value,
    }));
    $('.editPalletType').dropdownSelect2({
      options: palletType,
      placeholder: 'เลือก ประเภทพาเลท',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });

    function search() {
      const processNameMap = Object.fromEntries(PROCESS.data.map(p => [p.process_id, p.process_name]));
      const chipContainer = $('.table-search-value');
      $('#searchButton').on('click', () => {
        $('.search-list-expand').toggleClass('show');
      });
      $('#applySearchButton').on('click', () => {
        const palletCode = $('#searchPallet').val();
        const jobID = $('#searchJob').val();
        const planID = $('#searchPlan').val();
        const sig = $('#searchSig').val();
        const qty = $('#searchQty').val();
        const partName = $('#searchPartName').val();
        const process = $('#searchProcess').val();
        const nextProcess = $('#searchNextProcess').val();
        const outbound = $('#searchOutbound').val();
        const inbound = $('#searchInbound').val();
        const status = $('#palletStatusSearch').val();
        console.log('nextProcess' ,nextProcess)
        PlSearchInstance.setSearch('pl', {
          pallet_code: palletCode,
          job_id: jobID,
          plan_id: planID,
          sig,
          qty,
          part_name: partName,
          process_id: process,
          next_process_id: nextProcess,
          zone_code: outbound,
          next_zone_code: inbound,
          status,
        });

        chipContainer.empty();
        const addChip = (label, key, value) => {
          if (!value) return;

          if (key === 'process_id' || key === 'next_process_id') {
            const processName = processNameMap[value] || '(ไม่ทราบชื่อขั้นตอน)';
            chipContainer.append(`<div class="chip"><span class="filter-chip-text">${label}: ${processName}</span></div>`);
          } else {
            chipContainer.append(`<div class="chip"><span class="filter-chip-text">${label}: ${value}</span></div>`);
          }
        };

        addChip('PALLET CODE', 'pallet_code', palletCode);
        addChip('JOB', 'job_id', jobID);
        addChip('PLAN', 'plan_id', planID);
        addChip('ยก', 'sig', sig);
        addChip('จำนวน', 'qty', qty);
        addChip('ชิ้นส่วน', 'part_name', partName);
        addChip('ขั้นตอน', 'process_id', process);
        addChip('ขั้นตอนถัดไป', 'next_process_id', nextProcess);
        addChip('OUTBOUND', 'zone_code', outbound);
        addChip('INBOUND', 'next_zone_code', inbound);
        addChip('STATUS', 'status', status);

        myTable.loadTable(1);
        $('.search-list-expand').removeClass('show');
      });

      $('#clearSearchButton').on('click', () => {
        chipContainer.empty();

        $('#searchPallet').val(null).trigger('change');
        $('#searchJob').val(null).trigger('change');
        $('#searchPlan').val(null).trigger('change');
        $('#searchSig').val("");
        $('#searchQty').val("");
        $('#searchPartName').val(null).trigger('change');
        $('#searchProcess').val(null).trigger('change');
        $('#searchNextProcess').val(null).trigger('change');
        $('#searchOutbound').val(null).trigger('change');
        $('#searchInbound').val(null).trigger('change');
        $('#palletStatusSearch').val(null).trigger('change');

        PlSearchInstance.setSearch('pl',{
          pallet_code: null,
          job_id: null,
          plan_id: null,
          sig: null,
          qty: null,
          part_name: null,
          process_id: null,
          next_process_id: null,
          zone_code: null,
          next_zone_code: null,
          status: null,
        });
        //myTable.loadTable(1);
        //$('.search-list-expand').removeClass('show');
      });

      $(document).on('click', (e) => {
        if (!$(e.target).closest('.search-list-container').length) {
          $('.search-list-expand').removeClass('show');
        }
      });
      const savedPallet = PlSearchInstance.getSearch('pl');
      loadSearchChips(savedPallet, {
        fieldMap: {
          pallet_code: '#searchPallet',
          job_id: '#searchJob',
          plan_id: '#searchPlan',
          sig: '#searchSig',
          qty: '#searchQty',
          part_name: '#searchPartName',
          process_id: '#searchProcess',
          next_process_id: '#searchNextProcess',
          zone_code: '#searchOutbound',
          next_zone_code: '#searchInbound',
          status: '#palletStatusSearch',
        },
        labelMap: {
          pallet_code: 'PALLET CODE',
          job_id: 'JOB',
          plan_id: 'PLAN',
          sig: 'ยก',
          qty: 'จำนวน',
          part_name: 'ชิ้นส่วน',
          process_id: 'ขั้นตอน',
          next_process_id: 'ขั้นตอนถัดไป',
          zone_code: 'OUTBOUND',
          next_zone_code: 'INBOUND',
          status: 'STATUS',
        },
        displayFn: {
          process_id: (id) => processNameMap[id] || '',
          next_process_id: (id) => processNameMap[id] || '',
        },
        displayOrder: ['pallet_code','job_id','plan_id','sig','qty','part_name','process_id','next_process_id','zone_code','next_zone_code','status'],
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

  var PlElementInstance = (() => {
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
          pallet_code: $('#editPalletCode').val(),
          machine_id: $('#editMachineId').val(),
          next_machine_id: $('#editNextMachineId').val(),
          plan_id: $('#editPlanId').val(),
          plan_date: $('#editPlanDate').text(),
          part_name: $('#editPartName').val(),
          process_id: $('#editProcessId').val(),
          next_process_id: $('#editNextProcessId').val(),
          zone_code: $('#editZoneCode').val(),
          next_zone_code: $('#editNextZoneCode').val(),
          qty: $('#editQty').val(),
          sig: $('#editSig').val(),
          sig_folding: $('#editSigFolding').val(),
          detail_sig_folding: $('#editDetailSigFolding').val(),
          pallet_type: $('#editPalletType').val(),
          technician_id: $('#editTechnicianId').val(),
          is_last_pallet: $('#editIsLastPallet').is(':checked'),
          dry_finish_time: $('#editDryFinishTime').is(':checked'),
          wait_dry_hr: $('#editWaitDryHr').val(),
          is_send_out: $('#editIsSendOut').is(':checked'),
          timesheet_remark: $('#editTimesheetRemark').val(),
        };
        dataObj = obj;
        return obj;
      },
      
      normalizeData(raw) {
        const isWaitDry = raw.dry_finish_time ? 'YES' : 'NO';
        const waitDryHr = parseFloat(raw.wait_dry_hr) || 0;
        const dryFinishTime = isWaitDry === 'YES' 
          ? moment().add(waitDryHr, 'hours').format('YYYY-MM-DD HH:mm:ss') 
          : null;
        
        return {
          ...raw,
          plan_id: parseInt(raw.plan_id) || 0,
          process_id: parseInt(raw.process_id) || 0,
          next_process_id: parseInt(raw.next_process_id) || 0,
          qty: parseFloat(raw.qty) || 0,
          job_qty: parseFloat(raw.job_qty) || 0,
          sig: parseInt(raw.sig) || 0,
          is_last_pallet: raw.is_last_pallet ? 'YES' : 'NO',
          is_wait_dry: isWaitDry,
          wait_dry_hr: waitDryHr,
          dry_finish_time: dryFinishTime,
          is_send_out: raw.is_send_out ? 'YES' : 'NO'
        };
      },
      
      getDataEditFormNormalized() {
        const raw = this.getDataEditForm();
        return this.normalizeData(raw);
      },
      
      async renderDataForm() {
        const rowData = dataObj;
        
        $('#editPalletCode').val(rowData.pallet_code);
        $('#editMachineId').val(rowData.machine_id + ' : ' + rowData.machine_name);
        $('#editNextMachineId').val(rowData.next_machine_id + ' : ' + rowData.next_machine_name);
        $('#editPlanId').val(rowData.plan_id);
        $('#editPlanDate').text(rowData.plan_date);
        $('#editJobId').val(rowData.job_id + ' : ' + rowData.job_name);
        $('#editPartName').val(rowData.part_name);
        $('#editProcessId').val(rowData.process_name);
        $('#editNextProcessId').val(rowData.next_process_name);
        $('#editZoneCode').val(rowData.zone_code + ' : ' + rowData.zone_name);
        $('#editNextZoneCode').val(rowData.next_zone_code + ' : ' + rowData.next_zone_name);
        $('#editQty').val(rowData.qty);
        $('#editSig').val(rowData.sig);
        $('#editSigFolding').val(rowData.sig_folding);
        $('#editDetailSigFolding').val(rowData.detail_sig_folding);
        $('.editPalletType').val(rowData.pallet_type).trigger('change');;
        $('#editTechnicianId').val(rowData.technician_id);
        $('#editIsLastPallet').prop('checked', rowData.is_last_pallet === 'YES');
        $('#editDryFinishTime').prop('checked', rowData.is_wait_dry === 'YES');
        $('#editWaitDryHr').val(rowData.dry_finish_time);
        $('#editIsSendOut').prop('checked', rowData.is_send_out === 'YES');
        $('#editTimesheetRemark').val(rowData.timesheet_remark);
      }
    };
  })();