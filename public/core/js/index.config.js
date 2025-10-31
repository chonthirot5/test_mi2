const currentUser = JSON.parse(Cookies.get('userData') || null);
const isLogin = currentUser ? true : false;

const roleConfigs = {};
let modules = [];

const loadModulesConfig = async () => {
  try {
    const config = await $.getJSON('/core/index.json');
    modules = [];

    for (const mod of config.modules) {
      try {
        const moduleData = await $.getJSON(`/${mod}/${mod}.json`);
        modules.push({ name: mod, ...moduleData });

        try {
          const roleData = await $.getJSON(`/${mod}/role.json`);
          roleConfigs[mod] = roleData;
        } catch {
          console.warn(`No role.json for module ${mod}`);
        }

        try {
          const roleData = await $.getJSON(`/${mod}/role.json`);
          roleConfigs[mod] = roleData;
        } catch {
          console.warn(`No role.json for module ${mod}`);
        }
      } catch (err) {
        console.error('Failed to load module:', mod, err);
      }
    }
  } catch (err) {
    console.error('Failed to load modules config:', err);
  }
};

const getUserRolesForProject = (projectName) => {
  const proj = currentUser?.projects?.find((p) => p.project === projectName);
  return proj?.roles || [];
};

const pageAccess = (moduleName, menuId) => {
  const moduleConfig = modules.find((m) => m.name === moduleName);
  if (!moduleConfig) return true;

  const roleConfig = roleConfigs[moduleName];
  if (!roleConfig) return true;

  const roles = getUserRolesForProject(moduleName);
  if (!roles || roles.length === 0) return false;

  return roles.some((roleName) => {
    const role = roleConfig.roles.find((r) => r.role_name === roleName);
    if (!role) return false;

    const allMenusEmpty = roleConfig.roles.every((r) => !r.menus || r.menus.length === 0);
    if (allMenusEmpty) return true;

    if (!role.menus || role.menus.length === 0) return false;

    function checkMenuAccess(menuList) {
      for (const menu of menuList) {
        if (String(menu.menuId) === String(menuId)) {
          return role.menus.some((userMenu) => String(userMenu.menu_id) === String(menuId));
        }
        if (menu.sections && checkMenuAccess(menu.sections)) return true;
        if (menu.subMenus && checkMenuAccess(menu.subMenus)) return true;
      }
      return false;
    }

    return checkMenuAccess(moduleConfig.menus);
  });
};

const moduleAccess = (moduleName, moduleConfig) => {
  const roleConfig = roleConfigs[moduleName];
  if (!roleConfig || !moduleConfig || !Array.isArray(moduleConfig.menus)) return true;

  const roles = getUserRolesForProject(moduleName);
  if (!roles || roles.length === 0) return false;

  return roles.some((roleName) => {
    const role = roleConfig.roles.find((r) => r.role_name === roleName);
    if (!role) return false;

    const allMenusEmpty = roleConfig.roles.every((r) => !r.menus || r.menus.length === 0);
    if (allMenusEmpty) return true;

    if (!role.menus || role.menus.length === 0) return false;

    function checkMenus(menus) {
      for (const menu of menus) {
        if (role.menus.some((userMenu) => String(userMenu.menu_id) === String(menu.menuId))) {
          return true;
        }
        if (menu.sections && checkMenus(menu.sections)) return true;
        if (menu.subMenus && checkMenus(menu.subMenus)) return true;
      }
      return false;
    }

    return checkMenus(moduleConfig.menus);
  });
};

const elementAccess = (moduleName, menuId, buttonName) => {
  const roleConfig = roleConfigs[moduleName];
  if (!roleConfig) return true;

  const userRoles = getUserRolesForProject(moduleName);
  if (!userRoles || userRoles.length === 0) return false;

  const isButtonDefinedInAnyRole = roleConfig.roles.some((role) => {
    const menu = role.menus.find((m) => String(m.menu_id) === String(menuId));
    return menu?.buttons?.includes(buttonName);
  });

  if (!isButtonDefinedInAnyRole) return true;

  return userRoles.some((roleName) => {
    const role = roleConfig.roles.find((r) => r.role_name === roleName);
    const menuForRole = role?.menus.find((m) => String(m.menu_id) === String(menuId));
    return menuForRole?.buttons?.includes(buttonName);
  });
};

const applyElementRoles = (moduleName, menuId) => {
  const roleConfig = roleConfigs[moduleName];
  if (!roleConfig) return;

  const roles = getUserRolesForProject(moduleName);
  if (!roles || roles.length === 0) return;

  const allButtons = [
    ...new Set(roleConfig.roles.flatMap((r) => r.menus.flatMap((m) => m.buttons || []))),
  ];

  allButtons.forEach((element) => {
    const hasAccess = elementAccess(moduleName, menuId, element);

    const elements = $(`.${element}`);

    elements.each(function () {
      const el = $(this);
      if (!hasAccess) {
        el.hide();
        console.warn(`Hidden ${element} for ${roles.join(', ')}`);
      } else {
        el.show();
      }
    });
  });
};

