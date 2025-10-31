class Notification {
  static success(message = 'SUCCESS', icon = 'fa-solid fa-circle-check') {
    const notify = $(`<div class="success"><i class="${icon}"></i>${message}</div>`);
    notify.jqxNotification({
      position: 'top-right',
    });
    notify.jqxNotification('open');
    notify.on('close', () => notify.remove());
  }

  static warning(message = 'WARNING', icon = 'fa-solid fa-triangle-exclamation') {
    const notify = $(`<div class="warning"><i class="${icon}"></i>${message}</div>`);
    notify.jqxNotification({
      position: 'top-right',
    });
    notify.jqxNotification('open');
    notify.on('close', () => notify.remove());
  }

  static error(message = 'ERROR', icon = 'fa-solid fa-circle-exclamation') {
    const notify = $(`<div class="error"><i class="${icon}"></i>${message}</div>`);
    notify.jqxNotification({
      position: 'top-right',
    });
    notify.jqxNotification('open');
    notify.on('close', () => notify.remove());
  }

  static info(message = 'INFO', icon = 'fa-solid fa-circle-info') {
    const notify = $(`<div class="info"><i class="${icon}"></i>${message}</div>`);
    notify.jqxNotification({
      position: 'top-right',
    });
    notify.jqxNotification('open');
    notify.on('close', () => notify.remove());
  }
}
