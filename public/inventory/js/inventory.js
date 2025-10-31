$(function () {
  Input.splitButtonDropdown({
    containerSelector: '#splitButtonDropdownTemplate',
    importantItems: [
      {
        icon: '<i class="fa-solid fa-star"></i>',
        label: 'reject',
        value: 'reject',
        id: 'i1',
        accessClass: 'REJECT',
      },
      {
        icon: '<i class="fa-solid fa-star"></i>',
        label: 'Important 2',
        value: 'important2',
        id: 'i2',
        accessClass: 'IMPORTANT-2',
      },
    ],
    normalItems: [
      {
        icon: '<i class="fa-solid fa-circle"></i>',
        label: 'Normal 1',
        value: 'normal1',
        id: 'n1',
        accessClass: 'NORMAL-1',
      },
      {
        icon: '<i class="fa-solid fa-circle"></i>',
        label: 'Normal 2',
        value: 'normal2',
        id: 'n2',
        accessClass: 'NORMAL-2',
      },
      {
        icon: '<i class="fa-solid fa-circle"></i>',
        label: 'Normal 3',
        value: 'normal3',
        id: 'n3',
        accessClass: 'NORMAL-3',
      },
    ],
  });

  Input.dropdownButton({
    containerSelector: '#dropdownButtonTemplate',
    items: [
      {
        icon: '<i class="fa-solid fa-1"></i>',
        label: 'Option 1',
        value: 'option1',
        id: 'o1',
        accessClass: 'OPTION-1',
      },
      {
        icon: '<i class="fa-solid fa-2"></i>',
        label: 'Option 2',
        value: 'option2',
        id: 'o2',
        accessClass: 'OPTION-2',
      },
      {
        icon: '<i class="fa-solid fa-3"></i>',
        label: 'Option 3',
        value: 'option3',
        id: 'o3',
        accessClass: 'OPTION-3',
      },
    ],
    isActionButton: true,
  });

  $('#applyBtn').on('click', () => {
    console.log(INVENTORY_SEARCH.getSearch('data'));
  });
});
