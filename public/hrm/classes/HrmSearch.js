class HrmSearch {
  #pages = {};

  constructor() {
    this.#pages = {
      data: {
        module: 'hrm',
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

const HRM_SEARCH = new HrmSearch();
