class Form {
  constructor(config = {}) {
    this.containerSelector = config.containerSelector || '.content-body';
    this.formSelector = config.formSelector || 'form';

    this.container = document.querySelector(this.containerSelector);
    this.result = [];
    this.init();
  }

  init() {
    if (!this.container) {
      throw new Error(`Container with selector "${this.containerSelector}" not found`);
    }
  }

  validateInput() {
    const form = $(this.formSelector);
    const formValidator = new FormValidator({ containerSelector: this.formSelector });
    const isValid = formValidator.validateRequiredFields().isValid;

    let hasError = false;

    form.find('.form-control, .form-check-input').removeClass('error');

    form.find('.form-control').each(function () {
      const field = $(this);
      const type = field.attr('type');
      const required = field.prop('required');
      let value = field.val();

      if (Array.isArray(value)) {
        value = value.join(',');
      }

      if (typeof value === 'string') {
        value = value.trim();
      }

      // if (type === 'tel' && tel) {
      //   if (required || value) {
      //     if (!tel.isValidNumber()) {
      //       field.addClass('error');
      //       hasError = true;
      //       console.error('Invalid number for ' + tel.getSelectedCountryData().name);
      //     } else {
      //       console.log('Valid number: ' + tel.getNumber());
      //     }
      //   }
      // }
      // else
      if (type === 'email') {
        if (required || value) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            field.addClass('error');
            hasError = true;
            console.error('Invalid email: ' + value);
          } else {
            console.log('Valid email: ' + value);
          }
        }
      } else if (required && !this.checkValidity()) {
        field.addClass('error');
        hasError = true;
      }
    });

    form.find('.form-control[required]').on('input', function () {
      if (this.value.trim()) {
        $(this).removeClass('error');
      }
    });

    return !hasError && isValid;
  }

  getData() {
    this.result = [];
    this.getReadonlyValues();
    this.getTextInputValues();
    this.getTextAreaValues();
    this.getNumberValues();
    this.getAmountValues();
    this.getEmailValues();
    this.getTelValues();
    this.getUploadedFiles();
    this.getCheckboxValues();
    this.getRadioValues();
    this.getDateValues();
    this.getDropdownValues();
    this.getAutocompleteValues();
    console.log('this.result', this.result);
    return this.result;
  }

  getReadonlyValues() {
    const readonlyFields = [];
    this.container.querySelectorAll('input[readonly]').forEach((el) => {
      if (el.value !== '') {
        const data = {
          value: el.value,
          id: el.id,
        };
        readonlyFields.push(data);
        this.result.push(data);
      }
    });
    return readonlyFields;
  }

  getTextInputValues() {
    const textInputs = [];
    this.container
      .querySelectorAll(
        '.editable-field:not(textarea), input[type="text"]:not(.number-input):not([readonly])'
      )
      .forEach((el) => {
        if (!el.classList.contains('number-input') && el.tagName !== 'TEXTAREA') {
          if (el.value !== '') {
            const data = {
              value: el.value,
              id: el.id,
            };
            textInputs.push(data);
            this.result.push(data);
          }
        }
      });
    return textInputs;
  }

  getTextAreaValues() {
    const textAreas = [];
    this.container
      .querySelectorAll('.textarea-normal, .textarea-horizontal, .textarea-vertical')
      .forEach((el) => {
        if (el.value !== '') {
          const data = {
            value: el.value,
            id: el.id,
          };
          textAreas.push(data);
          this.result.push(data);
        }
      });
    return textAreas;
  }

  getNumberValues() {
    const numbers = [];
    this.container.querySelectorAll('.number-input').forEach((el) => {
      if (el.value && el.value.trim() !== '') {
        const value = formatNumber(el.value);
        if (!isNaN(value)) {
          const data = {
            value: value,
            id: el.id,
          };
          numbers.push(data);
          this.result.push(data);
        }
      }
    });
    return numbers;
  }

  getAmountValues() {
    const amounts = [];
    this.container.querySelectorAll('.input-group input[type="text"]').forEach((el) => {
      const inputGroup = el.closest('.input-group');
      if (inputGroup && inputGroup.querySelector('.input-group-text')) {
        if (el.value && el.value.trim() !== '') {
          const value = formatNumber(el.value);
          const data = {
            value: value,
            id: el.id,
            currency: inputGroup.querySelector('.input-group-text').textContent,
          };
          amounts.push(data);
          this.result.push(data);
        }
      }
    });
    return amounts;
  }

  getEmailValues() {
    const emails = [];
    this.container.querySelectorAll('input[type="email"]').forEach((el) => {
      if (el.value !== '') {
        const data = {
          value: el.value,
          id: el.id,
        };
        emails.push(data);
        this.result.push(data);
      }
    });
    return emails;
  }

  getTelValues() {
    const tels = [];
    this.container.querySelectorAll('input[type="tel"]').forEach((el) => {
      if (el.value !== '') {
        const data = {
          value: el.value,
          id: el.id,
        };
        tels.push(data);
        this.result.push(data);
      }
    });
    return tels;
  }

  getUploadedFiles() {
    const fileGroups = [];
    this.container.querySelectorAll('input[type="file"]').forEach((el) => {
      if (el.files && el.files.length > 0) {
        const files = [];
        Array.from(el.files).forEach((file, fileIndex) => {
          files.push({
            fileIndex: fileIndex,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          });
        });
        const data = {
          inputId: el.id,
          files: files,
        };
        fileGroups.push(data);
        this.result.push(data);
      }
    });
    return fileGroups;
  }

  getCheckboxValues() {
    const checkboxGroups = {};
    this.container
      .querySelectorAll('.form-input .list-group-item .form-check-input')
      .forEach((el, index) => {
        if (el.checked) {
          let groupName = el.name;
          if (!groupName) {
            const formInput = el.closest('.form-input');
            const label = formInput ? formInput.querySelector('.form-label span') : null;
            groupName = label ? label.textContent.trim() : `group_${index}`;
          }

          if (!checkboxGroups[groupName]) {
            checkboxGroups[groupName] = [];
          }

          const itemData = {
            id: el.id,
            value: el.value,
            checked: el.checked,
            label: el.nextElementSibling ? el.nextElementSibling.textContent.trim() : '',
          };

          checkboxGroups[groupName].push(itemData);
          this.result.push({ itemData: itemData, groupName: groupName });
        }
      });
    return checkboxGroups;
  }

  getRadioValues() {
    const radioGroups = {};
    this.container.querySelectorAll('input[type="radio"]').forEach((el, index) => {
      if (el.checked) {
        const groupName = el.name || `radio_group_${index}`;

        const itemData = {
          id: el.id,
          value: el.value,
          checked: el.checked,
          label: el.nextElementSibling ? el.nextElementSibling.textContent.trim() : '',
        };

        radioGroups[groupName] = itemData;
        this.result.push({ itemData: itemData, groupName: groupName });
      }
    });
    return radioGroups;
  }

  getDateValues() {
    const dates = [];
    this.container.querySelectorAll('input[type="text"]').forEach((el, index) => {
      if (el.value !== '') {
        const placeholder = el.placeholder ? el.placeholder.toLowerCase() : '';
        let type = 'unknown';

        if (placeholder.includes('date') && placeholder.includes('time')) {
          type = 'datetime';
        } else if (placeholder.includes('date') && placeholder.includes('range')) {
          type = 'daterange';
        } else if (placeholder.includes('date')) {
          type = 'date';
        } else if (placeholder.includes('time')) {
          type = 'time';
        }

        if (type !== 'unknown') {
          const data = {
            type: type,
            value: el.value,
            id: el.id,
          };
          dates.push(data);
          this.result.push(data);
        }
      }
    });
    return dates;
  }

  getDropdownValues() {
    const dropdowns = [];

    this.container
      .querySelectorAll('.dropdown:not(.multiple-input) .dropdown-toggle')
      .forEach((el) => {
        const selectedData = $(el).data('selected');
        const selectedText = el.textContent.trim();

        const isSelected =
          selectedData ||
          (selectedText && !selectedText.toLowerCase().includes('select') && selectedText !== '');

        if (isSelected) {
          const data = {
            text: selectedData ? selectedData.label : selectedText,
            value: selectedData ? selectedData.value : el.dataset.value || selectedText,
            selected: true,
            id: el.id || el.closest('.dropdown').id,
          };
          dropdowns.push(data);
          this.result.push(data);
        }
      });

    this.container
      .querySelectorAll('.dropdown.multiple-input, .multiple-input')
      .forEach((container) => {
        const containerId = container.id;
        const chipsContainer = document.querySelector(`#dropdownChipsContainer_${containerId}`);

        if (chipsContainer) {
          const selectedItems = [];
          chipsContainer.querySelectorAll('.chip').forEach((chip, itemIndex) => {
            const text = chip.querySelector('span').textContent.trim();
            const value = chip.dataset.value;
            selectedItems.push({
              itemIndex: itemIndex,
              text: text,
              value: value,
            });
          });

          if (selectedItems.length > 0) {
            const data = {
              type: 'multiple',
              items: selectedItems,
              containerId: containerId,
            };
            dropdowns.push(data);
            this.result.push(data);
          }
        }
      });

    return dropdowns;
  }

  getAutocompleteValues() {
    const autocomplete = [];

    this.container.querySelectorAll('.autocomplete-input').forEach((el) => {
      const isMultiple =
        el.closest('.multi-autocomplete') || el.closest('#multiAutocompleteTemplate');

      if (!isMultiple && el.value !== '') {
        const data = {
          type: 'single',
          text: el.value,
          value: el.dataset.value || el.value,
          id: el.id || el.closest('[id]')?.id,
        };
        autocomplete.push(data);
        this.result.push(data);
      }
    });

    this.container
      .querySelectorAll(
        '.multi-autocomplete, #multiAutocompleteTemplate, [id*="multiAutoComplete"], [id*="MultiAutocomplete"]'
      )
      .forEach((container) => {
        const chipsContainer = container.querySelector('.chips-container');

        if (chipsContainer) {
          const selectedValues = [];
          chipsContainer.querySelectorAll('.chip').forEach((chip) => {
            const value = chip.dataset.value;
            if (value) selectedValues.push(value);
          });

          if (selectedValues.length > 0) {
            const data = {
              id: container.id,
              value: selectedValues,
            };
            autocomplete.push(data);
            this.result.push(data);
          }
        }
      });

    this.container.querySelectorAll('[id]').forEach((container) => {
      if (container._multiAutocomplete && container._multiAutocomplete.selectedItems) {
        const selectedItems = container._multiAutocomplete.selectedItems;
        if (selectedItems.length > 0) {
          const selectedValues = selectedItems.map((item) => item.value);
          const data = {
            id: container.id,
            value: selectedValues,
          };
          autocomplete.push(data);
          this.result.push(data);
        }
      }
    });

    return autocomplete;
  }

  reset() {
    const inputs = this.container.querySelectorAll(
      'input:not([readonly]), textarea:not([readonly])'
    );
    inputs.forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else if (input.type === 'file') {
        input.value = '';
      } else {
        input.value = '';
      }
      input.classList.remove('is-invalid');
    });

    this.container.querySelectorAll('.dropdown-toggle').forEach((button) => {
      if (button.classList.contains('multi-dropdown-toggle')) {
        button.innerHTML = 'Select Options';
      } else {
        button.textContent = 'Select Option';
      }
    });

    this.container.querySelectorAll('.autocomplete-input').forEach((input) => {
      input.value = '';
    });

    this.container.querySelectorAll('.selected-item').forEach((item) => {
      item.remove();
    });
  }
}