const applyFormRolesDynamic = (moduleName, menuId) => {
  const roleConfig = roleConfigs[moduleName];
  if (!roleConfig) return;

  const userRoles = getUserRolesForProject(moduleName);
  if (!userRoles || userRoles.length === 0) return;

  const menuForms = {};

  roleConfig.roles.forEach((role) => {
    role.menus?.forEach((menu) => {
      if (String(menu.menu_id) === String(menuId) && menu.form) {
        if (!menuForms['FORM']) menuForms['FORM'] = {};
        menuForms['FORM'][role.role_name] = menu.form;
      }
    });
  });

  const applyAccessToForm = ($form, formRoles) => {
    let allFormAccess = [];
    userRoles.forEach((roleName) => {
      const formAccess = formRoles?.[roleName];
      if (Array.isArray(formAccess)) {
        allFormAccess = [...new Set([...allFormAccess, ...formAccess])];
      }
    });

    if (allFormAccess.length === 0) return;

    const hasHide = allFormAccess.includes('data-hide');
    const hasEdit = allFormAccess.includes('data-edit');
    const hasView = allFormAccess.includes('data-view');

    $form.find('input, select, textarea, button').each(function () {
      const el = $(this);
      let roleAccess = null;

      const hasAttr = el.is('[data-hide]') || el.is('[data-edit]') || el.is('[data-view]');

      if (!hasAttr) {
        roleAccess = null;
      } else {
        if (hasView && !hasHide && !hasEdit) {
          roleAccess = 'view';
        } else if (hasView && (hasHide || hasEdit)) {
          if (el.is('[data-hide]') && allFormAccess.includes('data-hide')) roleAccess = 'hide';
          else if (el.is('[data-edit]') && allFormAccess.includes('data-edit')) roleAccess = 'edit';
          else roleAccess = 'view';
        } else {
          if (el.is('[data-hide]') && allFormAccess.includes('data-hide')) roleAccess = 'hide';
          else if (el.is('[data-edit]') && allFormAccess.includes('data-edit')) roleAccess = 'edit';
        }
      }

      if (roleAccess === 'hide') {
        el.closest('.form-input').hide();
      } else if (roleAccess === 'view') {
        el.closest('.form-input').show();

        if (el.hasClass('flatpickr-input')) {
          el.removeClass('flatpickr-input');
        }

        if (el.is('input, textarea')) {
          el.prop('readonly', true);
        } else if (el.is('select, button')) {
          el.prop('disabled', true);
        }
      } else if (roleAccess === 'edit') {
        el.closest('.form-input').show();
        el.prop('readonly', false);
        el.prop('disabled', false);
        if (el.attr('type') === 'text' && el.attr('placeholder')?.toLowerCase().includes('date')) {
          el.addClass('flatpickr-input');
        }
      }
    });

    let hasEditable = false;
    $form.find('input, textarea, select').each(function () {
      const el = $(this);
      if (el.is(':visible') && !el.prop('readonly') && !el.prop('disabled')) {
        hasEditable = true;
        return false;
      }
    });

    const $modal = $form.closest('.modal');
    const toggleSubmitButtons = (show) => {
      if ($modal.length) {
        $modal.find('[data-submit]').each(function () {
          $(this)
            .closest('.modal-footer, .btn-group, .form-input, .button-group')
            .first()
            .toggle(show);
        });
      } else {
        $form
          .closest('.content-body')
          .find('[data-submit]')
          .each(function () {
            $(this)
              .closest('.btn, .modal-footer, .btn-group, .form-input, .button-group')
              .first()
              .toggle(show);
          });
      }
    };

    toggleSubmitButtons(hasEditable);
  };

  Object.entries(menuForms).forEach(([formId, formRoles]) => {
    const $forms = $(`.${formId}`);
    $forms.each(function () {
      const $form = $(this);
      const $modal = $form.closest('.modal');

      const applyFn = () => applyAccessToForm($form, formRoles);

      if ($modal.length) {
        $modal.on('shown.bs.modal', applyFn);
      } else {
        applyFn();
      }
    });
  });
};

