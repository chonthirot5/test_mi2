class FormValidator {
  constructor(config = {}) {
    this.containerSelector = config.containerSelector || 'form';
    this.requiredClass = config.requiredClass || 'required';
    this.errorClass = config.errorClass || 'error';
    this.realTimeValidation = config.realTimeValidation !== false;
    this.validateOnInit = config.validateOnInit !== false;

    this.validationCallbacks = [];
    this.container = $(this.containerSelector);

    this.init();
  }

  init() {
    if (this.realTimeValidation) {
      this.setupEventListeners();
    }

    if (this.validateOnInit) {
      this.updateButtonStates();
    }
  }

  setupEventListeners() {
    const container = this.container;

    container.on('click', () => {
      this.updateButtonStates();
    });

    container.on(
      'click',
      `
        .form-input.${this.requiredClass} .dropdown-menu li, 
        .form-input.${this.requiredClass} .chips-container .chip-remove,
        .form-input.${this.requiredClass} .file-preview-wrapper .remove-btn-file
      `,
      () => {
        this.updateButtonStates();
      }
    );

    container.on(
      'change',
      ` 
        .form-input.${this.requiredClass} .flatpickr-input, 
        .form-input.${this.requiredClass} input[type="file"], 
        .form-input.${this.requiredClass} input[type="checkbox"], 
        .form-input.${this.requiredClass} input[type="radio"]
      `,
      () => {
        this.updateButtonStates();
      }
    );

    container.on('input change', `.form-input.${this.requiredClass} .autocomplete-input`, () => {
      this.updateButtonStates();
    });
  }

  validateRequiredFields() {
    const invalidFields = [];
    const requiredFields = this.container.find(`.form-input.${this.requiredClass}`);

    requiredFields.each((_index, element) => {
      const field = $(element);
      const validation = this.validateSingleField(field);

      if (!validation.isValid) {
        invalidFields.push({
          element: field,
          fieldName: validation.fieldName,
          message: validation.message,
        });
      }
    });

    return {
      isValid: invalidFields.length === 0,
      invalidFields: invalidFields,
    };
  }

  // MAIN CHECK
  validateSingleField(field) {
    let isEmpty = true;
    let fieldValue = '';
    const fieldName = field.find('.form-label').text().trim();

    this.clearFieldError(field);

    const dropdown = field.find('.dropdown-toggle');
    const autocomplete = field.find('.autocomplete-input');
    const fileInput = field.find('input[type="file"]');
    const checkboxes = field.find('input[type="checkbox"]');
    const radios = field.find('input[type="radio"]');
    const multiDropdown = field.hasClass('multi-dropdown');
    const multiAutocomplete = field.attr('id') && field[0]._multiAutocomplete;
    const dateInput = field.find('.flatpickr-input, input[type="date"]');

    if (autocomplete.length && !multiAutocomplete) {
      fieldValue = autocomplete.val();
      isEmpty = !fieldValue || fieldValue.toString().trim() === '';
    } else if (dropdown.length && !multiDropdown) {
      const selectedData = dropdown.data('selected');
      isEmpty = !selectedData;
    } else if (fileInput.length) {
      const uploadedFiles = field[0]._uploadedFiles || [];
      isEmpty = uploadedFiles.length === 0;
      fieldValue = uploadedFiles.map((f) => f.name || f.original_name || f.path).join(', ');
    } else if (checkboxes.length) {
      const checked = checkboxes.filter(':checked');
      isEmpty = checked.length === 0;
      fieldValue = checked
        .map((_, el) => $(el).attr('id'))
        .get()
        .join(', ');
    } else if (radios.length) {
      const checked = radios.filter(':checked');
      isEmpty = checked.length === 0;
      fieldValue = checked.length ? checked.attr('id') : '';
    } else if (multiDropdown) {
      isEmpty = !field[0]._multiDropdown || field[0]._multiDropdown.selectedItems.length === 0;
    } else if (multiAutocomplete) {
      isEmpty =
        !field[0]._multiAutocomplete || field[0]._multiAutocomplete.selectedItems.length === 0;
    } else if (dateInput.length) {
      fieldValue = dateInput.val();
      isEmpty = !fieldValue || fieldValue.toString().trim() === '';
    }

    const isValid = !isEmpty;

    if (!isValid) {
      field.addClass(this.errorClass);
    }

    return {
      isValid: isValid,
      fieldName: fieldName,
      message: isValid ? '' : `${fieldName} is required`,
      value: fieldValue,
    };
  }

  clearFieldError(field) {
    field.removeClass(this.errorClass);
  }

  clearAllErrors() {
    const requiredFields = this.container.find(`.form-input.${this.requiredClass}`);
    requiredFields.each((_index, element) => {
      this.clearFieldError($(element));
    });
  }

  updateButtonStates() {
    const validation = this.validateRequiredFields();

    this.triggerValidationCallbacks(validation);

    return validation;
  }

  validateBeforeSave(callback, errorCallback) {
    const validation = this.validateRequiredFields();

    if (validation.isValid) {
      if (typeof callback === 'function') {
        callback(validation);
      }
      return true;
    } else {
      if (typeof errorCallback === 'function') {
        errorCallback(validation);
      }
      return false;
    }
  }

  onValidationChange(callback) {
    if (typeof callback === 'function') {
      this.validationCallbacks.push(callback);
    }
  }

  offValidationChange(callback) {
    this.validationCallbacks = this.validationCallbacks.filter((cb) => cb !== callback);
  }

  triggerValidationCallbacks(validation) {
    this.validationCallbacks.forEach((callback) => {
      try {
        callback(validation);
      } catch (error) {
        console.error('FormValidator callback error:', error);
      }
    });
  }

  validate() {
    return this.updateButtonStates();
  }

  addRequired(selector) {
    const field = this.container.find(selector);
    field.addClass(this.requiredClass);
    this.updateButtonStates();
  }

  removeRequired(selector) {
    const field = this.container.find(selector);
    field.removeClass(this.requiredClass);
    this.clearFieldError(field);
    this.updateButtonStates();
  }

  getRequiredFields() {
    return this.container.find(`.form-input.${this.requiredClass}`);
  }

  reset() {
    this.clearAllErrors();
    this.updateButtonStates();
  }

  destroy() {
    this.container.off('.formvalidator');
    this.validationCallbacks = [];
  }
}
