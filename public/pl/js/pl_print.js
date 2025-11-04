  $(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const palletCode = urlParams.get('pallet_code');
    console.log('palletCode' ,palletCode)
    if (!palletCode) return console.warn('No pallet code provided');

    try {
      // Axios.showLoadingModal();
      const [JOBS, MACHINES, ZONES, PROCESS, PALLET] = await Promise.all([
        PlPalletInstance.getSelectJobData(),
        PlMachineInstance.getSelectMachine(),
        PlZoneInstance.getSelectZone(),
        PlPalletInstance.getSelectProcess(),
        PlPalletInstance.getPalletOne({ pallet_code: palletCode })
      ]);

      const { success, data } = PALLET;
      if (!success || !data?.data?.[0]) {
        console.error('No pallet data found');
        palletData = await getFallbackData(palletCode);
      } else {
        const dataObj = data.data.map(p => ({
          ...p,
          job_name: JOBS?.data?.find(j => j.job_id === p.job_id)?.job_name || '',
          machine_name: MACHINES?.data?.data?.find(m => m.machine_id === p.machine_id)?.machine_name || '',
          next_machine_name: MACHINES?.data?.data?.find(m => m.machine_id === p.next_machine_id)?.machine_name || '',
          process_name: PROCESS?.data?.find(pr => pr.process_id === p.process_id)?.process_name || '',
          next_process_name: PROCESS?.data?.find(pr => pr.process_id === p.next_process_id)?.process_name || '',
          zone_name: ZONES?.data?.data?.find(z => z.zone_code === p.zone_code)?.zone_name || '',
          next_zone_name: ZONES?.data?.data?.find(z => z.zone_code === p.next_zone_code)?.zone_name || ''
        }));
        palletData = dataObj[0];
      }
      console.log('palletData' ,palletData)
      $('#pallet_code, #barcode_text').text(palletData.pallet_code);
      $('#pallet_number').text(palletData.pallet_number);
      $('#accumulate_qty').text(`${palletData.accumulate_qty || 0} / ${palletData.job_qty || 0}`);
      $('#job_id').text(palletData.job_id);
      /*if (palletData.created) {
        const [date, time] = palletData.created.split(' ');
        const [hour, minute] = time.split(':');
        const [year, month, day] = date.split('-');
        $('#production_date').text(`${day}/${month}/${year}`);
        $('#finish_time').text(`${hour}:${minute}`);
        $('#production_date').text(`${day}/${month}/${year}`);
        $('#finish_time').text(`${hour}:${minute}`);
      }*/
      $('#production_date').text(palletData.created.split(' ')[0]);
      $('#zone_code').text(palletData.zone_code);
      $('#job_name').text(palletData.job_name);
      $('#pallet_qty').text(palletData.qty);
      $('#part_name').text(palletData.part_name);
      $('#machine_name').text(palletData.machine_name);
      $('#process_name').text(palletData.process_name);
      $('#finish_time').text(palletData.created.split(' ')[1]);
      $('#sig').text(palletData.sig);
      $('#technician_id').text(palletData.technician_id || '-');
      $('#next_process_name').text(palletData.next_process_name);
      $('#detail_sig_folding').text(palletData.detail_sig_folding);
      $('#next_machine_name').text(palletData.next_machine_name);
      $('#next_zone_name').text(palletData.next_zone_name);
      /*if (palletData.dry_finish_time) {
        const [date, time] = palletData.dry_finish_time.split(' ');
        const [year, month, day] = date.split('-');
        $('#dry_finish_time').text(`${day}/${month}/${year} ${time}`);
      } else if (palletData.created) {
        const [date, time] = palletData.created.split(' ');
        const [year, month, day] = date.split('-');
        $('#dry_finish_time').text(`${day}/${month}/${year} ${time}`);
      }*/
      $('#dry_finish_time').text(palletData.dry_finish_time ? palletData.dry_finish_time : palletData.created);
      $('#timesheet_remark').text(palletData.timesheet_remark || '-');

      const typeColor = getPalletTypeBgColor(palletData.pallet_type);
      $('#pallet_type_cell').text(palletData.pallet_type).css('background-color', typeColor);

      const qc = getQCStatus(palletData.status);
      $('#qc_status_box').html(qc.text).css({
        'border-color': qc.color,
        'color': qc.color,
        'background-color': qc.bgColor
      });

      if (typeof JsBarcode !== 'undefined') {
        JsBarcode('#barcode', palletData.pallet_code, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: false,
          margin: 5
        });
      }

      $('#trim_detail').text(palletData.trim_detail || '-');
      $('#trim_size').text(palletData.trim_size || '-');
      $('.trim_height').text(palletData.trim_height || '-');
      const tbody = $('.pallet-table tbody');
      const trims = palletData.trims || [];
      const maxRows = 4;
      tbody.find('.trims-row').remove();
      if (trims.length > 0) {
          tbody.find('#no_trim_row').hide();
          for (let i = 0; i < maxRows; i++) {
              const trim = trims[i];
              const qty = trim ? trim.qty_paper : '-';
              const perQty = trim ? trim.paper_per_qty : '-';
              const row = `
                  <tr class="trims-row">
                      <td colspan="2"><span class="pallet-label">จำนวน(ก้อน)</span> <span class="pallet-data qty_paper">${qty}</span></td>
                      <td colspan="2"><span class="pallet-label">ก้อนละ(แผ่น)</span> <span class="pallet-data paper_per_qty">${perQty}</span></td>
                      <td colspan="2"></td>
                  </tr>
              `;
              tbody.append(row);
          }
      } else {
          tbody.find('#no_trim_row').show();
          tbody.find('.trim_row').hide();
      }

      const remarkRow = `
      <tr>
          <td colspan="6">
              <span class="pallet-label">หมายเหตุ</span> 
              <span class="pallet-data" id="timesheet_remark">${palletData.timesheet_remark || '-'}</span>
          </td>
      </tr>
      `;
      tbody.append(remarkRow);
    } catch (err) {
      console.error('Error loading pallet data:', err);
    } finally {
      Axios.hideLoading();
    }
  });

  function getPalletTypeBgColor(palletType) {
      switch (palletType) {
        case 'พาเลทตัวอย่าง': 
          return '#DB3D7B';
        case 'พาเลท NCR': 
          return '#FFDE2C';
        case 'Limit สีลูกค้า': 
          return '#FF0000';
        case 'พาเลท Quarantine': 
          return '#2894D4';
        case 'พาเลททั่วไป':
        default: 
          return '#CCCCCC';
      }
    }

  function getQCStatus(status) {
    const blueStatuses = ['INBOUND', 'OUTBOUND', 'USED', 'PASS', 'AUTO_PASS'];
    if (blueStatuses.includes(status)) {
      return { text: 'QC<br>Approve', color: '#0000FF', bgColor: 'transparent' };
    }
    return { text: 'QC<br>Pending', color: '#CCCCCC', bgColor: 'transparent' };
  }

  async function getFallbackData(code) {
    return {
      pallet_code: code || '-',
      pallet_number: '-',
      qty: '-',
      job_id: '-',
      job_name: '-',
      machine_name: '-',
      part_name: '-',
      process_name: '-',
      next_process_name: '-',
      zone_name: '-',
      next_zone_name: '-',
      pallet_type: '-',
      status: '-'
    };
  }