const loadModuleCards = async (moduleGrid) => {
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    if (!mod) continue;

    const moduleName = mod.name;
    const jsonPath = `/${moduleName}/${moduleName}.json`;

    try {
      const data = await $.getJSON(jsonPath);

      if (!moduleAccess(moduleName, data)) continue;

      const card = $(`
                      <div 
                          class="module-card" 
                          id="moduleCard" 
                          data-module="${moduleName}"        
                          style="background: linear-gradient(135deg, 
                                  ${data.colors?.primary || 'var(--primary_main_color)'} 0%, 
                                  ${data.colors?.secondary || 'var(--secondary_main_color)'} 100%)"
                      >
                        <div class="module-title">
                          <div class="module-icon">
                            <i class="${data?.moduleIcon || ''}"></i>
                          </div>
                          <h2 class="module-name btn-link">
                            ${data.moduleTitle || moduleName.toUpperCase()}
                          </h2>
                        </div>
                        <div class="module-description">
                          ${data.moduleDescription || ''}
                        </div>
                        <div class="module-links" id="moduleLinks"></div>
                      </div>
                    `);

      const links = [];
      const hiddenModuleItems = [];

      function findMenuById(menus, targetId, path = []) {
        for (const menu of menus) {
          const currentPath = [...path, menu.menuId];
          if (menu.menuId === targetId) {
            return { menu, path: currentPath };
          }
          if (menu.sections) {
            const found = findMenuById(menu.sections, targetId, currentPath);
            if (found) return found;
          }
          if (menu.subMenus) {
            const found = findMenuById(menu.subMenus, targetId, currentPath);
            if (found) return found;
          }
        }
        return null;
      }

      const quickLinks = data.quickLinks;
      if (quickLinks) {
        quickLinks.forEach((ql) => {
          if (!pageAccess(moduleName, ql.menuId)) return;

          const result = findMenuById(data.menus, ql.menuId);

          if (result) {
            const { menu, path } = result;

            const hasFile = menu.menuFile && menu.menuFile !== 'undefined';
            if (hasFile) {
              const url = buildUrl(moduleName, ...path);

              links.push(
                `<a href="${url}" data-menu-path="${path.join(
                  '/'
                )}" id="moduleLink" class="btn btn-sm btn-link">${ql.name}</a>`
              );
            } else {
              hiddenModuleItems.push({
                id: ql.menuId,
                label: ql.name,
                reason: 'No menuFile',
              });
            }
          }
        });
      }

      if (links.length > 0) {
        card.find('#moduleLinks').html(links.join('<br>'));
      }

      if (hiddenModuleItems.length > 0) {
        console.group(`Hidden Module Card Items (${moduleName.toUpperCase()})`);
        hiddenModuleItems.forEach((item) => {
          console.warn(`${item.id} "${item.label}" - ${item.reason}`);
        });
        console.groupEnd();
      }

      moduleGrid.append(card);
    } catch (err) {
      console.warn(`Failed to load module ${moduleName}`, err);
    }
  }
};

const loadModuleConfig = (moduleName, callback) => {
  $.getJSON(`/${moduleName}/${moduleName}.json`)
    .done((moduleConfig) => {
      if (callback) callback(moduleConfig);
    })
    .fail((_jqxhr, textStatus, error) => {
      console.error('Module config not found:', textStatus, error);
    });
};

