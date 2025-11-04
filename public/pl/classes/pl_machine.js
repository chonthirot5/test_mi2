class PlMachine {
  postApi = null;
  baseURL = 'http://localhost:3002';
  constructor(){
      this.postApi = new Axios({
        baseURL: this.baseURL,
      });
  }

  async getMachine(page, pageSize) {
    let response;
    try {
      const params = { page, pageSize };
      const { machine_id, machine_name, zone_code, is_active } = PlElementMachineInstance.getData();
      if (zone_code) params.zone_code = zone_code;
      if (machine_name) params.machine_name = machine_name;
      if (zone_code) params.zone_code = zone_code;
      if (is_active !== null && is_active !== undefined) {
        params.is_active = is_active;
      }
      if (machine_id) params.machine_id = machine_id;
      response = await this.postApi.get('/api/v1/pl/get_machine', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getSelectMachine() {
    try {
      const response = await this.postApi.get('/api/v1/pl/get_machine',);
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getMachineOne(page, pageSize) {
    try {
      const params = { page, pageSize };
      const { machine_id } = PlElementMachineInstance.getData();
      if (machine_id) params.machine_id = machine_id;
      const response = await this.postApi.get('/api/v1/pl/get_machine', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async createMachine(data) {
    try {
      const response = await this.postApi.post('/api/v1/pl/create_machine', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async updateMachine(data) {
    try {
      const response = await this.postApi.put('/api/v1/pl/update_machine', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async cancelMachine(data) {
    try {
      const response = await this.postApi.put('/api/v1/pl/cancelled_machine', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async isRequestCanceled(err) {
    return (
      err?.message?.toLowerCase().includes('canceled') ||
      err?.code === 'ERR_CANCELED' ||
      err?.name === 'CanceledError'
    );
  }
}


const PlMachineInstance = new PlMachine();
