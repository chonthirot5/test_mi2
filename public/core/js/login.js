$(function () {
  isLogin ? (window.location.href = '/') : $('.login').removeClass('d-none');

  $(document).on('keydown', function (e) {
    if (e.key === 'Enter') {
      $('#login').click();
    }
  });

  $('#login').on('click', async () => {
    const f = new Form({ formSelector: '.login-form' });
    const v = f.validateInput();

    if (!v) {
      return;
    }

    // const data = {
    //   user_id: 11,
    //   user_name: 'BAITOEY',
    //   user_account: '2680016',
    //   emp_id: '2680016',
    //   status: 'ACTIVE',
    //   created: '2025-10-21T17:00:29.477Z',
    //   projects: [
    //     {
    //       project: 'COLOR_LIMIT',
    //       // roles: ['ADMIN', 'CREATOR', 'EDITOR'],
    //       // roles: ['ADMIN'],
    //       // roles: ['CREATOR'],
    //       roles: ['EDITOR'],
    //     },
    //     {
    //       project: 'HRM',
    //       roles: ['ADMIN'],
    //     },
    //     {
    //       project: 'INVENTORY',
    //       roles: ['ADMIN'],
    //     },
    //     {
    //       project: 'TEMPLATE',
    //       roles: ['ADMIN'],
    //     },
    //   ],
    // };
    // document.cookie = `userData=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${
    //   60 * 60 * 24 * 7
    // }; Secure; SameSite=Lax`;
    // const currentUser = JSON.parse(Cookies.get('userData') || null);
    // console.log('currentUser', currentUser);
    // window.location.href = '/';

    const api = new Axios({
      baseURL: `http://${API_CONFIG.URL}:${API_CONFIG.PORT}/api/v1/authen/`,
    });

    try {
      const res = await api.post('/login', {
        user_account: $('#username').val(),
        user_password: $('#password').val(),
      });
      if (res.data.success) {
        const data = JSON.stringify(res.data.data);
        document.cookie = `userData=${encodeURIComponent(data)}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=None`;
        window.location.href = '/';
      } else Notification.error('USERNAME หรือ PASSWORD ไม่ถูกต้อง');
    } catch (error) {
      console.error(error);
      Notification.error(error);
    }
  });
});