const renderNavbar = (menus, moduleName) => {
  let html = '';
  const hiddenItems = [];

  for (const menu of menus) {
    if (!pageAccess(moduleName, menu.menuId)) continue;

    const validSections = [];

    if (menu.sections && menu.sections.length > 0) {
      menu.sections.forEach((section) => {
        if (!pageAccess(moduleName, section.menuId)) return;

        const hasSubMenus = section.subMenus && section.subMenus.length > 0;
        const hasSectionFile = section.menuFile && section.menuFile !== 'undefined';

        if (hasSubMenus || hasSectionFile) {
          if (hasSubMenus) {
            const validSubMenus = section.subMenus.filter(
              (sub) => sub.menuFile && sub.menuFile !== 'undefined'
            );

            if (validSubMenus.length > 0 || hasSectionFile) {
              validSections.push({ ...section, validSubMenus });
            } else {
              const sectionId =
                section.menuId ||
                `${menu.menuId}.${
                  section.sectionHeader?.replace(/[^a-zA-Z0-9]/g, '') || 'section'
                }`;
              hiddenItems.push({
                id: `${menu.menuId}/${sectionId}`,
                label: section.menuLabel || section.sectionHeader,
                reason: 'No valid subMenus and no menuFile',
              });
            }
          } else {
            validSections.push(section);
          }
        } else {
          const sectionId =
            section.menuId ||
            `${menu.menuId}.${section.sectionHeader?.replace(/[^a-zA-Z0-9]/g, '') || 'section'}`;
          hiddenItems.push({
            id: `${menu.menuId}/${sectionId}`,
            label: section.menuLabel || section.sectionHeader,
            reason: 'No menuFile and no subMenus',
          });
        }
      });
    }

    const hasValidSections = validSections.length > 0;
    const hasMenuFile = menu.menuFile && menu.menuFile !== 'undefined';

    if (!hasValidSections && !hasMenuFile) {
      hiddenItems.push({
        id: menu.menuId,
        label: menu.menuLabel,
        reason: 'No menuFile and no valid sections',
      });
      continue;
    }

    const menuUrl = buildUrl(moduleName, menu.menuId);

    if (!hasValidSections && hasMenuFile) {
      html += `
                <div class="nav-item-container">
                  <a href="${menuUrl}" class="nav-item" id="navItem" data-module="${moduleName}" 
                      data-file="${menu.menuFile}" 
                      data-menu-path="${menu.menuId}"
                  >
                    <i class="${menu?.menuIcon || ''}"></i>
                    ${menu.menuLabel}
                  </a>
                  <div class="nav-item-underline d-none"></div>
                </div>
              `;
    } else {
      html += `
                <div class="dropdown" id="dropdown">
                  <div class="dropdown-toggle-container nav-item-container">
                    <div class="nav-item-dropdown" id="navItemDropdown">
                      <i class="${menu?.menuIcon || ''}"></i>
                      ${menu.menuLabel}
                      <button class="dropdown-arrow" aria-label="Toggle dropdown">
                        <i class="fa fa-caret-down"></i>
                      </button>
                    </div>
                    <div class="nav-item-underline d-none"></div>
                  </div>
                  <div class="dropdown-menu" id="dropdownMenu">
              `;

      validSections.forEach((section) => {
        html += `<div class="dropdown-section">`;

        const sectionId =
          section.menuId ||
          `${menu.menuId}.${section.sectionHeader?.replace(/[^a-zA-Z0-9]/g, '') || 'section'}`;

        if (section.validSubMenus) {
          html += `
                    <div class="dropdown-nested" id="dropdownNested">
                      <div class="dropdown-section-header has-submenu" id="hasSubmenu">
                        <div class="dropdown-nested-label">
                          <i class="${section?.menuIcon || ''}"></i>
                          ${section.menuLabel || section.sectionHeader}
                        </div>
                        <i class="fa fa-caret-right"></i>
                      </div>
                      <div class="submenu" id="submenu">
                  `;

          section.validSubMenus.forEach((sub) => {
            const subUrl = buildUrl(moduleName, menu.menuId, sectionId, sub.menuId);
            const subMenuPath = `${menu.menuId}/${sectionId}/${sub.menuId}`;

            html += `
                      <a href="${subUrl}" class="submenu-item" id="submenuItem" data-module="${moduleName}" 
                        data-file="${sub.menuFile}" 
                        data-menu-label="${sub.menuLabel}" 
                        data-menu-path="${subMenuPath}">
                        <i class="${sub?.menuIcon || ''}"></i>
                        ${sub.menuLabel}
                      </a>
                    `;
          });

          html += `</div></div>`;
        } else {
          const sectionUrl = buildUrl(moduleName, menu.menuId, sectionId);
          const menuPath = `${menu.menuId}/${sectionId}`;
          const sectionMenuFile =
            section.menuFile && section.menuFile !== 'undefined' ? section.menuFile : '';

          html += `
                    <a href="${sectionUrl}" class="dropdown-item" id="dropdownItem" data-module="${moduleName}" 
                        data-file="${sectionMenuFile}" 
                        data-menu-label="${section.menuLabel || section.sectionHeader}" 
                        data-menu-path="${menuPath}">
                      <i class="${section?.menuIcon || ''}"></i>
                      ${section.menuLabel || section.sectionHeader}
                    </a>
                  `;
        }

        html += `</div>`;
      });

      html += `</div></div>`;
    }
  }

  if (hiddenItems.length > 0) {
    console.group(`Hidden Menu Items (${moduleName.toUpperCase()})`);
    hiddenItems.forEach((item) => {
      console.warn(`${item.id} "${item.label}" - ${item.reason}`);
    });
    console.groupEnd();
  }

  return html;
};

