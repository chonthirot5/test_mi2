class Alert {
  static success(config = { title: '', text: '', confirmButtonText, html: '' }) {
    Swal.fire({
      title: config.title,
      text: config.text,
      html: config.html,
      icon: 'success',
      confirmButtonText: config.confirmButtonText ?? 'close',
    });
  }

  static warning(config = { title: '', text: '', confirmButtonText, html: '' }) {
    Swal.fire({
      title: config.title,
      text: config.text,
      html: config.html,
      icon: 'warning',
      confirmButtonText: config.confirmButtonText ?? 'close',
    });
  }

  static info(config = { title: '', text: '', confirmButtonText, html: '' }) {
    Swal.fire({
      title: config.title,
      html: config.html,
      text: config.text,
      icon: 'info',
      confirmButtonText: config.confirmButtonText ?? 'close',
    });
  }

  static error(config = { title: '', text: '', confirmButtonText, html: '' }) {
    Swal.fire({
      title: config.title,
      html: config.html,
      text: config.text,
      icon: 'error',
      confirmButtonText: config.confirmButtonText ?? 'close',
    });
  }
}
