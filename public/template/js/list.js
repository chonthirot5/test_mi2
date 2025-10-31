$(function () {
  $('#saveEditRow').on('click', async () => {
    const f = new Form({ formSelector: '.form' });
    const v = f.validateInput();
    if (!v) {
      return;
    }

    try {
      const api = new Axios();
      const response = await api.get('https://httpbin.org/delay/3');
      console.log(response.data);
      Notification.success();
    } catch (err) {
      console.error('API Error:', err);
      Notification.error();
    }
  });

  $('#addRowData').on('click', async () => {
    // Notification.success();
    // Notification.warning();
    // Notification.error();
    // Notification.info();

    // Alert.error({
    //   title: 'test',
    //   text: 'test error',
    //   confirmButtonText: 'close',
    // });

    const f = new Form({ formSelector: '#addForm' });
    const v = f.validateInput();
    if (!v) {
      return;
    }

    const api = new Axios();

    try {
      Axios.showLoadingModal();
      const response = await api.get('https://httpbin.org/delay/5');
      Notification.success();
    } catch (err) {
      console.error('API Error:', err);
      Notification.error();
    } finally {
      Axios.hideLoading();
    }
  });

  $('#addRow').on('click', function () {
    $('#addModal').modal('show');
  });

  $('#addRowData').on('click', function () {
    console.log('add');
  });

  $('.date-input').dateTimePicker({
    type: 'date',
    onChange: function (value) {
      console.log(value);
    },
  });

  const productNames = [
    { text: 'Laptop', value: 'laptop' },
    { text: 'Mouse', value: 'mouse' },
    { text: 'Keyboard', value: 'keyboard' },
    { text: 'Monitor', value: 'monitor' },
    { text: 'Tablet', value: 'tablet' },
    { text: 'Phone', value: 'phone' },
    { text: 'Headphones', value: 'headphones' },
    { text: 'Speaker', value: 'speaker' },
    { text: 'Wireless Microphone System', value: 'wireless-microphone-system' },
    {
      text: 'One for the Blackbird, One for the Crow',
      value: 'one-for-the-blackbird-one-for-the-crow',
    },
    { text: 'Ultrean 6 Quart Air Fryer', value: 'ultrean-6-quart-air-fryer' },
    { text: 'NETGEAR WiFi Range Extender', value: 'netgear-wifi-range-extender' },
    { text: "YTD Men's Short Sleeve Polo Shirt", value: 'ytd-mens-short-sleeve-polo-shirt' },
    { text: 'Sling Bag', value: 'sling-bag' },
    { text: 'Kantek Tablet Stand', value: 'kantek-tablet-stand' },
    { text: 'Cuisinart C55CNS-8CFP', value: 'cuisinart-c55cns-8cfp' },
    {
      text: 'Panasonic Noise Cancelling Over The Ear Headphones HeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphones',
      value: 'panasonic-noise-cancelling-over-the-ear-headphones-1',
    },
    {
      text: 'Panasonic Noise Cancelling Over The Ear Headphones',
      value: 'panasonic-noise-cancelling-over-the-ear-headphones-2',
    },
    { text: 'Magid GF18T Pesticide Glove', value: 'magid-gf18t-pesticide-glove' },
    { text: 'Ink+Ivy Alpine Cotton Duvet Cover', value: 'ink-ivy-alpine-cotton-duvet-cover' },
    { text: '12 Little Zoo Animals Toy Figure', value: '12-little-zoo-animals-toy-figure' },
  ];

  const productMap = {
    Laptop: 'laptop',
    Mouse: 'mouse',
    Keyboard: 'keyboard',
    Monitor: 'monitor',
    Tablet: 'tablet',
    Phone: 'phone',
    Headphones: 'headphones',
    Speaker: 'speaker',
    'Wireless Microphone System': 'wireless-microphone-system',
    'One for the Blackbird, One for the Crow': 'one-for-the-blackbird-one-for-the-crow',
    'Ultrean 6 Quart Air Fryer': 'ultrean-6-quart-air-fryer',
    'NETGEAR WiFi Range Extender': 'netgear-wifi-range-extender',
    "YTD Men's Short Sleeve Polo Shirt": 'ytd-mens-short-sleeve-polo-shirt',
    'Sling Bag': 'sling-bag',
    'Kantek Tablet Stand': 'kantek-tablet-stand',
    'Cuisinart C55CNS-8CFP': 'cuisinart-c55cns-8cfp',
    'Panasonic Noise Cancelling Over The Ear Headphones HeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphones':
      'panasonic-noise-cancelling-over-the-ear-headphones-1',
    'Panasonic Noise Cancelling Over The Ear Headphones':
      'panasonic-noise-cancelling-over-the-ear-headphones-2',
    'Magid GF18T Pesticide Glove': 'magid-gf18t-pesticide-glove',
    'Ink+Ivy Alpine Cotton Duvet Cover': 'ink-ivy-alpine-cotton-duvet-cover',
    '12 Little Zoo Animals Toy Figure': '12-little-zoo-animals-toy-figure',
  };

  $('.select-product-name').dropdownSelect2({
    options: productNames,
    placeholder: 'Select Product Name',
    allowSearch: true,
  });

  const statusOptions = [
    { text: 'Delivered', value: 'delivered' },
    { text: 'Received', value: 'received' },
    { text: 'Processing', value: 'processing' },
    { text: 'In transit', value: 'in_transit' },
    { text: 'Shipped', value: 'shipped' },
    { text: 'Confirmed', value: 'confirmed' },
  ];

  const statusMap = {
    Delivered: 'delivered',
    Received: 'received',
    Processing: 'processing',
    'In transit': 'in_transit',
    Shipped: 'shipped',
    Confirmed: 'confirmed',
  };

  $('.select-status').dropdownSelect2({
    options: statusOptions,
    placeholder: 'Select Status',
  });

  const showRowsInit = 50;
  let showRows = showRowsInit;

  const showRowsOptions = [
    { text: 'All', value: 'all' },
    { text: '25', value: 25 },
    { text: '50', value: 50 },
    { text: '100', value: 100 },
    { text: '300', value: 300 },
    { text: '500', value: 500 },
  ];

  $('#showRows').dropdownSelect2({
    options: showRowsOptions,
    selectedValue: showRowsInit,
    allowClear: false,
  });

  $('#showRows').on('change', function () {
    const selectedValue = $(this).val();
    showRows = selectedValue;
    myTable.rowsPerPage = showRows;
    myTable.goToPage(1);
  });

  const dataSource = async (page, pageSize) => {
    const api = new Axios();
    let response;
    try {
      Axios.showLoadingIcon();
      response = await api.get('/orders', { params: { page, pageSize } });
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error('API Error:', err);
      Notification.error();
    } finally {
      Axios.hideLoading();
    }
    return { data: response.data.data, total: response.data.totalRecords };
  };

  const myTable = new Table({
    dataSource: dataSource,
    columns: [
      {
        text: 'First Name',
        dataField: 'firstName',
        width: '10%',
        pinned: true,
        align: 'start',
        // hidden: true,
      },
      {
        text: 'Last Name',
        dataField: 'lastName',
        width: '10%',
        pinned: true,
        align: 'start',
      },
      {
        text: 'Order Date',
        dataField: 'date',
        columntype: 'datetimeinput',
        cellsformat: 'dd/MM/yyyy',
        width: '10%',
        filtertype: 'date',
        align: 'start',
      },
      {
        text: 'ชื่อผลิตภัณฑ์',
        dataField: 'productName',
        width: '35%',
        align: 'start',
        filtertype: 'list',
        optionValueMap: productMap,
      },
      {
        text: 'Price',
        dataField: 'price',
        width: '5%',
        cellsformat: 'c2',
        align: 'end',
        cellsalign: 'right',
      },
      {
        text: 'Quantity',
        dataField: 'quantity',
        width: '5%',
        align: 'end',
        cellsalign: 'right',
      },
      {
        text: 'Total',
        dataField: 'total',
        cellsformat: 'c2',
        width: '5%',
        align: 'end',
        cellsalign: 'right',
      },
      {
        text: 'Margin %',
        dataField: 'margin',
        cellsformat: 'c2',
        width: '5%',
        align: 'end',
        cellsalign: 'right',
      },
      {
        text: 'Profit',
        dataField: 'profit',
        cellsformat: 'c2',
        width: '5%',
        align: 'end',
        cellsalign: 'right',
      },
      {
        text: 'Status',
        dataField: 'status',
        width: '10%',
        align: 'center',
        editable: false,
        filtertype: 'list',
        cellsrenderer: function (_row, _columnfield, value) {
          let badgeClass = 'bg-secondary';
          if (value === 'Delivered') badgeClass = 'delivered';
          else if (value === 'Received') badgeClass = 'received';
          else if (value === 'Processing') badgeClass = 'processing';
          else if (value === 'In transit') badgeClass = 'in-transit';
          else if (value === 'Shipped') badgeClass = 'shipped';
          else if (value === 'Confirmed') badgeClass = 'confirmed';
          return `
                  <div class="status-container">
                    <span class="status-badge ${badgeClass}">
                      ${value}
                    </span>
                  </div>
                `;
        },
        optionValueMap: statusMap,
      },
    ],
    // groupable: true,
    // groups: ['productName'],
    // fieldId: 'firstName',
    dataFields: [
      { name: 'id', type: 'number' },
      { name: 'productName', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'quantity', type: 'number' },
      { name: 'firstName', type: 'string' },
      { name: 'lastName', type: 'string' },
      { name: 'total', type: 'number' },
      { name: 'date', type: 'string' },
      { name: 'margin', type: 'number' },
      { name: 'profit', type: 'number' },
      { name: 'status', type: 'string' },
    ],
    enableRowEdit: true,
    editModalId: 'editModal',
    onRowEdit: async (updatedData) => {
      console.log('Saving:', updatedData);
    },
    fieldMap: {
      date: '#editDate',
      status: '#editStatusDropdown',
      productName: '#editProductName',
    },
    rowsPerPage: showRows,
    // rowsPerPage: 25,
    // enablePagination:false,
    onRowDblClick: (rowData, rowIndex) => {
      console.log('Row double clicked:', rowData);
      console.log('Row index:', rowIndex);
      console.log($('#editQuantity').val());
    },
    // runningCol: true,
    // checkboxCol: false,
  });

  function search() {
    let status;
    let productNames = [];
    let startDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');

    $('#searchButton').on('click', () => {
      $('.search-list-expand').toggleClass('show');
    });

    $('#orderDate').dateTimePicker({
      type: 'range',
    });

    $('#orderDate').dateTimePicker('setDate', [startDate, endDate], true);

    Input.multiAutocomplete({
      containerSelector: '#searchProductName',
      items: [
        { label: 'Laptop', value: 'laptop' },
        { label: 'Mouse', value: 'mouse' },
        { label: 'Keyboard', value: 'keyboard' },
        { label: 'Monitor', value: 'monitor' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Phone', value: 'phone' },
        { label: 'Headphones', value: 'headphones' },
        { label: 'Speaker', value: 'speaker' },
        { label: 'Wireless Microphone System', value: 'wireless-microphone-system' },
        {
          label: 'One for the Blackbird, One for the Crow',
          value: 'one-for-the-blackbird-one-for-the-crow',
        },
        { label: 'Ultrean 6 Quart Air Fryer', value: 'ultrean-6-quart-air-fryer' },
        { label: 'NETGEAR WiFi Range Extender', value: 'netgear-wifi-range-extender' },
        { label: "YTD Men's Short Sleeve Polo Shirt", value: 'ytd-mens-short-sleeve-polo-shirt' },
        { label: 'Sling Bag', value: 'sling-bag' },
        { label: 'Kantek Tablet Stand', value: 'kantek-tablet-stand' },
        { label: 'Cuisinart C55CNS-8CFP', value: 'cuisinart-c55cns-8cfp' },
        {
          label:
            'Panasonic Noise Cancelling Over The Ear Headphones HeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphonesHeadphones',
          value: 'panasonic-noise-cancelling-over-the-ear-headphones-1',
        },
        {
          label: 'Panasonic Noise Cancelling Over The Ear Headphones',
          value: 'panasonic-noise-cancelling-over-the-ear-headphones-2',
        },
        { label: 'Magid GF18T Pesticide Glove', value: 'magid-gf18t-pesticide-glove' },
        { label: 'Ink+Ivy Alpine Cotton Duvet Cover', value: 'ink-ivy-alpine-cotton-duvet-cover' },
        { label: '12 Little Zoo Animals Toy Figure', value: '12-little-zoo-animals-toy-figure' },
      ],
      onChange: (value) => {
        TEMPLATE_SEARCH.setSearch('list', { productNames: value });
      },
    });

    const chipContainer = document.querySelector('.table-search-value');

    function getSelectedItems(searchObj) {
      const items = [];
      if (searchObj.orderDate) {
        items.push({
          label: `ORDER DATE: ${searchObj.orderDate}`,
          value: `orderDate:${searchObj.orderDate}`,
        });
      }
      if (searchObj.status) {
        items.push({ label: `STATUS: ${searchObj.status}`, value: `status:${searchObj.status}` });
      }
      if (searchObj.productNames?.length) {
        const product = searchObj.productNames.map((i) => i.label).join(', ');
        items.push({ label: `ชื่อผลิตภัณฑ์: ${product}`, value: `productNames:${product}` });
      }
      return items;
    }

    $('#applySearchButton').on('click', () => {
      const orderDate = $('#orderDate').dateTimePicker('getValue');
      status = $('#statusDropdownSearch').dropdownSelect2('getSelected')?.text;

      TEMPLATE_SEARCH.setSearch('list', { orderDate, status });
      const searchObj = TEMPLATE_SEARCH.getSearch('list');

      renderChips(chipContainer, getSelectedItems(searchObj), (updatedItems) => {
        const newOrderDate =
          updatedItems
            .find((i) => i.value.startsWith('orderDate:'))
            ?.label.replace('ORDER DATE: ', '') || '';
        const newStatus =
          updatedItems.find((i) => i.value.startsWith('status:'))?.label.replace('STATUS: ', '') ||
          '';
        const newProducts =
          updatedItems
            .find((i) => i.value.startsWith('productNames:'))
            ?.label.replace('ชื่อผลิตภัณฑ์: ', '')
            .split(', ')
            .map((label) => ({ label, value: label.toLowerCase() })) || [];

        TEMPLATE_SEARCH.setSearch('list', {
          orderDate: newOrderDate,
          status: newStatus,
          productNames: newProducts,
        });

        if (!updatedItems.find((i) => i.value.startsWith('orderDate:')))
          $('#orderDate').dateTimePicker('clear');
        if (!updatedItems.find((i) => i.value.startsWith('status:')))
          $('#statusDropdownSearch').dropdownSelect2('clear');
        if (!updatedItems.find((i) => i.value.startsWith('productNames:')))
          document.getElementById('searchProductName')._multiAutocomplete?.clear();

        console.log(TEMPLATE_SEARCH.getSearch('list'));
      });

      $('.search-list-expand').removeClass('show');
    });

    $('#clearSearchButton').on('click', () => {
      const startDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
      const endDate = moment().format('YYYY-MM-DD');
      $('#orderDate').dateTimePicker('setDate', [startDate, endDate], true);
      $('#statusDropdownSearch').dropdownSelect2('clear');
      document.getElementById('searchProductName')._multiAutocomplete?.clear();
      renderChips(chipContainer, []);
      TEMPLATE_SEARCH.setSearch('list', {
        orderDate: `${startDate} to ${endDate}`,
        status: '',
        productNames: [],
      });

      console.log(TEMPLATE_SEARCH.getSearch('list'));
    });

    $(document).on('click', (e) => {
      if (!$(e.target).closest('.search-list-container, .select2-container').length) {
        $('.search-list-expand').removeClass('show');
      }
    });
  }

  search();

  Input.dropdownButton({
    containerSelector: '#exportButtonGroup',
    items: [
      {
        icon: '<i class="fa-solid fa-file-pdf"></i>',
        label: 'Export as PDF',
        value: 'exportPDF',
        id: 'exportPdf',
        accessClass: 'EXPORT-PDF',
      },
      {
        icon: '<i class="fa-solid fa-file-excel"></i>',
        label: 'Export as Excel',
        value: 'exportExcel',
        id: 'exportExcel',
        accessClass: 'EXPORT-EXCEL',
      },
    ],
    isActionButton: true,
  });

  $('#exportPdf').on('click', () => {
    console.log('Export as PDF');
    console.log(TEMPLATE_SEARCH.getSearch('list'));
  });

  $('#exportExcel').on('click', () => {
    console.log('Export as Excel');
  });

  Input.splitButtonDropdown({
    containerSelector: '#actionButtonGroup',
    importantItems: [
      {
        label: '<span class="REJECT">REJECT</span>',
        value: 'reject',
        id: 'reject',
        accessClass: 'REJECT',
      },
    ],
    normalItems: [
      {
        label: '<span class="DELETE">DELETE</span>',
        value: 'delete',
        id: 'delete',
        accessClass: 'DELETE',
      },
      {
        label: '<span class="CANCEL">CANCEL</span>',
        value: 'cancel',
        id: 'cancel',
        accessClass: 'CANCEL',
      },
    ],
    moduleName: 'template',
    menuId: '4',
  });

  $('#approve').on('click', async () => {
    console.log('getSelectedRows', myTable.getSelectedRows());
    console.log('getSelectedRowData', myTable.getSelectedRowData());

    const api = new Axios();
    const response = await api.get('https://httpbin.org/delay/12');
    console.log(response);
  });

  $('.table-action').on('click', '#reject', async (e) => {
    e.preventDefault();

    const confirmModal = new ConfirmModal({
      confirmHeader: 'CONFIRM REJECT',
      confirmMessage: 'Are you sure you want to reject?',
    });
    const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModalEl.show();

    console.log('getSelectedRows', myTable.getSelectedRows());
    console.log('getSelectedRowData', myTable.getSelectedRowData());

    confirmModal.onConfirm(async (isConfirm) => {
      if (!isConfirm) {
        console.log('cancel');
        return;
      }

      try {
        const api = new Axios();
        const response = await api.get('https://httpbin.org/delay/12');
        console.log('Reject success:', response.data);
        confirmModalEl.hide();
      } catch (err) {
        console.error('Reject failed:', err);
      }
    });
  });

  $('.table-action').on('click', '#delete', async (e) => {
    e.preventDefault();

    const confirmModal = new ConfirmModal({
      confirmHeader: 'CONFIRM DELETE',
      confirmMessage: 'Are you sure you want to delete?',
    });
    const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModalEl.show();

    confirmModal.onConfirm(async (isConfirm) => {
      if (!isConfirm) {
        console.log('cancel');
        return;
      }

      try {
        const api = new Axios();
        const response = await api.get('https://httpbin.org/delay/12');
        console.log('Delete success:', response.data);
        confirmModalEl.hide();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    });
  });

  $('.table-action').on('click', '#cancel', async (e) => {
    e.preventDefault();

    const confirmModal = new ConfirmModal({
      confirmHeader: 'CONFIRM CANCEL',
      confirmMessage: 'Are you sure you want to cancel?',
    });
    const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModalEl.show();

    confirmModal.onConfirm(async (isConfirm) => {
      if (!isConfirm) {
        console.log('cancel');
        return;
      }

      try {
        const api = new Axios();
        const response = await api.get('https://httpbin.org/delay/12');
        console.log('Cancel success:', response.data);
        confirmModalEl.hide();
      } catch (err) {
        console.error('Cancel failed:', err);
      }
    });
  });

  function setApproveButton() {
    const hasAccess = elementAccess('template', '4', 'APPROVE_LIST');
    if (!hasAccess) {
      $('.APPROVE_LIST').text('ACTION');
      $('.table-action-button button').removeClass('btn-success');
      $('.table-action-button button').addClass('btn-primary');
    }
  }

  setApproveButton();
});
