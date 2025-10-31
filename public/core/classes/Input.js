class Input {
  constructor() {}

  static multiAutocomplete({ containerSelector, items = [], onChange = null, enableAdd = false }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const input = $(container).find('.autocomplete-input');
    const list = $(container).find('.dropdown-menu');
    const label = container.querySelector('label');
    const dropdown = new bootstrap.Dropdown(input, { autoClose: false });

    let selectedItems = [];

    function renderChips() {
      let chipsContainer = container.querySelector('.chips-container');

      if (!chipsContainer && selectedItems.length > 0) {
        chipsContainer = document.createElement('div');
        chipsContainer.classList.add('chips-container');
        container.insertBefore(chipsContainer, label);
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
          chipsContainer.appendChild(chip);
        });

        if (selectedItems.length === 0) chipsContainer.remove();
      }

      if (onChange) onChange(selectedItems);
    }

    function getAvailableOptions() {
      return items;
    }

    function renderList(items) {
      if (items.length === 0 && !enableAdd) {
        list.empty().hide();
        return;
      }

      let html = items
        .map((item) => {
          const isChecked = selectedItems.some((i) => i.value === item.value);
          return `
                <li>
                  <a 
                    class="dropdown-item d-flex align-items-center selection-item" 
                    href="#" 
                    data-value="${item.value}"
                  >
                    <div class="form-check">
                      <input class="form-check-input me-2" type="checkbox" 
                        ${isChecked ? 'checked' : ''}
                      >
                      <label class="form-check-label">${item.label}</label>
                    </div>
                  </a>
                </li>
              `;
        })
        .join('');

      if (enableAdd) {
        html += `<li><a class="dropdown-item add-dropdown-item" href="#"><i class="fa-solid fa-circle-plus"></i> Add Item</a></li>`;
      }

      list.html(html).show();
      requestAnimationFrame(() => {
        dropdown.update();
        dropdown.show();
      });
    }

    function removeSelectedItem(value) {
      const index = selectedItems.findIndex((i) => i.value === value);
      if (index > -1) {
        selectedItems.splice(index, 1);
        renderChips();
      }
    }

    input.on('click input', () => {
      const query = (input.val() || '').toLowerCase().trim();
      const filtered = getAvailableOptions().filter((o) => o.label.toLowerCase().includes(query));
      renderList(filtered);
    });

    $(document).on('click', (e) => {
      if (!container.contains(e.target)) list.hide();
    });

    list.on('click', '.selection-item', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const value = $(this).data('value');
      const item = items.find((i) => i.value === value);
      const checkbox = $(this).find('input[type="checkbox"]');

      if (selectedItems.some((i) => i.value === value)) {
        selectedItems = selectedItems.filter((i) => i.value !== value);
        checkbox.prop('checked', false);
      } else if (item) {
        selectedItems.push(item);
        checkbox.prop('checked', true);
      }

      renderChips();
    });

    $(document).on('click', '.chip-remove', function (e) {
      e.stopPropagation();
      const val = $(this).closest('.chip').data('value');
      removeSelectedItem(val);
    });

    container._multiAutocomplete = {
      selectedItems,
      clear: () => {
        selectedItems = [];
        renderChips();
        renderList(getAvailableOptions());
      },
    };

    return container._multiAutocomplete;
  }

  // static multiDropdown({
  //   containerSelector,
  //   items = [],
  //   onAddItem = null,
  //   onChange = null,
  //   enableAdd = false,
  // }) {
  //   const container = document.querySelector(containerSelector);
  //   if (!container) return;

  //   const dropdownList = $(container.querySelector('.dropdown-menu'));
  //   const dropdownInput = $(container.querySelector('.dropdown-toggle'));
  //   let selectedItems = [];

  //   const chipsContainerId = `dropdownChipsContainer_${containerSelector}`;

  //   function renderChips() {
  //     let chipsContainer = $(`#${chipsContainerId}`);

  //     if (selectedItems.length === 0) {
  //       chipsContainer.remove();
  //       return;
  //     }

  //     if (chipsContainer.length === 0) {
  //       chipsContainer = $(`<div class="chips-container" id="${chipsContainerId}"></div>`);
  //       const label = container.querySelector('label');
  //       if (label) {
  //         $(chipsContainer).insertBefore(label);
  //       } else {
  //         $(chipsContainer).insertBefore(dropdownInput);
  //       }
  //     }

  //     chipsContainer.empty();

  //     selectedItems.forEach((item) => {
  //       const chip = $(`
  //                       <div class="chip" data-value="${item.value}">
  //                         <span>${item.label}</span>
  //                         <button class="chip-remove" type="button" title="Remove ${item.value}">
  //                           <i class="fa-solid fa-circle-xmark clear-input-btn"></i>
  //                         </button>
  //                       </div>
  //                     `);
  //       chipsContainer.append(chip);
  //     });
  //   }

  //   function renderDropdownItems() {
  //     const itemsHtml = items
  //       .map((item) => {
  //         const isChecked = selectedItems.some((selected) => selected.value === item.value);
  //         const itemId = `check-${containerSelector}-${item.value.replace(/\s+/g, '-')}`;
  //         return `
  //                 <li>
  //                   <a class="dropdown-item d-flex align-items-center"
  //                     href="#"
  //                     data-value="${item.value}"
  //                   >
  //                     <div class="form-check">
  //                       <input class="form-check-input me-2" type="checkbox"
  //                         ${isChecked ? 'checked' : ''} id="${itemId}"
  //                       >
  //                       <label class="form-check-label" for="${itemId}">${item.label}</label>
  //                     </div>
  //                   </a>
  //                 </li>
  //               `;
  //       })
  //       .join('');

  //     dropdownList.html(itemsHtml);

  //     if (enableAdd) {
  //       dropdownList.append(`
  //                             <li>
  //                               <a class="dropdown-item add-dropdown-item" href="#" data-action="add">
  //                                 <i class="fa-solid fa-circle-plus"></i>
  //                                 Add Item
  //                               </a>
  //                             </li>
  //                           `);
  //     }
  //   }

  //   function removeSelectedItem(value) {
  //     selectedItems = selectedItems.filter((item) => item.value !== value);
  //     renderChips();
  //     renderDropdownItems();
  //     if (onChange) onChange([...selectedItems]);
  //   }

  //   function setupEventHandlers() {
  //     $(document).on('click', `#${chipsContainerId} .chip-remove`, (e) => {
  //       e.preventDefault();
  //       e.stopPropagation();
  //       const value = $(e.target).closest('.chip').data('value');
  //       removeSelectedItem(value);
  //     });

  //     dropdownList.on('click', '.dropdown-item', (e) => {
  //       e.preventDefault();
  //       e.stopPropagation();

  //       const $this = $(e.currentTarget);
  //       const action = $this.data('action');
  //       const value = $this.data('value');
  //       console.log('value', value);

  //       if (action === 'add') {
  //         if (onAddItem) onAddItem();
  //         return;
  //       }

  //       const checkbox = $this.find('input[type="checkbox"]');

  //       const selectedItem = items.find((i) => i.value === value);

  //       if (selectedItems.some((i) => i.value === value)) {
  //         selectedItems = selectedItems.filter((i) => i.value !== value);
  //         checkbox.prop('checked', false);
  //       } else if (selectedItem) {
  //         selectedItems.push(selectedItem);
  //         checkbox.prop('checked', true);
  //       }

  //       renderChips();
  //       renderDropdownItems();
  //       if (onChange) onChange([...selectedItems]);
  //     });

  //     dropdownList.on('click', 'input[type="checkbox"]', (e) => {
  //       e.stopPropagation();
  //       const value = $(e.target).closest('.dropdown-item').data('value');
  //       const isChecked = $(e.target).is(':checked');

  //       if (isChecked && !selectedItems.some((item) => item.value === value)) {
  //         const selectedItem = items.find((item) => item.value === value);
  //         if (selectedItem) selectedItems.push(selectedItem);
  //       } else if (!isChecked && selectedItems.some((item) => item.value === value)) {
  //         selectedItems = selectedItems.filter((item) => item.value !== value);
  //       }

  //       renderChips();
  //       renderDropdownItems();
  //       if (onChange) onChange([...selectedItems]);
  //     });

  //     dropdownList.on('click', '.form-check-label', (e) => {
  //       e.stopPropagation();
  //       const checkbox = $(e.target).siblings('input[type="checkbox"]');
  //       checkbox.trigger('click');
  //     });
  //   }

  //   setupEventHandlers();
  //   renderDropdownItems();
  //   renderChips();

  //   return {
  //     getSelectedItems: () => [...selectedItems],
  //     setSelectedItems: (items) => {
  //       selectedItems = items.filter((item) => items.includes(item));
  //       renderChips();
  //       renderDropdownItems();
  //       if (onChange) onChange([...selectedItems]);
  //     },
  //     addItem: (item) => {
  //       if (!items.includes(item)) {
  //         items.push(item);
  //         renderDropdownItems();
  //       }
  //     },
  //   };
  // }

  static dropdownButton({ containerSelector, items = [], isActionButton = false }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const dropdownList = $(container.querySelector('.dropdown-menu'));

    const itemsHtml = items
      .map(
        (item) => `
                  <li>
                    <a 
                      class="dropdown-item dropdown-item-option 
                              ${isActionButton ? 'action-item' : ''} 
                              ${item.accessClass}" 
                      href="#" 
                      data-value="${item.value}"
                      id="${item.id || ''}" 
                    >
                      ${item.icon || ''} ${item.label}
                    </a>
                  </li>
                `
      )
      .join('');
    dropdownList.html(itemsHtml);

    const m = getModuleAndMenuFromURL();
    applyElementRoles(m.moduleName, m.menuId);
  }

  static telInput(telSelector) {
    const input = $(telSelector)[0];
    const iti = window.intlTelInput(input, {
      initialCountry: 'th',
      separateDialCode: true,
      strictMode: true,
      preferredCountries: ['th', 'us'],
      utilsScript: '/core/plugins/intlTelInput/utils.js',
    });

    $(input).on('input', function () {
      this.value = this.value.replace(/\D/g, '');
    });

    return iti;
  }

  static splitButtonDropdown({
    containerSelector,
    importantItems = [],
    normalItems = [],
    moduleName = null,
    menuId = null,
  }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const dropdownList = $(container.querySelector('.dropdown-menu'));

    const importantHtml = importantItems
      .map((item) => {
        const className = getElementClass(item.label);
        return elementAccess(moduleName, menuId, className)
          ? `
            <li>
              <a 
                class="dropdown-item dropdown-item-option action-item ${item.accessClass}" 
                href="#" 
                data-value="${item.value}"
                id="${item.id || ''}" 
              >
                ${item.icon || ''} ${item.label}
              </a>
            </li>
          `
          : '';
      })
      .join('');

    const normalHtml = normalItems
      .map((item) => {
        const className = getElementClass(item.label);
        return elementAccess(moduleName, menuId, className)
          ? `
            <li>
              <a 
                class="dropdown-item dropdown-item-option action-item ${item.accessClass}" 
                href="#" 
                data-value="${item.value}"
                id="${item.id || ''}" 
              >
                ${item.icon || ''} ${item.label}
              </a>
            </li>
          `
          : '';
      })
      .join('');

    let itemsHtml = '';
    if (importantHtml && normalHtml) {
      itemsHtml = importantHtml + `<li><hr class="dropdown-divider"></li>` + normalHtml;
    } else {
      itemsHtml = importantHtml || normalHtml;
    }

    dropdownList.html(itemsHtml);

    const m = getModuleAndMenuFromURL();
    applyElementRoles(m.moduleName, m.menuId);
  }
}
