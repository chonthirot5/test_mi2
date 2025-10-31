class ConfirmModal {
  constructor(config = {}) {
    this.confirmHeader = config.confirmHeader || 'CONFIRM DELETE';
    this.confirmHeaderSelector = config.confirmHeaderSelector || '#confirmHeader';
    this.confirmMessage = config.confirmMessage || 'Are you sure you want to delete?';
    this.confirmMessageSelector = config.confirmMessageSelector || '#confirmMessage';
    this.confirmButtonSelector = config.confirmButtonSelector || '#confirmButtonConfirmModal';
    this.cancelButtonSelector = config.cancelButtonSelector || '#cancelButtonConfirmModal';
    this.init();
  }

  init() {
    $(this.confirmHeaderSelector).text(this.confirmHeader);
    $(this.confirmMessageSelector).html(this.confirmMessage);
  }

  onConfirm(callback) {
    $(this.confirmButtonSelector)
      .off('click')
      .on('click', () => {
        callback?.(true);
      });

    $(this.cancelButtonSelector)
      .off('click')
      .on('click', () => callback?.(false));
  }
}
