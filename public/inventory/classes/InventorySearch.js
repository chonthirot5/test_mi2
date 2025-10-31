class InventorySearch {
  #pages = {};

  constructor() {
    this.#pages = {
      data: {
        module: 'inventory',
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

const INVENTORY_SEARCH = new InventorySearch();