const loadClassScripts = async (moduleName) => {
  const classFolderPath = `/${moduleName}/classes/`;

  const oldScripts = document.querySelectorAll('script[data-module]');
  oldScripts.forEach((s) => s.remove());

  Axios.showLoadingIcon();
  try {
    const res = await fetch(`${classFolderPath}index.json`);
    const config = await res.json();

    const files = Array.isArray(config) ? config : config.scripts || config;
    const waitForVars = config.waitFor || [];

    for (const file of files) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${classFolderPath}${file}`;
        script.dataset.module = moduleName;
        script.onload = () => resolve();
        script.onerror = () => {
          console.error(`Failed to load script: ${script.src}`);
          reject(new Error(`Failed to load ${file}`));
        };
        document.head.appendChild(script);
      });
    }

    if (waitForVars.length > 0) {
      while (!waitForVars.every((varName) => window[varName] !== undefined)) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  } catch (err) {
    console.error('Error loading class scripts:', err);
  } finally {
    Axios.hideLoading();
  }
};

const loadModuleContent = ({ moduleName, fileName, callback, menuId = null }) => {
  const filePath = `/${moduleName}/views/${fileName}.html`;

  $('#mainContent').load(filePath, function (_response, status, xhr) {
    if (status === 'error') {
      console.error('Error loading content:', xhr.statusText);
    } else {
      initDefault();

      if (menuId) {
        applyElementRoles(moduleName, menuId);
        applyFormRolesDynamic(moduleName, menuId);
      } else {
        const m = getModuleAndMenuFromURL();
        applyElementRoles(moduleName, m.menuId);
        applyFormRolesDynamic(moduleName, m.menuId);
      }

      if (typeof callback === 'function') callback();
    }
  });
};

const initDefault = () => {
  setTextInput();
  selectAllOnFocus();
  formatDecimalNumberInput();
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  new Tabs();
};

const findMenuByPath = (moduleConfig, pathParts) => {
  if (!pathParts || pathParts.length === 0) return null;

  const [menuId, sectionId, subMenuId] = pathParts;

  const menu = moduleConfig.menus.find((m) => m.menuId === menuId);
  if (!menu) return null;

  if (pathParts.length === 1) {
    return { item: menu, type: 'menu' };
  }

  if (menu.sections) {
    const section = menu.sections.find(
      (s) =>
        s.menuId === sectionId ||
        `${menuId}.${s.sectionHeader?.replace(/[^a-zA-Z0-9]/g, '') || 'section'}` === sectionId
    );

    if (!section) return null;

    if (pathParts.length === 2) {
      return { item: section, type: 'section', parentMenu: menu };
    }

    if (section.subMenus && pathParts.length === 3) {
      const subMenu = section.subMenus.find((sm) => sm.menuId === subMenuId);
      if (subMenu) {
        return {
          item: subMenu,
          type: 'submenu',
          parentMenu: menu,
          parentSection: section,
        };
      }
    }
  }

  return null;
};

const buildUrl = (module, ...pathParts) => {
  const cleanParts = pathParts.filter((part) => part && part !== 'undefined');
  return `/${module}/${cleanParts.join('/')}`;
};

const parseUrl = (url) => {
  let path = url;
  if (url.includes('#')) {
    path = url.split('#')[1];
  } else {
    path = url.replace(window.location.origin, '').replace(/^\/+/, '');
  }

  if (!path) return null;

  const parts = path.split('/').filter((part) => part);
  if (parts.length < 1) return null;

  return {
    module: parts[0],
    menuPath: parts.slice(1),
  };
};

const getCurrentMenuId = (_moduleName, menuPath) => {
  if (!menuPath || menuPath.length === 0) return null;

  if (menuPath.length === 1) {
    return menuPath[0];
  }

  if (menuPath.length === 2) {
    return menuPath[1];
  }

  if (menuPath.length === 3) {
    return menuPath[2];
  }

  return null;
};

const initializeNavbarEvents = () => {
  $(document).off('click.navbar mouseenter.navbar mouseleave.navbar');

  $(document).on('mouseenter.navbar', '#dropdown', function () {
    const dropdown = $(this);
    clearTimeout(dropdown.data('hoverTimeout'));
    $('#dropdownMenu').not(dropdown.find('#dropdownMenu')).hide();
    $('#submenu').not(dropdown.find('#submenu')).removeClass('show').hide();
    dropdown.find('#dropdownMenu').show();
    dropdown.find('#dropdownNested').each(function () {
      clearTimeout($(this).data('submenuTimeout'));
    });
  });

  $(document).on('mouseleave.navbar', '#dropdown', function () {
    const dropdown = $(this);
    const timeoutId = setTimeout(() => {
      if (!dropdown.is(':hover')) {
        dropdown.find('#dropdownMenu').hide();
        dropdown.find('#submenu').removeClass('show').hide();
        dropdown.find('#dropdownNested').each(function () {
          clearTimeout($(this).data('submenuTimeout'));
        });
      }
    }, 150);

    dropdown.data('hoverTimeout', timeoutId);
  });

  $(document).on('mouseenter.navbar', '#dropdownNested', function () {
    const nestedDropdown = $(this);
    const submenu = nestedDropdown.find('#submenu');

    clearTimeout(nestedDropdown.data('submenuTimeout'));

    nestedDropdown.siblings('#dropdownNested').each(function () {
      const siblingSubmenu = $(this).find('#submenu');
      clearTimeout($(this).data('submenuTimeout'));
      siblingSubmenu.removeClass('show').hide();
    });

    submenu.addClass('show').show();
    nestedDropdown.addClass('hover-active');
  });

  $(document).on('mouseleave.navbar', '#dropdownNested', function () {
    const nestedDropdown = $(this);
    const submenu = nestedDropdown.find('#submenu');

    nestedDropdown.removeClass('hover-active');

    const timeoutId = setTimeout(() => {
      if (!nestedDropdown.is(':hover')) {
        submenu.removeClass('show').hide();
      }
    }, 200);

    nestedDropdown.data('submenuTimeout', timeoutId);
  });

  $(document).on('mouseenter.navbar', '#submenu', function () {
    const submenu = $(this);
    const parentNested = submenu.closest('#dropdownNested');

    clearTimeout(parentNested.data('submenuTimeout'));
    submenu.addClass('show').show();
    parentNested.addClass('hover-active');
  });

  $(document).on('mouseleave.navbar', '#submenu', function () {
    const submenu = $(this);
    const parentNested = submenu.closest('#dropdownNested');

    const timeoutId = setTimeout(() => {
      if (!parentNested.is(':hover')) {
        submenu.removeClass('show').hide();
        parentNested.removeClass('hover-active');
      }
    }, 200);

    parentNested.data('submenuTimeout', timeoutId);
  });

  $(document).on('mouseenter.navbar', '#hasSubmenu', function () {
    const hasSubmenu = $(this);
    const nestedDropdown = hasSubmenu.closest('#dropdownNested');
    const submenu = nestedDropdown.find('#submenu');

    clearTimeout(nestedDropdown.data('submenuTimeout'));
    submenu.addClass('show').show();
    nestedDropdown.addClass('hover-active');
  });

  $(document).on('click', '#navItem', function (e) {
    e.preventDefault();

    const moduleName = $(this).data('module');
    const fileName = $(this).data('file');
    const menuPath = $(this).data('menu-path');

    if (fileName && fileName !== 'undefined') {
      const menuId = getCurrentMenuId(moduleName, [menuPath]);
      loadModuleContent({ moduleName, fileName, menuId });
      setActiveMenu($(this));

      const url = buildUrl(moduleName, menuPath);
      window.history.pushState({ module: moduleName, path: [menuPath] }, '', url);
    }
  });

  $(document).on('click', '#dropdownItem, #submenuItem', function (e) {
    e.preventDefault();

    const moduleName = $(this).data('module');
    const fileName = $(this).data('file');
    const menuPath = $(this).data('menu-path');

    if (fileName && fileName !== 'undefined') {
      const pathParts = menuPath.split('/');

      const menuId = getCurrentMenuId(moduleName, pathParts);
      loadModuleContent({ moduleName, fileName, menuId });
      setActiveMenu($(this));

      const url = buildUrl(moduleName, ...pathParts);
      window.history.pushState({ module: moduleName, path: pathParts }, '', url);
    }
  });

  $(document).on('click.navbar', function (event) {
    if (!$(event.target).closest('#dropdown, #navItem, #navItemDropdown').length) {
      $('#dropdownMenu').hide();
      $('#submenu').removeClass('show').hide();
      $('#dropdownNested').removeClass('hover-active');
      $('#dropdown, #dropdownNested').each(function () {
        clearTimeout($(this).data('hoverTimeout'));
        clearTimeout($(this).data('submenuTimeout'));
      });
    }
  });
};

const setActiveMenu = (element) => {
  $('#navItem, #navItemDropdown, #dropdownItem, #submenuItem, #hasSubmenu').removeClass('active');
  $('.nav-item-underline').addClass('d-none');

  $(element).addClass('active');
  $(element).closest('.nav-item-container').find('.nav-item-underline').removeClass('d-none');

  const parentDropdown = $(element).closest('#dropdown');
  if (parentDropdown.length) {
    const parentButton = parentDropdown.find('#navItemDropdown').first();
    if (parentButton.length) {
      parentButton.addClass('active');
      parentButton.closest('.nav-item-container').find('.nav-item-underline').removeClass('d-none');
    }
  }

  if ($(element).hasClass('submenu-item')) {
    const parentSection = $(element).closest('#dropdownNested').find('#hasSubmenu');

    if (parentSection.length) {
      parentSection.addClass('active');
    }
  }

  if ($(element).hasClass('dropdown-item')) {
    const parentDropdown = $(element).closest('#dropdown');
    const parentButton = parentDropdown.find('#navItemDropdown').first();
    if (parentButton.length) {
      parentButton.addClass('active');
    }
  }
};

const setTextInput = () => {
  $('.main-content .text-input').each(function () {
    const container = $(this);
    const field = container.find('.editable-field');
    const counter = container.find('.char-counter');
    const clearBtn = container.find('.clear-input-btn');
    const maxLength = field.attr('maxlength') || '';

    if (clearBtn.length) {
      field.addClass('with-clear');
    } else {
      field.addClass('no-clear');
    }

    counter.text(`${field.val().length}/${maxLength}`);
    clearBtn.toggle(!!field.val());

    field.on('input', function () {
      counter.text(`${field.val().length}/${maxLength}`);
      clearBtn.toggle(!!field.val());
    });

    clearBtn.on('click', function () {
      field.val('');
      counter.text(`${field.val().length}/${maxLength}`);
      clearBtn.hide();
      field.trigger('input');
      field.focus();
    });
  });
};

const selectAllOnFocus = () => {
  $('.form-control').on('focus', function () {
    if (!$(this).prop('readonly')) {
      $(this).select();
    }
  });
};

const formatDecimalNumberInput = () => {
  $('[class*="number-input"]').each(function () {
    const $input = $(this);
    const classList = $(this).attr('class').split(/\s+/);
    let decimal = 0;

    classList.forEach((cls) => {
      const match = cls.match(/^number-input-(\d+)$/);
      if (match) decimal = parseInt(match[1], 10);
    });

    const dataMin = parseFloat($input.data('min')) || null;
    let lastValidValue = $input.val();

    const formatValue = (el) => {
      let val = $(el).val();
      if (val !== '' && !isNaN(val)) {
        val = parseFloat(val).toFixed(decimal);
        val = Number(val).toLocaleString('en-US', {
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal,
        });
        $(el).val(val);
      }
    };

    const validate = (inputElement, dataMin, decimal) => {
      let value = $(inputElement).val();

      value = value.replace(/[^0-9.-]/g, '');
      value = value.replace(/(?!^)-/g, '');

      if (dataMin > 0) value = value.replace(/-/g, '');

      if (decimal === 0) {
        value = value.replace(/\./g, '');
      } else {
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
        if (parts[1] && parts[1].length > decimal)
          value = parts[0] + '.' + parts[1].substring(0, decimal);
      }

      if (dataMin !== null && value !== '' && !isNaN(value)) {
        if (parseFloat(value) < dataMin) {
          $(inputElement).val(lastValidValue);
          return lastValidValue;
        }
      }

      lastValidValue = value;
      $(inputElement).val(value);

      return value;
    };

    $(this).on('input', function () {
      validate(this, dataMin, decimal);
    });

    $(this).on('focus', function () {
      $(this).val($(this).val().replace(/,/g, ''));
      if (!$(this).prop('readonly')) {
        this.select();
      }
    });

    $(this).on('blur', function () {
      formatValue(this);
    });

    $(this).on('set', function () {
      validate(this, dataMin, decimal);
      formatValue(this);
    });

    formatValue(this);
  });
};

const formatNumber = (num) => {
  if (typeof num === 'number') return num;
  const cleaned = num.replace(/,/g, '');
  return parseFloat(cleaned);
};

const breadcrumb = () => {
  initializeBreadcrumb();

  window.addEventListener('popstate', function () {
    initializeBreadcrumb();
  });

  function initializeBreadcrumb() {
    const currentPath = window.location.pathname;
    const urlInfo = parseUrl(currentPath);

    if (!urlInfo || !urlInfo.module) {
      updateBreadcrumb([{ label: 'Home', href: '/' }]);
      return;
    }

    loadModuleConfig(urlInfo.module, (moduleConfig) => {
      const breadcrumbItems = buildBreadcrumbItems(moduleConfig, urlInfo);
      updateBreadcrumb(breadcrumbItems);
    });
  }

  function buildBreadcrumbItems(moduleConfig, urlInfo) {
    const breadcrumbItems = [];
    const { module, menuPath } = urlInfo;

    if (menuPath.length === 0) {
      return breadcrumbItems;
    }

    const pathResult = findMenuByPath(moduleConfig, menuPath);

    if (!pathResult) {
      return breadcrumbItems;
    }

    if (menuPath.length >= 1) {
      const menuId = menuPath[0];
      const menu = moduleConfig.menus.find((m) => m.menuId === menuId);

      if (menu) {
        breadcrumbItems.push({
          label: menu.menuLabel,
          href: buildUrl(module, menuId),
          isActive: menuPath.length === 1,
        });
      }
    }

    if (menuPath.length >= 2) {
      const [menuId, sectionId] = menuPath;
      const menu = moduleConfig.menus.find((m) => m.menuId === menuId);

      if (menu && menu.sections) {
        const section = menu.sections.find(
          (s) =>
            s.menuId === sectionId ||
            `${menuId}.${s.sectionHeader?.replace(/[^a-zA-Z0-9]/g, '') || 'section'}` === sectionId
        );

        if (section) {
          breadcrumbItems.push({
            label: section.menuLabel || section.sectionHeader,
            href: buildUrl(module, menuId, sectionId),
            isActive: menuPath.length === 2,
          });
        }
      }
    }

    if (menuPath.length >= 3) {
      const [menuId, sectionId, subMenuId] = menuPath;
      const menu = moduleConfig.menus.find((m) => m.menuId === menuId);

      if (menu && menu.sections) {
        const section = menu.sections.find(
          (s) =>
            s.menuId === sectionId ||
            `${menuId}.${s.sectionHeader?.replace(/[^a-zA-Z0-9]/g, '') || 'section'}` === sectionId
        );

        if (section && section.subMenus) {
          const subMenu = section.subMenus.find((sm) => sm.menuId === subMenuId);

          if (subMenu) {
            breadcrumbItems.push({
              label: subMenu.menuLabel,
              href: buildUrl(module, menuId, sectionId, subMenuId),
              isActive: true,
            });
          }
        }
      }
    }

    return breadcrumbItems;
  }

  function updateBreadcrumb(breadcrumbItems) {
    const breadcrumbContainer = $('.breadcrumb');

    if (!breadcrumbContainer.length) {
      return;
    }

    breadcrumbContainer.empty();

    breadcrumbItems.forEach((item, index) => {
      const isLast = index === breadcrumbItems.length - 1;

      if (isLast || item.isActive) {
        breadcrumbContainer.append(`
                                      <li class="breadcrumb-item active" aria-current="page">
                                        ${item.label}
                                      </li>
                                    `);
      } else {
        breadcrumbContainer.append(`
                                      <li class="breadcrumb-item">
                                        <a href="${item.href}">${item.label}</a>
                                      </li>
                                    `);
      }
    });
  }

  $(document).on('click', '.breadcrumb a', function (e) {
    e.preventDefault();
    const href = $(this).attr('href');

    if (href && href !== '#') {
      const urlInfo = parseUrl(href);

      if (urlInfo && urlInfo.module) {
        loadModuleConfig(urlInfo.module, (moduleConfig) => {
          const foundItem = findMenuByPath(moduleConfig, urlInfo.menuPath);

          if (foundItem) {
            const menuFile = foundItem.item.menuFile;
            const menuId = foundItem.item.menuId;

            $('#moduleName').text(moduleConfig.moduleTitle);

            const navbarHTML = renderNavbar(moduleConfig.menus, urlInfo.module);
            $('#navbarMenu').html(navbarHTML);
            initializeNavbarEvents();

            const menuPath = urlInfo.menuPath.join('/');
            const selector = `[data-menu-path="${menuPath}"]`;
            const matchingElement = $(selector);
            if (matchingElement.length > 0) {
              setActiveMenu(matchingElement);
            }

            if (menuFile && menuFile !== 'undefined') {
              loadModuleContent({
                moduleName: urlInfo.module,
                fileName: menuFile,
                callback: () => {
                  initializeBreadcrumb();
                },
                menuId,
              });
            }

            window.history.pushState({ module: urlInfo.module, path: urlInfo.menuPath }, '', href);
          } else {
            const welcomeMenu = moduleConfig.menus.find(
              (m) =>
                m.menuId === moduleConfig.welcomeMenuId || m.menuId == moduleConfig.welcomeMenuId
            );

            if (welcomeMenu) {
              $('#moduleName').text(moduleConfig.moduleTitle);
              const navbarHTML = renderNavbar(moduleConfig.menus, urlInfo.module);
              $('#navbarMenu').html(navbarHTML);
              initializeNavbarEvents();

              loadModuleContent({
                moduleName: urlInfo.module,
                fileName: welcomeMenu.menuFile,
                callback: () => {
                  const welcomeElement = $(`[data-menu-path="${welcomeMenu.menuId}"]`);
                  if (welcomeElement.length > 0) {
                    setActiveMenu(welcomeElement);
                  }
                  initializeBreadcrumb();
                },
                menuId: welcomeMenu.menuId,
              });

              const welcomeUrl = buildUrl(urlInfo.module, welcomeMenu.menuId);
              window.history.pushState(
                { module: urlInfo.module, path: [welcomeMenu.menuId] },
                '',
                welcomeUrl
              );
            }
          }
        });
      } else {
        window.location.href = href;
      }
    }
  });
};

const getElementClass = (html) => {
  const match = html.match(/class="([^"]+)"/);
  return match ? match[1] : null;
};

const loadDynamicPage = async (moduleName, fileName, folder = 'views', extraParams = {}) => {
  await loadClassScripts(moduleName);

  if (!moduleName || !fileName) {
    $('body').html('<h2>Page not found.</h2>');
    return;
  }

  const filePath = `/${moduleName}/${folder}/${fileName}.html`;
  $('body').load(filePath, function (response, status) {
    if (
      status === 'error' ||
      (response.includes('<!DOCTYPE html>') && response.includes('<body'))
    ) {
      $('body').html('<h2>Page not found.</h2>');
    }
  });

  const params = new URLSearchParams({
    module: moduleName,
    file: fileName,
    folder,
    ...extraParams,
  });
  const newUrl = `/view?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
};

const loadDynamicPageFromUrl = () => {
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  const { module: moduleName, file: fileName, folder = 'views', ...extraParams } = params;
  loadDynamicPage(moduleName, fileName, folder, extraParams);
};

const renderChips = (container, selectedItems = [], onChange) => {
  let chipsContainer = container.querySelector('.chips-container');

  if (!chipsContainer && selectedItems.length > 0) {
    chipsContainer = document.createElement('div');
    chipsContainer.classList.add('chips-container');
    container.appendChild(chipsContainer);
  }

  if (chipsContainer) {
    chipsContainer.innerHTML = '';

    selectedItems.forEach((item) => {
      const chip = document.createElement('div');
      chip.classList.add('chip');
      chip.dataset.value = item.value;
      chip.innerHTML = `
                          <span>${item.label}</span>
                          <button class="chip-remove" type="button" title="Remove ${item.value}">
                            <i class="fa-solid fa-circle-xmark clear-input-btn"></i>
                          </button>
                        `;

      chip.querySelector('.chip-remove').addEventListener('click', () => {
        const index = selectedItems.findIndex((i) => i.value === item.value);
        if (index > -1) selectedItems.splice(index, 1);

        renderChips(container, selectedItems, onChange);

        if (onChange) onChange(selectedItems);
      });

      chipsContainer.appendChild(chip);
    });

    if (selectedItems.length === 0) chipsContainer.remove();
  }

  if (onChange) onChange(selectedItems);
};

const getModuleAndMenuFromURL = () => {
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  const moduleName = pathParts[0] || null;

  const menuId =
    pathParts.length >= 4
      ? pathParts[3]
      : pathParts.length === 3
      ? pathParts[2]
      : pathParts[1] || null;

  return { moduleName, menuId };
};
