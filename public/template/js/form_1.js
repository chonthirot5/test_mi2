$(function () {
  $('#saveForm').on('click', async () => {
    const f = new Form({ formSelector: '.form' });
    const v = f.validateInput();
    if (!v) {
      console.error('error');
      return;
    }

    Axios.showLoadingModal();
    try {
      const res = await TEMPLATE_API.test();
      Notification.success();
      console.log(res);
    } catch (error) {
      Notification.error(error);
    } finally {
      Axios.hideLoading();
    }
  });

  Input.splitButtonDropdown({
    containerSelector: '#saveDropdownButton',
    importantItems: [
      { label: 'SAVE DRAFT', value: 'save_draft', id: 'save-draft', accessClass: 'SAVE-DRAFT' },
    ],
  });

  breadcrumb();

  $('#editDate').dateTimePicker({
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

  $('.select-product-name').dropdownSelect2({
    options: productNames,
    placeholder: 'Select Product Name',
  });

  const statusOptions = [
    { text: 'Delivered', value: 'delivered' },
    { text: 'Received', value: 'received' },
    { text: 'Processing', value: 'processing' },
    { text: 'In transit', value: 'in_transit' },
    { text: 'Shipped', value: 'shipped' },
    { text: 'Confirmed', value: 'confirmed' },
  ];

  $('.select-status').dropdownSelect2({
    options: statusOptions,
    placeholder: 'Select Status',
  });

  $('.myFileInput').fileUploadPopup({
    apiUrl: 'http://localhost:3001', // URL ของ API
    destination: 'inventory/uploads/zz',
    multiple: true,
    fieldName: 'xxx',
    onSuccess: function (files) {
      console.log(files);
    },
    onRemove: function (files) {
      console.log(files);
    },
    onError: function (error) {
      console.error(error);
    },
  });
});
