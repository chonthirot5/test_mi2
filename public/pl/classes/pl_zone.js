class PlZone {
  postApi = null;
  baseURL = 'http://localhost:3002';
  constructor(){
      this.postApi = new Axios({
        baseURL: this.baseURL,
      });
  }

  async getZone(page, pageSize) {
    let response;
    try {
      const params = { page, pageSize };
      const searchObj  = PlSearchInstance.getSearch('zone')
      if (searchObj.zone_code) params.zone_code = searchObj.zone_code;
      if (searchObj.zone_name) params.zone_name = searchObj.zone_name;
      if (searchObj.is_active === '1' || searchObj.is_active === '0') params.is_active = searchObj.is_active;
      response = await this.postApi.get('/api/v1/pl/get_zone', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }
  
  async getSelectZone() {
    try {
      const response = await this.postApi.get('/api/v1/pl/get_zone',);
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getZoneOne(obj) {
    try {
      const { zone_code } = obj
      const params = {
        ...(zone_code && { zone_code }),
      };
      const response = await this.postApi.get('/api/v1/pl/get_zone', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async createZone(data) {
    try {
      const response = await this.postApi.post('/api/v1/pl/create_zone', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async updateZone(data) {
    try {
      const response = await this.postApi.put('/api/v1/pl/update_zone', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }
  
  async deleteZone(data){
    try {
      const response = await this.postApi.delete('/api/v1/pl/delete_zone', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async cancelZone(data) {
    try {
      const response = await this.postApi.put('/api/v1/pl/cancelled_zone', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);;
    }
  }
}

const PlZoneInstance = new PlZone();