$(function () {
  if (isLogin) {
    // navbarRight.innerHTML = `
    //                           <div class="navbar-noti">
    //                             <div class="noti">
    //                               <button type="button" class="noti-trigger btn btn-light" id="actionTrigger">
    //                                 <i class="fa-solid fa-check-to-slot"></i>
    //                                 <span class="badge rounded-pill bg-danger noti-count" id="actionCount"></span>
    //                               </button>
    //                               <div class="noti-detail" id="actionDetails">
    //                                 <div class="noti-detail-header">
    //                                   <div class="filter-container" id="actionFilter"></div>
    //                                 </div>
    //                                 <hr />
    //                                 <div class="noti-detail-body" id="actionDetail"></div>
    //                               </div>
    //                             </div>
    //                           </div>
    //                           <div class="navbar-noti">
    //                             <div class="noti">
    //                               <button type="button" class="noti-trigger btn btn-light" id="notiTrigger">
    //                                 <i class="fa fa-bell"></i>
    //                                 <span class="badge rounded-pill bg-warning noti-count" id="notiCount"></span>
    //                               </button>
    //                               <div class="noti-detail" id="notiDetails">
    //                                 <div class="noti-detail-header">
    //                                   <div class="filter-container" id="notiFilter"></div>
    //                                   <div class="noti-action-btn">
    //                                     <button type="button" class="btn btn-sm btn-link" id="clearNoti">
    //                                       Clear all
    //                                     </button>
    //                                   </div>
    //                                 </div>
    //                                 <hr />
    //                                 <div class="noti-detail-body" id="notiDetail"></div>
    //                               </div>
    //                             </div>
    //                           </div>
    //                           <div class="navbar-user">
    //                             <div class="profile-dropdown">
    //                               <button class="profile-trigger" id="profileTrigger">
    //                                 <i class="fa fa-user"></i>
    //                                 <span></span>
    //                                 <i class="fa fa-caret-down"></i>
    //                               </button>
    //                               <div class="profile-dropdown-menu" id="profileMenu">
    //                                 <button class="dropdown-item" id="changePassword">
    //                                   <i class="fas fa-key"></i>
    //                                   <span>Change Password</span>
    //                                 </button>
    //                                 <hr />
    //                                 <button class="dropdown-item logout" id="logout">
    //                                   <i class="fas fa-sign-out-alt"></i>
    //                                   <span>Logout</span>
    //                                 </button>
    //                               </div>
    //                             </div>
    //                           </div>
    //                         `;
    navbarRight.innerHTML = `
                              <div class="navbar-user">
                                <div class="profile-dropdown">
                                  <button class="profile-trigger" id="profileTrigger">
                                    <i class="fa fa-user"></i>
                                    <span></span>
                                    <i class="fa fa-caret-down"></i>
                                  </button>
                                  <div class="profile-dropdown-menu" id="profileMenu">
                                    <button class="dropdown-item logout" id="logout">
                                      <i class="fas fa-sign-out-alt"></i>
                                      <span>Logout</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            `;
  } else {
    navbarRight.innerHTML = `<button type="button" id="goToLogin" class="btn btn-primary">LOGIN</button>`;
  }

  $('#menuToggle').on('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modulesPopup'));
    modal.show();
  });

  $('#moduleGrid').on('click', '#moduleCard', async function () {
    const moduleName = $(this).data('module');
    if (moduleName) {
      await loadClassScripts(moduleName);
      loadModuleFromConfig(moduleName);

      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modulesPopup'));
      modalInstance.hide();
    }
  });

  $('#profileTrigger').on('click', function (e) {
    e.stopPropagation();
    $('.noti-detail').removeClass('show');
    $('.profile-dropdown-menu').toggleClass('show');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.profile-dropdown').length) {
      $('.profile-dropdown-menu').removeClass('show');
    }

    if (!$(e.target).closest('.noti-detail').length) {
      $('.noti-detail').removeClass('show');
    }
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('.profile-dropdown-menu').removeClass('show');
      $('.noti-detail').removeClass('show');
    }
  });

  $('#moduleGrid').on('click', '#moduleLink', async function (e) {
    e.stopPropagation();
    e.preventDefault();

    const href = $(this).attr('href');
    const menuPath = $(this).data('menu-path');

    const urlInfo = parseUrl(href);

    if (!urlInfo) return;

    const { module } = urlInfo;

    if (module) {
      await loadClassScripts(module);
      loadModuleConfig(module, (moduleConfig) => {
        const foundItem = findMenuByPath(moduleConfig, urlInfo.menuPath);

        if (foundItem) {
          const menuFile = foundItem.item.menuFile;
          const menuId = foundItem.item.menuId;

          $('#moduleName').text(moduleConfig.moduleTitle);
          const navbarHTML = renderNavbar(moduleConfig.menus, module);
          $('#navbarMenu').html(navbarHTML);
          initializeNavbarEvents();

          const selector = `[data-menu-path="${menuPath}"]`;
          const matchingElement = $(selector);
          if (matchingElement.length > 0) {
            setActiveMenu(matchingElement);
          }

          if (menuFile && menuFile !== 'undefined') {
            loadModuleContent({
              moduleName: module,
              fileName: menuFile,
              callback: () => {
                const modalInstance = bootstrap.Modal.getInstance(
                  document.getElementById('modulesPopup')
                );
                if (modalInstance) modalInstance.hide();
              },
              menuId,
            });
          } else {
            const modalInstance = bootstrap.Modal.getInstance(
              document.getElementById('modulesPopup')
            );
            if (modalInstance) modalInstance.hide();
          }

          window.history.pushState({ module, path: urlInfo.menuPath }, '', href);
        } else {
          console.warn('Menu item not found:', urlInfo.menuPath);
        }
      });
    }
  });

  $('#notiTrigger').on('click', function (e) {
    e.stopPropagation();
    $('.profile-dropdown-menu').removeClass('show');
    $('#actionDetails').removeClass('show');
    $('#notiDetails').toggleClass('show');
  });

  $('#actionTrigger').on('click', function (e) {
    e.stopPropagation();
    $('.profile-dropdown-menu').removeClass('show');
    $('#notiDetails').removeClass('show');
    $('#actionDetails').toggleClass('show');
  });

  function loadModuleFromConfig(moduleName) {
    loadModuleConfig(moduleName, (moduleConfig) => {
      if (!moduleAccess(moduleName, moduleConfig)) {
        console.warn(`Access denied to module: ${moduleName}`);
        isLogin ? (window.location.href = '/') : (window.location.href = '/login');
        return;
      }

      $('#moduleName').text(moduleConfig.moduleTitle);
      const navbarHTML = renderNavbar(moduleConfig.menus, moduleName);
      $('#navbarMenu').html(navbarHTML);

      initializeNavbarEvents();
      const welcomeMenu = moduleConfig.menus.find(
        (m) => m.menuId === moduleConfig.welcomeMenuId || m.menuId == moduleConfig.welcomeMenuId
      );

      if (welcomeMenu) {
        const welcomeUrl = buildUrl(moduleName, welcomeMenu.menuId);
        const currentMenuId = getCurrentMenuId(moduleName, welcomeMenu.menuId);
        loadModuleContent({
          moduleName,
          fileName: welcomeMenu.menuFile,
          callback: () => {
            const welcomeElement = $(`[data-menu-path="${welcomeMenu.menuId}"]`);
            if (welcomeElement.length > 0) {
              setActiveMenu(welcomeElement);
            }
          },
          menuId: currentMenuId,
        });

        window.history.pushState(
          { module: moduleName, path: [welcomeMenu.menuId] },
          '',
          welcomeUrl
        );
      }

      $('#modulesPopup').removeClass('show');
    });
  }

  window.addEventListener('popstate', function (event) {
    if (event.state && event.state.module) {
      loadModuleFromConfig(event.state.module);
    }
  });

  async function handleInitialUrl() {
    const currentPath = window.location.pathname;

    if (currentPath === '/' || currentPath === '') {
      $('.navbar').removeClass('d-none');
      return;
    }

    const isDynamic = currentPath.startsWith('/view');
    if (isDynamic) {
      loadDynamicPageFromUrl();
      return;
    }

    const urlInfo = parseUrl(currentPath);

    if (urlInfo && urlInfo.module) {
      await loadClassScripts(urlInfo.module);
      loadModuleConfig(urlInfo.module, (moduleConfig) => {
        if (!moduleAccess(urlInfo.module, moduleConfig)) {
          console.warn(`Access denied to module: ${urlInfo.module}`);
          isLogin ? (window.location.href = '/') : (window.location.href = '/login');
          return;
        }

        $('#moduleName').text(moduleConfig.moduleTitle);
        const navbarHTML = renderNavbar(moduleConfig.menus, urlInfo.module);
        $('#navbarMenu').html(navbarHTML);
        initializeNavbarEvents();

        const foundItem = findMenuByPath(moduleConfig, urlInfo.menuPath);
        if (foundItem && foundItem.item.menuFile && foundItem.item.menuFile !== 'undefined') {
          const menuPath = urlInfo.menuPath.join('/');
          const pathParts = urlInfo.menuPath;

          let hasPageAccess = false;

          if (pathParts.length === 1) {
            hasPageAccess = pageAccess(urlInfo.module, pathParts[0]);
          } else if (pathParts.length === 2) {
            hasPageAccess = pageAccess(urlInfo.module, pathParts[1]);
          } else if (pathParts.length === 3) {
            hasPageAccess = pageAccess(urlInfo.module, pathParts[2]);
          }

          if (!hasPageAccess) {
            console.warn(`Access denied to page: ${menuPath}`);
            isLogin ? (window.location.href = '/') : (window.location.href = '/login');
            return;
          }

          const matchingElement = $(`[data-menu-path="${menuPath}"]`);
          if (matchingElement.length > 0) {
            setActiveMenu(matchingElement);
          }

          const currentMenuId = getCurrentMenuId(urlInfo.module, menuPath);
          loadModuleContent({
            moduleName: urlInfo.module,
            fileName: foundItem.item.menuFile,
            menuId: currentMenuId,
          });
          $('.navbar').removeClass('d-none');
        } else {
          const welcomeMenu = moduleConfig.menus.find(
            (m) => m.menuId === moduleConfig.welcomeMenuId || m.menuId == moduleConfig.welcomeMenuId
          );
          if (welcomeMenu && welcomeMenu.menuFile) {
            if (!pageAccess(urlInfo.module, welcomeMenu.menuId)) {
              console.warn(`Access denied to welcome page: ${welcomeMenu.menuId}`);
              isLogin ? (window.location.href = '/') : (window.location.href = '/login');
              return;
            }

            const currentMenuId = getCurrentMenuId(urlInfo.module, welcomeMenu.menuId);
            loadModuleContent({
              moduleName: urlInfo.module,
              fileName: welcomeMenu.menuFile,
              menuId: currentMenuId,
            });
            $('.navbar').removeClass('d-none');

            const welcomeElement = $(`[data-menu-path="${welcomeMenu.menuId}"]`);
            if (welcomeElement.length > 0) {
              setActiveMenu(welcomeElement);
            }
            const welcomeUrl = buildUrl(urlInfo.module, welcomeMenu.menuId);
            window.history.replaceState(
              { module: urlInfo.module, path: [welcomeMenu.menuId] },
              '',
              welcomeUrl
            );
          } else {
            console.warn('No accessible welcome page found');
            isLogin ? (window.location.href = '/') : (window.location.href = '/login');
          }
        }
      });
    }
  }

  async function initializeModules() {
    const moduleGrid = $('#moduleGrid');

    const config = await $.getJSON('/core/index.json');
    modules = [];

    for (const mod of config.modules) {
      try {
        const moduleData = await $.getJSON(`/${mod}/${mod}.json`);
        modules.push({ name: mod, ...moduleData });

        try {
          const roleData = await $.getJSON(`/${mod}/role.json`);
          roleConfigs[mod] = roleData;
        } catch (err) {
          console.warn(`No role.json for module ${mod}`, err);
        }
      } catch (err) {
        console.warn(`Failed to load module ${mod}`, err);
      }
    }

    await loadModuleCards(moduleGrid);
  }

  function handleNotification(currentFilter) {
    const notifications = [
      {
        id: 1,
        title: 'อนุมัติใบลา',
        datetime: '20251108 16:58',
        category: 'hrm',
        description: 'นาย A ขออนุมัติลากิจ',
        isRead: false,
      },
      {
        id: 2,
        title: 'แจ้งเตือนสินค้า',
        datetime: '20251108 17:00',
        category: 'inventory',
        description: 'สินค้าใกล้หมด',
        isRead: true,
      },
      {
        id: 3,
        title: 'อนุมัติใบลา',
        datetime: '20251108 16:58',
        category: 'hrm',
        description: 'นาย B ขออนุมัติลากิจ',
        isRead: true,
      },
      {
        id: 4,
        title: 'แจ้งเตือนระบบ',
        datetime: '20251108 18:10',
        category: 'it',
        description: 'Server ใกล้เต็ม',
        isRead: false,
      },
      {
        id: 5,
        title: 'แจ้งเตือนลูกค้า',
        datetime: '20251108 12:30',
        category: 'crm',
        description: 'ลูกค้าใหม่ลงทะเบียน',
        isRead: true,
      },
      {
        id: 6,
        title: 'รายงานการขาย',
        datetime: '20251108 14:20',
        category: 'sales',
        description: 'ยอดขายประจำวัน',
        isRead: false,
      },
      {
        id: 7,
        title: 'แจ้งเตือนจัดซื้อ',
        datetime: '20251108 15:50',
        category: 'procurement',
        description: 'คำสั่งซื้อรออนุมัติ',
        isRead: false,
      },
      {
        id: 8,
        title: 'แจ้งเตือนบัญชี',
        datetime: '20251108 09:40',
        category: 'accounting',
        description: 'รายงานค่าใช้จ่าย',
        isRead: true,
      },
      {
        id: 9,
        title: 'แจ้งเตือนการตลาด',
        datetime: '20251108 11:15',
        category: 'marketing',
        description: 'แคมเปญใหม่เริ่มแล้ว',
        isRead: false,
      },
      {
        id: 10,
        title: 'แจ้งเตือนคุณภาพ',
        datetime: '20251108 10:05',
        category: 'quality',
        description: 'ตรวจสอบสินค้าเสร็จ',
        isRead: true,
      },
      {
        id: 11,
        title: 'แจ้งเตือนฝ่ายกฎหมาย',
        datetime: '20251108 13:25',
        category: 'legal',
        description: 'เอกสารสัญญาต้องตรวจ',
        isRead: false,
      },
      {
        id: 12,
        title: 'แจ้งเตือนฝ่ายบุคคล',
        datetime: '20251108 16:40',
        category: 'hrm',
        description: 'พนักงานใหม่เริ่มงาน',
        isRead: true,
      },
      {
        id: 13,
        title: 'แจ้งเตือนคลังสินค้า',
        datetime: '20251108 17:30',
        category: 'inventory',
        description: 'สินค้าเข้าคลังแล้ว',
        isRead: false,
      },
      {
        id: 14,
        title: 'แจ้งเตือนฝ่าย IT',
        datetime: '20251108 18:45',
        category: 'it',
        description: 'Software อัปเดตสำเร็จ',
        isRead: true,
      },
      {
        id: 15,
        title: 'แจ้งเตือนฝ่ายขาย',
        datetime: '20251108 19:00',
        category: 'sales',
        description: 'ลูกค้าสนใจสินค้าใหม่',
        isRead: false,
      },
    ];
    let unreadNoti = notifications.filter((noti) => noti.isRead === false);

    function updateNotiCount() {
      const unreadCount = unreadNoti.filter((n) => !n.isRead).length;
      $('#notiCount').text(unreadCount > 99 ? '99+' : unreadCount);
      if (unreadCount === 0) {
        $('#notiCount').hide();
      } else {
        $('#notiCount').show();
      }
    }

    let initialCategoryOrder = [];
    function renderFilterButtons() {
      const filterContainer = $('#notiFilter');
      filterContainer.empty();

      if (initialCategoryOrder.length === 0) {
        const categories = [...new Set(unreadNoti.map((n) => n.category))];
        initialCategoryOrder = ['all', ...categories];
      }

      initialCategoryOrder.forEach((cat) => {
        const count =
          cat === 'all' ? unreadNoti.length : unreadNoti.filter((n) => n.category === cat).length;

        if (count > 0 || cat === 'all') {
          filterContainer.append(`
                                  <button 
                                    class="btn btn-sm btn-outline-secondary filter-btn
                                     ${currentFilter === cat ? 'active' : ''}" 
                                    data-filter="${cat}"
                                  >
                                    ${cat}
                                  </button>
                                `);
        }
      });
    }

    function renderNotifications() {
      const container = $('#notiDetail');
      container.empty();

      let filteredNoti =
        currentFilter === 'all'
          ? unreadNoti
          : unreadNoti.filter((n) => n.category === currentFilter);

      filteredNoti.sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead - b.isRead;
        } else {
          return b.datetime.localeCompare(a.datetime);
        }
      });

      filteredNoti.forEach((noti, index) => {
        const isLast = index === filteredNoti.length - 1;

        container.append(`
                          <div class="noti-list" data-id="${noti.id}">
                            <div class="status-dot noti"></div>
                            <div class="noti-list-detail">
                              <div class="noti-list-detail-header">
                                <h5>${noti.title}</h5>
                                <p class="noti-datetime">${noti.datetime}</p>
                                <button 
                                  class="btn btn-sm btn-outline-secondary btn-sm category-btn" 
                                  data-category="${noti.category}"
                                >
                                  ${noti.category}
                                </button>
                              </div>
                              <p class="noti-description">${noti.description}</p>
                            </div>
                            <div class="button-group button-group-icon">
                              <button type="button" class="btn btn-sm btn-icon secondary" id="deleteNoti">
                                <i class="fa fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          ${!isLast ? '<hr />' : ''}
                        `);
      });

      if (filteredNoti.length === 0) {
        container.append(`<p class="text-center text-muted">No notifications</p>`);
      }

      updateActionButtonsVisibility();
      updateNotiCount();
    }

    function updateActionButtonsVisibility() {
      let hasNotifications;

      if (currentFilter === 'all') {
        hasNotifications = unreadNoti.length > 0;
      } else {
        const categoryNotifications = unreadNoti.filter((n) => n.category === currentFilter);
        hasNotifications = categoryNotifications.length > 0;
      }

      const clearAllText = currentFilter === 'all' ? 'Clear all' : `Clear all ${currentFilter}`;

      $('#clearNoti').text(clearAllText.toUpperCase());

      if (hasNotifications) {
        $('#clearNoti').show();
      } else {
        $('#clearNoti').hide();
      }
    }

    $(document).on('click', '.filter-btn', function () {
      currentFilter = $(this).data('filter');
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
      renderNotifications();
    });

    $(document).on('click', '#deleteNoti', function (e) {
      e.stopPropagation();
      const noti = $(this).closest('.noti-list');
      const id = noti.data('id');
      unreadNoti = unreadNoti.filter((n) => n.id !== id);
      renderFilterButtons();
      renderNotifications();
    });

    $(document).on('click', '.category-btn', function (e) {
      e.stopPropagation();
      const category = $(this).data('category');
      currentFilter = category;

      $('.filter-btn').removeClass('active');
      $(`.filter-btn[data-filter="${category}"]`).addClass('active');

      renderNotifications();
    });

    $(document).on('click', '#clearNoti', function (e) {
      e.stopPropagation();

      if (currentFilter === 'all') {
        unreadNoti = [];
      } else {
        unreadNoti = unreadNoti.filter((n) => n.category !== currentFilter);
        currentFilter = 'all';
      }

      renderFilterButtons();
      renderNotifications();
    });

    renderFilterButtons();
    renderNotifications();
    updateNotiCount();
  }

  function handleActionNoti(currentFilter) {
    const notifications = [
      {
        id: 1,
        title: 'อนุมัติใบลา',
        datetime: '20251108 16:58',
        category: 'hrm',
        description: 'นาย A ขออนุมัติลากิจ',
        isRead: false,
      },
      {
        id: 2,
        title: 'แจ้งเตือนสินค้า',
        datetime: '20251108 17:00',
        category: 'inventory',
        description: 'สินค้าใกล้หมด',
        isRead: true,
      },
      {
        id: 3,
        title: 'อนุมัติใบลา',
        datetime: '20251108 16:58',
        category: 'hrm',
        description: 'นาย B ขออนุมัติลากิจ',
        isRead: true,
      },
      {
        id: 4,
        title: 'แจ้งเตือนระบบ',
        datetime: '20251108 18:10',
        category: 'it',
        description: 'Server ใกล้เต็ม',
        isRead: false,
      },
      {
        id: 5,
        title: 'แจ้งเตือนลูกค้า',
        datetime: '20251108 12:30',
        category: 'crm',
        description: 'ลูกค้าใหม่ลงทะเบียน',
        isRead: true,
      },
      {
        id: 6,
        title: 'รายงานการขาย',
        datetime: '20251108 14:20',
        category: 'sales',
        description: 'ยอดขายประจำวัน',
        isRead: false,
      },
      {
        id: 7,
        title: 'แจ้งเตือนจัดซื้อ',
        datetime: '20251108 15:50',
        category: 'procurement',
        description: 'คำสั่งซื้อรออนุมัติ',
        isRead: false,
      },
      {
        id: 8,
        title: 'แจ้งเตือนบัญชี',
        datetime: '20251108 09:40',
        category: 'accounting',
        description: 'รายงานค่าใช้จ่าย',
        isRead: true,
      },
      {
        id: 9,
        title: 'แจ้งเตือนการตลาด',
        datetime: '20251108 11:15',
        category: 'marketing',
        description: 'แคมเปญใหม่เริ่มแล้ว',
        isRead: false,
      },
      {
        id: 10,
        title: 'แจ้งเตือนคุณภาพ',
        datetime: '20251108 10:05',
        category: 'quality',
        description: 'ตรวจสอบสินค้าเสร็จ',
        isRead: true,
      },
      {
        id: 11,
        title: 'แจ้งเตือนฝ่ายกฎหมาย',
        datetime: '20251108 13:25',
        category: 'legal',
        description: 'เอกสารสัญญาต้องตรวจ',
        isRead: false,
      },
      {
        id: 12,
        title: 'แจ้งเตือนฝ่ายบุคคล',
        datetime: '20251108 16:40',
        category: 'hrm',
        description: 'พนักงานใหม่เริ่มงาน',
        isRead: true,
      },
      {
        id: 13,
        title: 'แจ้งเตือนคลังสินค้า',
        datetime: '20251108 17:30',
        category: 'inventory',
        description: 'สินค้าเข้าคลังแล้ว',
        isRead: false,
      },
      {
        id: 14,
        title: 'แจ้งเตือนฝ่าย IT',
        datetime: '20251108 18:45',
        category: 'it',
        description: 'Software อัปเดตสำเร็จ',
        isRead: true,
      },
      {
        id: 15,
        title: 'แจ้งเตือนฝ่ายขาย',
        datetime: '20251108 19:00',
        category: 'sales',
        description: 'ลูกค้าสนใจสินค้าใหม่',
        isRead: false,
      },
    ];
    let unreadNoti = notifications.filter((noti) => noti.isRead === false);

    function updateNotiCount() {
      const unreadCount = unreadNoti.filter((n) => !n.isRead).length;
      $('#actionCount').text(unreadCount > 99 ? '99+' : unreadCount);
      if (unreadCount === 0) {
        $('#actionCount').hide();
      } else {
        $('#actionCount').show();
      }
    }

    let initialCategoryOrder = [];
    function renderFilterButtons() {
      const filterContainer = $('#actionFilter');
      filterContainer.empty();

      if (initialCategoryOrder.length === 0) {
        const categories = [...new Set(unreadNoti.map((n) => n.category))];
        initialCategoryOrder = ['all', ...categories];
      }

      initialCategoryOrder.forEach((cat) => {
        const count =
          cat === 'all' ? unreadNoti.length : unreadNoti.filter((n) => n.category === cat).length;

        if (count > 0 || cat === 'all') {
          filterContainer.append(`
                                  <button 
                                    class="btn btn-sm btn-outline-secondary filter-btn 
                                    ${currentFilter === cat ? 'active' : ''}" 
                                    data-filter="${cat}"
                                  >
                                    ${cat}
                                  </button>
                                `);
        }
      });
    }

    function renderNotifications() {
      const container = $('#actionDetail');
      container.empty();

      let filteredNoti =
        currentFilter === 'all'
          ? unreadNoti
          : unreadNoti.filter((n) => n.category === currentFilter);

      filteredNoti.sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead - b.isRead;
        } else {
          return b.datetime.localeCompare(a.datetime);
        }
      });

      filteredNoti.forEach((noti, index) => {
        const isLast = index === filteredNoti.length - 1;

        container.append(`
                          <div class="noti-list" data-id="${noti.id}">
                            <div class="status-dot action"></div>
                            <div class="noti-list-detail">
                              <div class="noti-list-detail-header">
                                <h5>${noti.title}</h5>
                                <p class="noti-datetime">${noti.datetime}</p>
                                <button 
                                  class="btn btn-sm btn-outline-secondary btn-sm category-btn" 
                                  data-category="${noti.category}"
                                >
                                  ${noti.category}
                                </button>
                              </div>
                              <p class="noti-description">${noti.description}</p>
                            </div>
                          </div>
                          ${!isLast ? '<hr />' : ''}
                        `);
      });

      if (filteredNoti.length === 0) {
        container.append(`<p class="text-center text-muted">No notifications</p>`);
      }

      updateNotiCount();
    }

    $(document).on('click', '.filter-btn', function () {
      currentFilter = $(this).data('filter');
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
      renderNotifications();
    });

    $(document).on('click', '.category-btn', function (e) {
      e.stopPropagation();
      const category = $(this).data('category');
      currentFilter = category;

      $('.filter-btn').removeClass('active');
      $(`.filter-btn[data-filter="${category}"]`).addClass('active');

      renderNotifications();
    });

    $(document).on('click', '.noti-list', function () {
      const id = $(this).data('id');

      const clickedNoti = unreadNoti.find((n) => n.id === id);
      console.log(clickedNoti);

      // unreadNoti = unreadNoti.filter((n) => n.id !== id);
      window.location.href = `/hrm/2`;
      renderFilterButtons();
      renderNotifications();
    });

    renderFilterButtons();
    renderNotifications();
    updateNotiCount();
  }

  handleNotification('all');
  handleActionNoti('all');

  async function start() {
    await initializeModules();
    handleInitialUrl();
  }

  start();

  $('#profileTrigger span').text(currentUser?.user_name);

  $('body').on('click', '#logout, #goToLogin', () => {
    document.cookie = 'userData=; path=/; max-age=0';
    window.location.href = '/login';
  });

  $('#mainSystemName').on('click', () => {
    isLogin ? (window.location.href = '/') : (window.location.href = '/login');
  });

  $('#changePassword').on('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
  });

  $('body').on('shown.bs.modal', function () {
    formatDecimalNumberInput();
  });
});
