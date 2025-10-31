$(function () {
  $('#flexSwitchCheckChecked').on('change', function () {
    if ($(this).is(':checked')) {
      $('.button .btn').removeClass('disabled');
      $('#switchCheckLabel').text('Active');
    } else {
      $('.button .btn').addClass('disabled');
      $('#switchCheckLabel').text('Disable');
    }
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

  Input.splitButtonDropdown({
    containerSelector: '#saveDropdownButton',
    importantItems: [
      { label: 'SAVE DRAFT', value: 'save_draft', id: 'save-draft', accessClass: 'SAVE-DRAFT' },
    ],
  });

  $('#save').off('click');
  $('#save').on('click', () => {
    Notification.success('SAVE');
    console.log(TEMPLATE_SEARCH.getSearch('data'));
  });

  $('#save-draft').on('click', () => {
    Notification.info('SAVE DRAFT');
  });

  const confirmModal = new ConfirmModal();
  confirmModal.onConfirm(async (isConfirm) => {
    if (isConfirm) {
      console.log('confirm delete');
      const api = new Axios();
      const c = await api.post('https://httpbin.org/post', { foo: 'bar' });
      console.log(c.data);
    } else console.log('cancel');
  });

  const confirmModalEl = new bootstrap.Modal(document.getElementById('confirmModal'), {
    backdrop: 'static',
    keyboard: false,
  });

  $('.DELETE').on('click', () => {
    confirmModalEl.show();
  });

  Input.splitButtonDropdown({
    containerSelector: '#splitButtonDropdownTemplate',
    importantItems: [
      {
        icon: '<i class="fa-solid fa-star"></i>',
        label: 'Important 1',
        value: 'important1',
        id: 'i1',
        accessClass: 'IMPORTANT-1',
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

  $('#approve-btn').on('click', () => {
    Notification.success();
    Notification.warning();
    Notification.error();
    Notification.info();
  });

  $('#i1').on('click', () => {
    Notification.info('Important1 clicked');
  });

  $('#n1').on('click', () => {
    Notification.info('Normal1 clicked');
  });

  Input.splitButtonDropdown({
    containerSelector: '#splitDeleteButton',
    importantItems: [
      {
        icon: '<i class="fa-solid fa-star"></i>',
        label: 'Delete 1',
        value: 'del1',
        id: 'd1',
        accessClass: 'DELETE-1',
      },
    ],
    normalItems: [
      {
        icon: '<i class="fa-solid fa-circle"></i>',
        label: 'Delete Normal 1',
        value: 'delNormal1',
        id: 'dn1',
        accessClass: 'DELETE-NORMAL-1',
      },
    ],
  });

  Input.splitButtonDropdown({
    containerSelector: '#splitPrimaryButton',
    importantItems: [
      {
        icon: '<i class="fa-solid fa-star"></i>',
        label: 'Primary 1',
        value: 'primary1',
        id: 'p1',
        accessClass: 'PRIMARY-1',
      },
    ],
    normalItems: [
      {
        icon: '<i class="fa-solid fa-circle"></i>',
        label: 'Primary Normal 1',
        value: 'primaryNormal1',
        id: 'pn1',
        accessClass: 'PRIMARY-NORMAL-1',
      },
    ],
  });

  $('.SUCCESS').on('click', () => {
    Alert.success({
      title: 'SUCCESS',
      // text: 'success',
      html: '<h1>SUCCESS</h1>',
    });
  });

  $('.WARNING').on('click', () => {
    Alert.warning({
      title: 'WARNING',
      // text: 'warning',
      html: '<h1>WARNING</h1>',
    });
  });

  $('.ERROR').on('click', () => {
    Alert.error({
      title: 'ERROR',
      // text: 'error',
      html: '<h1>ERROR</h1>',
    });
  });

  $('.INFO').on('click', () => {
    Alert.info({
      title: 'INFO',
      // text: 'info',
      html: '<h1>INFO</h1>',
    });

    // loadModuleContent({ moduleName: 'inventory', fileName: 'inventory' });
  });

  $('#confirmBtn').on('click', async () => {
    const api = new Axios();

    try {
      Axios.showLoadingModal();
      // Axios.showLoadingIcon();

      for (let i = 0; i < 3; i++) {
        Axios.modalContent = `<h4>Request #${i + 1}</h4>`;

        const res = await api.get('https://httpbin.org/delay/3');
        Notification.success();
      }

      Axios.hideLoading();
      Notification.success('All requests completed!');
    } catch (err) {
      console.error('API Error:', err);
      Axios.hideLoading();
      Alert.error({ title: 'An error occurred!' });
    }
  });

  $('#applyBtn').on('click', () => {
    window.location.href = '/view?module=template&file=view&folder=views';
    // window.location.href = '/view?module=template&file=report1&folder=views/report';
  });

  $('#save-btn').on('click', () => {
    window.open(`/view?module=template&file=print&folder=views/print`, '_blank');
  });
});
