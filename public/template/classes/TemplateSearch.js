class TemplateSearch {
  #pages = {};

  constructor() {
    this.#pages = {
      list: {
        orderDate: '',
        status: '',
        productNames: [],
      },
      data: {
        module: 'template',
      },
    };
  }

  setSearch(pageKey, obj) {
    if (!this.#pages[pageKey]) this.#pages[pageKey] = {};
    this.#pages[pageKey] = { ...this.#pages[pageKey], ...obj };
  }

  getSearch(pageKey) {
    return this.#pages[pageKey] || {};
  }
}

const TEMPLATE_SEARCH = new TemplateSearch();
