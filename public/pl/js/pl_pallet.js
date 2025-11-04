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
          width: '6%',
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
          width: '4%',
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
          text: 'Outbound',
          dataField: 'zone_code',
          width: '7%',
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
          width: '7%',
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
          width: '14%',
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
          text: 'Next Process ID',
          dataField: 'next_process_name',
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

    $('#addRow').on('click', function () {
      clearPlanForm();
      $('#addModal').modal('show');
    })

    $('#addRowData').on('click', async () => {
      const f = new Form({ formSelector: '#addForm' });
      const v = f.validateInput();
      if (!v) {
        const planId = $('.planId').val();
        const machineId = $('#machineId').val();
        const technicianId = $('#technicianId').val();
        const palletType = $('#palletType').val();
        const qty = Number($('#qty').val());
        const sig = Number($('#sig').val());
        const jobId = $('#jobId').val();
        const jobQty = $('#jobQty').val();
        const partName = $('#partName').val();
        const processId = $('#processId').val();
        const nextProcessId = $('#nextProcessId').val();
        const zoneCode = $('#zoneCode').val();
        const nextZoneCode = $('#nextZoneCode').val();
        const timesheetRemark = $('#timesheetRemark').val();

        if (!planId) {
          Notification.error('กรุณาเลือก PLAN ID');
          $('.planId').focus();
          return;
        }
        if (!jobId) {
          Notification.error('กรุณากรอก Job ID');
          $('#jobId').focus();
          return;
        }
        if (!jobQty) {
          Notification.error('ไม่มีข้อมูล Job QTY');
          $('#jobQty').focus();
          return;
        }
        if (!partName) {
          Notification.error('กรุณากรอก ชิ้นส่วน');
          $('#partName').focus();
          return;
        }
        if (!machineId) {
          Notification.error('กรุณาเลือก MACHINE');
          $('#machineId').focus();
          return;
        }
        if (!nextProcessId) {
          Notification.error('กรุณากรอก Next Process');
          $('#nextProcessId').focus();
          return;
        }
        if (!processId) {
          Notification.error('กรุณากรอก Process');
          $('#processId').focus();
          return;
        }
        if (!zoneCode) {
          Notification.error('กรุณากรอก Zone');
          $('#zoneCode').focus();
          return;
        }
        if (!nextZoneCode) {
          Notification.error('กรุณากรอก Next Zone');
          $('#nextZoneCode').focus();
          return;
        }
        if (!technicianId) {
          Notification.error('กรุณาเลือก ช่างพิมพ์');
          $('#technicianId').focus();
          return;
        }
        if (!palletType) {
          Notification.error('กรุณาเลือก ประเภทพาเลท');
          $('#palletType').focus();
          return;
        }
        if (isNaN(qty) || qty <= 0) {
          Notification.error('กรุณากรอกจำนวน (Qty) ที่มากกว่า 0');
          $('#qty').focus();
          return;
        }
        if (isNaN(sig) || sig <= 0) {
          Notification.error('กรุณากรอกจำนวนยก (Sig) ที่มากกว่า 0');
          $('#sig').focus();
          return;
        }
        return;
      }

      const dataObj = PlElementInstance.getDataAddFormNormalized();
      try {
          Axios.showLoadingModal();
          const result = await PlPalletInstance.createPallet({ data: dataObj });
          if (_.isNull(result)) {
            Notification.warning('การบันทึกถูกยกเลิก');
            return;
          }
          if (result?.success) {
            $('#addModal').find('input').val('');
            Notification.success();
            $('#addModal').modal('hide');
            clearPlanForm();
            myTable.goToPage(1)
          } else {
            Notification.error(result?.message || 'บันทึกไม่สำเร็จ');
          }
      } catch (err) {
        Axios.hideLoading();
        if (await PlPalletInstance.isRequestCanceled(err)) {
          Notification.warning('ยกเลิกคำขอเรียบร้อยแล้ว');
          return;
        }
        console.error('API Error:', err);
        Alert.error({
          title: 'เกิดข้อผิดพลาด',
          text: err.message || 'ไม่สามารถบันทึกได้',
        });
      }
    });

    $('#saveEditRowPallet').on('click', async (e) => {
      const f = new Form({ formSelector: '.form' });
      const v = f.validateInput();
      if (!v) {
        const planId = $('.planId').val();
        const machineId = $('#machineId').val();
        const technicianId = $('#technicianId').val();
        const palletType = $('#palletType').val();
        const qty = Number($('#qty').val());
        const sig = Number($('#sig').val());
        const jobId = $('#jobId').val();
        const partName = $('#partName').val();
        const processId = $('#processId').val();
        const nextProcessId = $('#nextProcessId').val();
        const zoneCode = $('#zoneCode').val();
        const nextZoneCode = $('#nextZoneCode').val();
        const timesheetRemark = $('#timesheetRemark').val();

        if (!planId) {
          Notification.error('กรุณาเลือก PLAN ID');
          $('.planId').focus();
          return;
        }
        if (!jobId) {
          Notification.error('กรุณากรอก Job ID');
          $('#jobId').focus();
          return;
        }
        if (!partName) {
          Notification.error('กรุณากรอก ชิ้นส่วน');
          $('#partName').focus();
          return;
        }
        if (!machineId) {
          Notification.error('กรุณาเลือก MACHINE');
          $('#machineId').focus();
          return;
        }
        if (!nextProcessId) {
          Notification.error('กรุณากรอก Next Process');
          $('#nextProcessId').focus();
          return;
        }
        if (!processId) {
          Notification.error('กรุณากรอก Process');
          $('#processId').focus();
          return;
        }
        if (!zoneCode) {
          Notification.error('กรุณากรอก Zone');
          $('#zoneCode').focus();
          return;
        }
        if (!nextZoneCode) {
          Notification.error('กรุณากรอก Next Zone');
          $('#nextZoneCode').focus();
          return;
        }
        if (!technicianId) {
          Notification.error('กรุณาเลือก ช่างพิมพ์');
          $('#technicianId').focus();
          return;
        }
        if (!palletType) {
          Notification.error('กรุณาเลือก ประเภทพาเลท');
          $('#palletType').focus();
          return;
        }
        if (isNaN(qty) || qty <= 0) {
          Notification.error('กรุณากรอกจำนวน (Qty) ที่มากกว่า 0');
          $('#qty').focus();
          return;
        }
        if (isNaN(sig) || sig <= 0) {
          Notification.error('กรุณากรอกจำนวนยก (Sig) ที่มากกว่า 0');
          $('#sig').focus();
          return;
        }
        return;
      }
      
      const formData = PlElementInstance.getDataEditFormNormalized();
      try {
        Axios.showLoadingModal();
        const result = await PlPalletInstance.updatePallet(formData);
        if (!result) {
          return;
        }
        const { success, data } = result;
        if (!success) {
          let err = (data && data[0] && data[0].path && data[0].message) ? `${data[0].path[0]} : ${data[0].message}` : data;
          Notification.error(err);
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

    $('#dryFinishTime').change(() => {
      if ($('#dryFinishTime').is(':checked')) {
        $('#waitDryHr').prop('readonly', false);
        $('#waitDryHr').focus();
      } else {
        $('#waitDryHr').prop('readonly', true);
        $('#waitDryHr').val('');
      }
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
      // Get all data from table
      const allData = myTable.getAllData ? myTable.getAllData() : myTable.getData();

      if (!allData || allData.length === 0) {
        Notification.warning('ไม่มีข้อมูลสำหรับ Export');
        return;
      }

      // Define columns for export (only visible columns)
      const exportColumns = [
        { header: 'Pallet Code', dataField: 'pallet_code', width: 15 },
        { header: 'ลำดับพาเลท', dataField: 'pallet_number', width: 12 },
        {
          header: 'Job',
          dataField: 'job_id',
          width: 25,
          formatter: (value, row) => {
            return row.job_name ? `${value} : ${row.job_name}` : value;
          }
        },
        { header: 'Plan', dataField: 'plan_id', width: 12 },
        { header: 'ชิ้นส่วน', dataField: 'part_name', width: 20 },
        { header: 'ยก', dataField: 'sig', width: 10 },
        { header: 'จำนวน', dataField: 'qty', width: 12 },
        { header: 'สะสม', dataField: 'accumulate_qty', width: 12 },
        { header: 'ขั้นตอน', dataField: 'process_name', width: 15 },
        { header: 'Outbound', dataField: 'zone_code', width: 12 },
        { header: 'Inbound', dataField: 'next_zone_code', width: 12 },
        { header: 'สถานะ', dataField: 'status', width: 15 },
      ];

      // Export to Excel
      ExcelExport.exportToExcel({
        data: allData,
        columns: exportColumns,
        filename: 'PL_Pallet_Report',
        sheetName: 'Pallet Data'
      });
    });

    Input.splitButtonDropdown({
      containerSelector: '#actionButtonGroup',
      importantItems: [
        { label: 'APPROVE/REJECT QC', value: 'PENDING_QC', id: 'PENDING_QC', },
        { label: 'OUTBOUND -> INBOUND', value: 'OUTBOUND', id: 'OUTBOUND', },
      ],
      normalItems: [
        { label: 'CANCEL', value: 'cancel', id: 'cancel', },
        { label: 'DELETE', value: 'delete', id: 'delete', },

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
          Axios.showLoadingModal();
          for (let i = 0; i < selectedRows.length; i++) {
            if (Axios.controller?.signal.aborted) {
              isCanceled = true;
              break;
            }
            const row = selectedRows[i];
            Axios.modalContent = `<div>กำลังลบ (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
            const response = await PlPalletInstance.deletePallet({ pallet_code: row.pallet_code });
            console.log('response',response) 
            if (response == null) {
              isCanceled = true;
              break;
            }
            if (response.success === 0) {
              errorItems.push({ code: row.pallet_code, reason: response.data });
              break;
            }
            if (response.success) {
              successCodes.push(row.pallet_code);
              deletedIds.push(row.id);
              Axios.modalContent = `<div>กำลังลบ (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
            } else {
              const reason = response.data || response.message || 'Unknown reason';
              errorItems.push({ code: row.pallet_code, reason: reason });
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
            console.log(720)
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
              Notification.success(`ลบสำเร็จทั้งหมด ${successCodes.length} รายการ`);
            }
            let summaryHtml = '<div style="text-align: left;">';
            if (errorItems.length > 0) {
              // summaryHtml += '<strong>ลบไม่สำเร็จ:</strong><br>';
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

    $('.table-action').on('click', '#cancel', async (e) => {
      e.preventDefault();
      const selectedRows = myTable.getSelectedRowData();
      if (!selectedRows || selectedRows.length === 0) {
        Notification.error('กรุณาเลือกอย่างน้อย 1 แถว');
        return;
      }

      const confirmModal = new ConfirmModal({
        confirmHeader: 'CONFIRM CANCEL',
        confirmMessage: 'Are you sure you want to cancel?',
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
            Axios.modalContent = `<div>กำลัง Cancel (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
            const response = await PlPalletInstance.cancelPallet({ pallet_code: row.pallet_code });
            if (response == null) {
              isCanceled = true;
              break;
            }
            if (response.success === 0) {
              errorItems.push({ code: row.pallet_code, reason: response.data });
              break;
            }
            if (response.success) {
              successCodes.push(row.pallet_code);
              deletedIds.push(row.id);
              Axios.modalContent = `<div>กำลัง Cancel (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
            } else {
              const reason = response.data || response.message || 'Unknown reason';
              errorItems.push({ code: row.pallet_code, reason: reason });
              break;
            }
          }
          Axios.hideLoading();

          if (isCanceled) {
            if (deletedIds.length > 0) {
              deletedIds.forEach(id => {
                const index = myTable.currentPageData.findIndex(r => r.id === id);
                if (index > -1) {
                  myTable.currentPageData[index].status = 'CANCELLED';
                }
                const $row = $(`.row-checkbox[data-row-id="${id}"]`).closest('div[role="row"]');
                const $statusBadge = $row.find('.status-badge');
                $statusBadge.removeClass('received pending success bg-secondary');
                $statusBadge.addClass('error').text('CANCELLED');
                myTable.selectedRowIds.delete(id);
                $(`.row-checkbox[data-row-id="${id}"]`).prop('checked', false);
              });
            }
            if (successCodes.length > 0) {
              Notification.success(`Cancel สำเร็จทั้งหมด ${successCodes.length} รายการ`);
            } else {
              Notification.warning('การ Cancel ถูกยกเลิก');
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
            Notification.success(`Cancle สำเร็จทั้งหมด ${successCodes.length} รายการ`);
          } else if (successCodes.length > 0 || errorItems.length > 0) {
            if (deletedIds.length > 0) {
              deletedIds.forEach(id => {
                const index = myTable.currentPageData.findIndex(r => r.id === id);
                if (index > -1) {
                  myTable.currentPageData[index].status = 'CANCELLED';
                }
                const $row = $(`.row-checkbox[data-row-id="${id}"]`).closest('div[role="row"]');
                const $statusBadge = $row.find('.status-badge');
                $statusBadge.removeClass('received pending success bg-secondary');
                $statusBadge.addClass('error').text('CANCELLED');
                myTable.selectedRowIds.delete(id);
                $(`.row-checkbox[data-row-id="${id}"]`).prop('checked', false);
              });
            }
            let summaryHtml = '<div style="text-align: left;">';
            if (errorItems.length > 0) {
              // summaryHtml += '<strong>Cancel ไม่สำเร็จ:</strong><br>';
              errorItems.forEach(item => {
                summaryHtml += `${item.code} : ${item.reason}<br>`;
              });
            }
            summaryHtml += '</div>';
            Swal.fire({
              title: 'Cancel',
              html: summaryHtml,
              icon: 'warning',
              confirmButtonText: 'OK'
            });
          }
          Notification.success(`Cancel สำเร็จทั้งหมด ${successCodes.length} รายการ`);
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

    $('.table-action').on('click', '#PENDING_QC', async (e) => {
      e.preventDefault();
      const selectedRows = myTable.getSelectedRowData();
      if (!selectedRows || selectedRows.length === 0) {
        Notification.error('กรุณาเลือกอย่างน้อย 1 แถว');
        return;
      }

      const { isConfirmed, isDenied } = await Swal.fire({
        title: 'ตั้งสถานะ QC',
        text: 'คุณต้องการตั้งสถานะ QC เป็น PASS หรือ REJECT?',
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'PASS',
        denyButtonText: 'REJECT',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      });

      let status_qc = null;
      if (isConfirmed) status_qc = 'PASS';
      else if (isDenied) status_qc = 'REJECT';
      else return;

      const successCodes = [];
      const errorItems = [];
      let isCanceled = false;

      try {
        Axios.showLoadingModal();
        for (let i = 0; i < selectedRows.length; i++) {
          if (Axios.controller?.signal.aborted) {
            isCanceled = true;
            break;
          }
          const row = selectedRows[i];
          Axios.modalContent = `<div>กำลังอัปเดต QC (${row.pallet_code}) ${i + 1}/${selectedRows.length}</div>`;
          const response = await PlPalletInstance.updateQcStatus({ pallet_code: row.pallet_code, status_qc});
          console.log('response' ,response)

          if (response == null) {
            isCanceled = true;
            break;
          }

          if (response.success === 0) {
            errorItems.push({ code: row.pallet_code, reason: response.data });
            break;
          }

          if (response.success) {
            successCodes.push(row.pallet_code);
          } else {
            errorItems.push({ code: row.pallet_code, reason: response.data || response.message || 'Unknown' });
            break;
          }
        }
        Axios.hideLoading();

        if (successCodes.length > 0) {
          Notification.success(`อัปเดต QC สำเร็จทั้งหมด ${successCodes.length} รายการ`);
        }
        if (errorItems.length > 0) {
          let summaryHtml = '<div style="text-align: left;">';
          errorItems.forEach(item => {
            summaryHtml += `${item.code} : ${item.reason}<br>`;
          });
          summaryHtml += '</div>';
          Swal.fire({ title: 'QC Error', html: summaryHtml, icon: 'warning', confirmButtonText: 'OK' });
        }
        if (isCanceled) {
          // Notification.warning('การอัปเดตถูกยกเลิก');
        }

      } catch (err) {
        Axios.hideLoading();
        Alert.error({ title: 'เกิดข้อผิดพลาด', text: err.message || 'Unknown error' });
      }
    });

    $('.table-action').on('click', '#OUTBOUND', async (e) => {
      e.preventDefault();
      const selectedRows = myTable.getSelectedRowData();
      if (!selectedRows || selectedRows.length === 0) {
        Notification.error('กรุณาเลือกอย่างน้อย 1 แถว');
        return;
      }

      const confirmModal = new ConfirmModal({
        confirmHeader: 'CONFIRM OUTBOUND → INBOUND',
        confirmMessage: 'ต้องการเปลี่ยนสถานะ OUTBOUND → INBOUND ใช่หรือไม่?',
      });
      const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'));
      confirmModalEl.show();

      confirmModal.onConfirm(async (isConfirm) => {
        if (!isConfirm) return;

        const successCodes = [];
        const errorItems = [];
        const updatedIds = [];
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
            Axios.modalContent = `<div>กำลังอัปเดต (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;

            const response = await PlPalletInstance.movePallets({
              pallet_code: row.pallet_code,
              next_status: 'INBOUND'
            });

            if (response == null) {
              isCanceled = true;
              break;
            }

            if (response.success === 0) {
              errorItems.push({ code: row.pallet_code, reason: response.data });
              break;
            }

            if (response.success) {
              successCodes.push(row.pallet_code);
              updatedIds.push(row.id);

              const index = myTable.currentPageData.findIndex(r => r.id === row.id);
              if (index > -1) {
                myTable.currentPageData[index].status = 'INBOUND';
              }
              const $row = $(`.row-checkbox[data-row-id="${row.id}"]`).closest('div[role="row"]');
              const $statusBadge = $row.find('.status-badge');
              $statusBadge.removeClass('received pending success error bg-secondary').addClass('success').text('INBOUND');

              myTable.selectedRowIds.delete(row.id);
              $(`.row-checkbox[data-row-id="${row.id}"]`).prop('checked', false);
            } else {
              errorItems.push({ code: row.pallet_code, reason: response.data || response.message || 'Unknown reason' });
              break;
            }
          }

          Axios.hideLoading();

          if (successCodes.length > 0) {
            Notification.success(`อัปเดตสำเร็จทั้งหมด ${successCodes.length} รายการ`);
          }

          if (errorItems.length > 0) {
            let summaryHtml = '<div style="text-align: left;">';
            errorItems.forEach(item => {
              summaryHtml += `${item.code} : ${item.reason}<br>`;
            });
            summaryHtml += '</div>';
            Swal.fire({
              title: 'Update Error',
              html: summaryHtml,
              icon: 'warning',
              confirmButtonText: 'OK'
            });
          }

          if (isCanceled) {
            Notification.warning('การอัปเดตถูกยกเลิก');
          }

        } catch (err) {
          Axios.hideLoading();
          Alert.error({ title: 'เกิดข้อผิดพลาด', text: err.message || 'Unknown error' });
        }
      });
    });

    // $('#PENDING_QC').on('click', () => {
    //   e.preventDefault();
    //   const selectedRows = myTable.getSelectedRowData();
    //   if (!selectedRows || selectedRows.length === 0) {
    //     Notification.error('กรุณาเลือกอย่างน้อย 1 แถว');
    //     return;
    //   }

    //   const confirmModal = new ConfirmModal({
    //     confirmHeader: 'CONFIRM PENDING QC',
    //     confirmMessage: 'Are you sure you want to delete?',
    //   });
    //   const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'));
    //   confirmModalEl.show();
    //   confirmModal.onConfirm(async (isConfirm) => {
    //     if (!isConfirm) {
    //       return;
    //     }
    //     const successCodes = [];
    //     const errorItems = [];
    //     const deletedIds = [];
    //     let isCanceled = false;
    //     try {
    //       Axios.showLoadingModal();
    //       for (let i = 0; i < selectedRows.length; i++) {
    //         if (Axios.controller?.signal.aborted) {
    //           isCanceled = true;
    //           break;
    //         }
    //         const row = selectedRows[i];
    //         Axios.modalContent = `<div>กำลังลบ (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
    //         const response = await PlPalletInstance.updateQcStatus({ pallet_code: row.pallet_code, status_qc: 'PASS' });
    //         console.log('response',response) 
    //         if (response == null) {
    //           isCanceled = true;
    //           break;
    //         }
    //         if (response.success === 0) {
    //           errorItems.push({ code: row.pallet_code, reason: response.data });
    //           break;
    //         }
    //         if (response.success) {
    //           successCodes.push(row.pallet_code);
    //           deletedIds.push(row.id);
    //           Axios.modalContent = `<div>กำลังลบ (${row.pallet_code}) ${i + 1}/${selectedRows.length} รายการ</div>`;
    //         } else {
    //           const reason = response.data || response.message || 'Unknown reason';
    //           errorItems.push({ code: row.pallet_code, reason: reason });
    //           break;
    //         }
    //       }
    //       Axios.hideLoading();

    //       if (isCanceled) {
    //         if (deletedIds.length > 0) {
    //           myTable.currentPageData = myTable.currentPageData.filter(row => !deletedIds.includes(row.id));
    //           deletedIds.forEach(id => {
    //             myTable.selectedRowIds.delete(id);
    //             $(`.row-checkbox[data-row-id="${id}"]`).closest('div[role="row"]').remove();
    //           });
    //         }
    //         if (successCodes.length > 0) {
    //           Notification.success(`ลบสำเร็จทั้งหมด ${successCodes.length} รายการ`);
    //         } else {
    //           Notification.warning('การลบถูกยกเลิก');
    //         }
    //         return;
    //       }
          
    //       if (successCodes.length > 0 && errorItems.length === 0) {
    //         console.log(720)
    //         myTable.currentPageData = myTable.currentPageData.filter(row => !deletedIds.includes(row.id));
    //         deletedIds.forEach(id => {
    //           myTable.selectedRowIds.delete(id);
    //         });
    //         myTable.refresh();
    //         myTable.clearSelection();
    //         Notification.success(`ลบสำเร็จทั้งหมด ${successCodes.length} รายการ`);
    //       } else if (successCodes.length > 0 || errorItems.length > 0) {
    //         if (deletedIds.length > 0) {
    //           myTable.currentPageData = myTable.currentPageData.filter(row => !deletedIds.includes(row.id));
    //           deletedIds.forEach(id => {
    //             myTable.selectedRowIds.delete(id);
    //             $(`.row-checkbox[data-row-id="${id}"]`).closest('div[role="row"]').remove();
    //           });
    //           Notification.success(`ลบสำเร็จทั้งหมด ${successCodes.length} รายการ`);
    //         }
    //         let summaryHtml = '<div style="text-align: left;">';
    //         if (errorItems.length > 0) {
    //           // summaryHtml += '<strong>ลบไม่สำเร็จ:</strong><br>';
    //           errorItems.forEach(item => {
    //             summaryHtml += `${item.code} : ${item.reason}<br>`;
    //           });
    //         }
    //         summaryHtml += '</div>';
    //         Swal.fire({
    //           title: 'Delete',
    //           html: summaryHtml,
    //           icon: 'warning',
    //           confirmButtonText: 'OK'
    //         });
    //       }
    //     } catch (err) {
    //       console.error('API Error:', err);
    //       Axios.hideLoading();
    //       Alert.error({ 
    //         title: 'เกิดข้อผิดพลาด',
    //         text: err.message || 'Unknown error'
    //       });
    //     }
    //   });
    // });

    const plans = await PlPalletInstance.getDataPlan({});
    const selectPlan = plans.data.map(p => ({
      text: p.plan_id,
      value: p.plan_id
    }));
    $('.planId').dropdownSelect2({
      options: selectPlan,
      placeholder: 'เลือก Plan ID',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log('selected' ,selected)
        const selectedItem = Array.isArray(selected) ? selected[0] : selected;
        if (!selectedItem || !selectedItem.value) {
          updatePlanForm(null);
          return;
        }
        const planInfo = plans.data.find(p => p.plan_id == selectedItem.value);
        updatePlanForm(planInfo);
      },
    });

    const sortedMachines = MACHINES.data.data.filter((obj, index, self) => index === self.findIndex(o => o.machine_id === obj.machine_id)).sort((a, b) => a.machine_id.localeCompare(b.machine_id));
    const selectMachine = sortedMachines.map(p => ({
      text: p.machine_id + ' : ' + p.machine_name,
      value: p.machine_id
    }));
    $('.machineId').dropdownSelect2({
      options: selectMachine,
      placeholder: 'เลือก Machine',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
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
    $('.palletType').dropdownSelect2({
      options: palletType,
      placeholder: 'เลือก ประเภทพาเลท',
      allowClear: true,
      selectedValue: '',
      allowSearch: true,
      onSelect: (selected) => {
        console.log(selected);
      },
    });
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
        const outbound = $('#searchOutbound').val();
        const inbound = $('#searchInbound').val();
        const status = $('#palletStatusSearch').val();

        PlSearchInstance.setSearch('pl', {
          pallet_code: palletCode,
          job_id: jobID,
          plan_id: planID,
          sig,
          qty,
          part_name: partName,
          process_id: process,
          zone_code: outbound,
          next_zone_code: inbound,
          status,
        });

        chipContainer.empty();
        const addChip = (label, key, value) => {
          if (!value) return;

          if (key === 'process_id') {
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
          zone_code: 'OUTBOUND',
          next_zone_code: 'INBOUND',
          status: 'STATUS',
        },
        displayFn: {
          process_id: (id) => processNameMap[id] || '(ไม่ทราบชื่อขั้นตอน)',
        },
        displayOrder: ['pallet_code','job_id','plan_id','sig','qty','part_name','process_id','zone_code','next_zone_code','status'],
      });
    }


    setApproveButton();
    finishDry();
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

  function updatePlanForm(planInfo) {
    console.log('planInfo' ,planInfo)
    if (!planInfo) {
      clearPlanForm();
      return;
    }

    const jobInfo = JOBS?.data?.find(j => j.job_id === planInfo.job_id);
    const jobName = jobInfo ? jobInfo.job_name : '';
    const jobDisplay = jobName ? `${planInfo.job_id} : ${jobName}` : planInfo.job_id;

    $('#jobId').val(jobDisplay);
    $('#jobId').attr('data-job-id', planInfo.job_id);
    $('#jobQty').val(planInfo.job_qty);
    $('#planDate').text(planInfo.plan_date);
    $('.machineId').val(planInfo.machine_id).trigger('change');
    $('#machineId').attr('data-machine-id', planInfo.machine_id);

    $('#nextMachineId').val(planInfo.next_machine_id + ' : ' + planInfo.next_machine_name);
    $('#nextMachineId').attr('data-next-machine-id', planInfo.next_machine_id);

    $('#processId').val(planInfo.process_name);
    $('#processId').attr('data-process-id', planInfo.process_id);

    $('#nextProcessId').val(planInfo.next_process_name);
    $('#nextProcessId').attr('data-next-process-id', planInfo.next_process_id);

    $('#zoneCode').val(planInfo.zone_code + ' : ' + planInfo.zone_name);
    $('#zoneCode').attr('data-zone-code', planInfo.zone_code);

    $('#nextZoneCode').val(planInfo.next_zone_code + ' : ' + planInfo.next_zone_name);
    $('#nextZoneCode').attr('data-next-zone-code', planInfo.next_zone_code);

    $('#sig').val(planInfo.sig);
    $('#sigFolding').val(planInfo.sig_folding);
    $('#partName').val(planInfo.part_name);
    $('#qty').val(planInfo.qty);
    $('.technicianId').val(planInfo.technician_id).trigger('change');
    $('.palletType').val(planInfo.pallet_type).trigger('change');
    $('#timesheetRemark').val(planInfo.timesheet_remark);
    $('#trimDetail').val(planInfo.trim_detail);
    $('#trimSize').val(planInfo.trim_size);
    $('#trimHeight').val(planInfo.trim_height);
    $('#trimData').val(JSON.stringify(planInfo.trims || []));

    const isWaitDry = planInfo.is_wait_dry == 1;
    $('#dryFinishTime').prop('checked', isWaitDry);
    $('#waitDryHr').prop('readonly', !isWaitDry).val(planInfo.wait_dry_hr);
    $('#isLastPallet').prop('checked', planInfo.is_last_pallet === 'YES');
    $('#isSendOut').prop('checked', planInfo.is_send_out === 'YES');
    $('#editDate').text(planInfo.plan_date);
  }

  function clearPlanForm() {
    $('.planId').val(null).trigger('change.select2');
    $('.machineId').val(null).trigger('change.select2');
    $('.technicianId').val(null).trigger('change.select2');
    $('.palletType').val(null).trigger('change.select2');

    $('#jobId').val('');
    $('#jobQty').val('');
    $('#planDate').text('');
    $('#machineId').val('');
    $('#nextMachineId').val('');
    $('#processId').val('');
    $('#nextProcessId').val('');
    $('#zoneCode').val('');
    $('#nextZoneCode').val('');
    $('#sig').val('');
    $('#sigFolding').val('');
    $('#partName').val('');
    $('#qty').val('');
    $('#dryFinishTime').prop('checked', false);
    $('#waitDryHr').val('').prop('readonly', true);
    $('#isLastPallet').prop('checked', false);
    $('#isSendOut').prop('checked', false);
    $('#editDate').text('');
    $('#timesheetRemark').val('');
  }

  function setApproveButton() {
    const hasAccess = elementAccess('template', '4', 'APPROVE_LIST');
    if (!hasAccess) {
      $('.APPROVE_LIST').text('ACTION');
      $('.table-action-button button').removeClass('btn-success');
      $('.table-action-button button').addClass('btn-primary');
    }
  }

  async function finishDry() {
    try {
      const api = new Axios();
      await api.post(URL + '/api/v1/pl/finish_dry');
    } catch (err) {
      console.error('API Error:', err);
      Notification.error();
    }
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
      
      getDataAddForm() {
        const obj = {
          machine_id: String($('#machineId').attr('data-machine-id') || ''),
          next_machine_id: String($('#nextMachineId').attr('data-next-machine-id') || ''),
          plan_id: $('.planId').val(),
          plan_date: $('#planDate').text(),
          job_id: String($('#jobId').attr('data-job-id') || ''),
          job_qty: Number($('#jobQty').val().replace(/,/g, '')),
          part_name: $('#partName').val(),
          process_id: $('#processId').attr('data-process-id'),
          next_process_id: $('#nextProcessId').attr('data-next-process-id'),
          zone_code: $('#zoneCode').attr('data-zone-code') || '',
          next_zone_code: $('#nextZoneCode').attr('data-next-zone-code'),
          qty: Number($('#qty').val().replace(/,/g, '')),
          sig: $('#sig').val(),
          sig_folding: $('#sigFolding').val(),
          detail_sig_folding: $('#detailSigFolding').val(),
          pallet_type: $('.palletType').val(),
          technician_id: String($('.technicianId').val() || ''),
          is_last_pallet: $('#isLastPallet').is(':checked'),
          dry_finish_time: $('#dryFinishTime').is(':checked'),
          wait_dry_hr: $('#waitDryHr').val(),
          is_send_out: $('#isSendOut').is(':checked'),
          timesheet_remark: $('#timesheetRemark').val(),
          trim_detail: $('#trimDetail').val(),
          trim_size: $('#trimSize').val(),
          trim_height: $('#trimHeight').val(),
          trims: $('#trimData').val(),
        };
        dataObj = obj;
        console.log('obj' ,obj)
        return obj;
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
          pallet_number: $('.pallet_number').text(),
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
          is_send_out: raw.is_send_out ? 'YES' : 'NO',
          trim_height: parseInt(raw.trim_height) || 0,
        };
      },
      
      getDataAddFormNormalized() {
        const raw = this.getDataAddForm();
        let trimsArray = [];
        if (raw.trims) {
          try {
            trimsArray = JSON.parse(raw.trims);
          } catch (e) {
            console.warn('Parse trims failed, set empty array', e);
            trimsArray = [];
          }
        }

        const normalized = this.normalizeData({
          ...raw,
          trims: trimsArray
        });
        console.log(normalized);
        return normalized;
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
        $('.pallet_number').text(' (' + rowData.pallet_number + ' / ' + rowData.last_pallet_number + ')');
      }
    };
  })();