class PlSearch {
    #pages = {};
    constructor() {
        this.#pages = {
        pl: { pallet_code: '', job_id: '', plan_id: '', part_name: '', sig: 0, qty: 0, process_id: 0, next_process_id: 0, zone_code: '', next_zone_code: '', status: '' },
        zone: { zone_code: '', zone_name: '', is_active: '' },
        machine: { machine_id: '', machine_name: '', zone_code: '', zone_name: '', is_active: '' }
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

const PlSearchInstance = new PlSearch();