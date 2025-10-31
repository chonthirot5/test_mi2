$(function () {
  const tel = Input.telInput('#telInput');

  $('#saveForm').on('click', async () => {
    const f = new Form({ formSelector: '.form' });
    const v = f.validateInput();
    if (!v) {
      return;
    }

    console.log('formExtractor.getData()', f.getData());

    try {
      const api = new Axios();
      const response = await api.get('https://httpbin.org/delay/12');
      console.log(response.data);
      Notification.success();
    } catch (err) {
      console.error('API Error:', err);
      Notification.error();
    }
  });

  $('.edit-date').dateTimePicker({
    type: 'date',
    onChange: function (dateStr, selectedDates, instance) {
      console.log(dateStr, selectedDates, instance);
    },
  });
  $('#editTime').dateTimePicker({ type: 'time' });
  $('#editDateTime').dateTimePicker({ type: 'datetime' });
  $('#editDateRange').dateTimePicker({
    type: 'range',
    onChange: function (dateStr, selectedDates, instance) {
      console.log(dateStr, selectedDates, instance);
    },
  });

  Input.multiAutocomplete({
    containerSelector: '#multiAutocompleteTemplate',
    items: [
      { label: 'Option1', value: 'option1' },
      { label: 'Option2', value: 'option2' },
      { label: 'Option3', value: 'option3' },
      { label: 'Option4', value: 'option4' },
      { label: 'Option5', value: 'option5' },
    ],
    onChange: (item) => console.log('multiAutocompleteTemplate', item),
  });

  const states = [
    { value: 'AL', text: 'Alabama' },
    { value: 'WY', text: 'Wyoming' },
    { value: 'NY', text: 'New York' },
    {
      group: 'Group Name',
      items: [
        { text: 'Nested option 1', value: 'nested1' },
        { text: 'Nested option 2', value: 'nested2' },
      ],
    },
  ];

  $('.dropdown-select2').dropdownSelect2({
    options: states, // required
    placeholder: 'Select',
    allowClear: true,
    // selectedValue: 'WY',
    allowSearch: true,
    onSelect: (selected) => {
      console.log('onSelect', selected);
    },
    onClear: (cleared) => {
      console.log('onClear', cleared);
    },
  });

  $('.file-upload').fileUploadPopup({
    apiUrl: TEMPLATE_API.uploadUrl,
    destination: TEMPLATE_API.fileDestination,
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
