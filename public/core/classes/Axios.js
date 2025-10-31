class Axios {
  static loadingShown = false;
  static loadingCancelled = false;
  static loadingTimer = null;
  static customContentEl = null;
  static _modalContent = '';
  static waitTime = 10000;
  static delay = 500;
  static controller = null;

  constructor(config = {}) {
    this.waitTime = config.waitTime || Axios.waitTime;
    this.controller = config.controller || new AbortController();
    this.axiosInstance = axios.create(config);
  }

  static showLoadingIcon(delay = Axios.delay) {
    if (Axios.loadingShown) return;

    Axios.loadingShown = false;
    Axios.loadingCancelled = false;

    Axios.loadingTimer = setTimeout(() => {
      if (Axios.loadingCancelled) return;

      Axios.loadingShown = true;
      Swal.fire({
        html: `<div class="spinner-border" role="status"></div>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: { popup: 'no-bg-loading-popup' },
        willClose: () => {
          Axios.loadingShown = false;
          Axios.loadingCancelled = false;
        },
      });
    }, delay);
  }

  static set modalContent(html) {
    Axios._modalContent = html;
    if (Axios.customContentEl) {
      Axios.customContentEl.innerHTML = html;
    }
  }

  static get modalContent() {
    return Axios._modalContent;
  }

  static showLoadingModal(delay = Axios.delay) {
    if (Axios.loadingShown) return;
    Axios._modalContent = '';

    let timerInterval;
    Axios.loadingShown = false;
    Axios.loadingCancelled = false;

    Axios.loadingTimer = setTimeout(() => {
      if (Axios.loadingCancelled) return;

      Axios.loadingShown = true;
      Swal.fire({
        html: `
                <div class="loading-modal">
                  <div class="spinner-border" role="status"></div>
                  <div>Loading...</div>
                  <div>
                    <span id="elapsed-time">0.0</span> s
                  </div>
                  <div id="custom-content">${Axios._modalContent}</div>
                  <div id="cancelRequest" style="display:none;">ต้องการยกเลิก Request?</div>
                  <div>
                    <button id="cancelRequestBtn" class="btn btn-sm btn-outline-danger" style="display:none;">
                      Cancel Request
                    </button>
                  </div>
                </div>
              `,
        didOpen: () => {
          const start = Date.now();
          const timerEl = Swal.getHtmlContainer().querySelector('#elapsed-time');
          const cancelBtn = Swal.getHtmlContainer().querySelector('#cancelRequestBtn');
          const cancelText = Swal.getHtmlContainer().querySelector('#cancelRequest');
          Axios.customContentEl = Swal.getHtmlContainer().querySelector('#custom-content');

          timerInterval = setInterval(() => {
            const seconds = ((Date.now() - start) / 1000).toFixed(1);
            timerEl.textContent = seconds;
          }, 100);

          setTimeout(() => {
            cancelText.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            cancelBtn.addEventListener('click', () => {
              if (Axios.controller) {
                Axios.controller.abort();
                Axios.hideLoading();
              }
            });
          }, Axios.waitTime);
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willClose: () => {
          clearInterval(timerInterval);
          Axios.loadingShown = false;
          Axios.loadingCancelled = false;
        },
      });
    }, delay);
  }

  static hideLoading() {
    if (Axios.loadingTimer) {
      clearTimeout(Axios.loadingTimer);
      Axios.loadingTimer = null;
    }

    if (!Axios.loadingShown) {
      Axios.loadingCancelled = true;
      return;
    }

    Swal.close();
    Axios.loadingShown = false;
    Axios.loadingCancelled = false;
  }

  async request(method, url, data = {}, config = {}) {
    Axios.controller = new AbortController();

    try {
      const response = await this.axiosInstance({
        method,
        url,
        data,
        signal: config.signal || Axios.controller.signal,
        ...config,
      });

      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  get(url, config = {}) {
    return this.request('get', url, null, config);
  }

  post(url, data = {}, config = {}) {
    return this.request('post', url, data, config);
  }

  put(url, data = {}, config = {}) {
    return this.request('put', url, data, config);
  }

  delete(url, config = {}) {
    return this.request('delete', url, null, config);
  }
}
