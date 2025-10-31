$(function () {
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

  function initDropdown($el) {
    $el.dropdownSelect2({
      options: states,
      allowSearch: true,
      allowClear: true,
      onSelect: (selected) => console.log('onSelect', selected),
      onClear: (cleared) => console.log('onClear', cleared),
    });
  }

  $('#table tbody tr:first .dropdown-select2').each(function () {
    initDropdown($(this));
  });

  // $('#add')
  //   .off('click')
  //   .on('click', function () {
  //     const $firstRow = $('#table tbody tr:first');

  //     // $firstRow.find('.dropdown-select2').each(function () {
  //     //   $(this).dropdownSelect2('destroy');
  //     // });

  //     const $newRow = $firstRow.clone();

  //     $newRow.find('input').val('');
  //     $newRow.find('select').val('');

  //     $newRow.find('.select2-container').remove();
  //     $newRow.find('.dropdown-select2').removeClass('select2-hidden-accessible');

  //     $('#table tbody').append($newRow);

  //     $newRow.find('.dropdown-select2').each(function () {
  //       initDropdown($(this));
  //     });

  //     // $firstRow.find('.dropdown-select2').each(function () {
  //     //   initDropdown($(this));
  //     // });

  //     initDefault();
  //   });

  $('#add')
    .off('click')
    .on('click', function () {
      const $firstRow = $('#table tbody tr:first');

      $firstRow.find('.dropdown-select2').each(function () {
        $(this).dropdownSelect2('destroy');
      });

      const $newRow = $firstRow.clone();

      $newRow.find('input').val('');
      $newRow.find('select').val('');

      $newRow.find('.select2-container').remove();
      $newRow.find('.dropdown-select2').removeClass('select2-hidden-accessible');

      $('#table tbody').append($newRow);

      $firstRow.find('.dropdown-select2').each(function () {
        initDropdown($(this));
      });

      $newRow.find('.dropdown-select2').each(function () {
        initDropdown($(this));
      });

      initDefault();
    });

  $(document).on('click', '.DELETE', function () {
    $(this).closest('tr').remove();
  });

  $('#save-btn').on('click', function () {
    const f = new Form({ formSelector: '#table' });
    const v = f.validateInput();

    if (!v) {
      console.error('error');
      return;
    }

    console.log('success');
  });

  $('table').on('input', '.edit-number', function () {
    const value = $(this).val();
    $(this).closest('tr').find('.copy-number').val(value).trigger('set');
  });
});
