class PlDashboard {
  postApi = null;
  baseURL = 'http://localhost:3002';
  constructor(){
      this.postApi = new Axios({
        baseURL: this.baseURL,
      });
  }
  async getZoneDashboard(page, pageSize){
    let response;
    try {
      const zone_code = $('.zone-code').val() || '';
      const params = { page, pageSize };
      if (zone_code) {
        params.zone_code = zone_code;
      }
      response = await this.postApi.get('/api/v1/pl/zone_dashboard', { params });
    } catch (err) {
      console.error('API Error:', err);
      Notification.error();
    } finally {
    }
    return response.data
  }
    
  async getProcessDashboard(page, pageSize){
    try {
      const zone_code = $('.zone-code').val() || '';
      const params = { page, pageSize };
      if (zone_code) {
        params.zone_code = zone_code;
      }
      console.log('params' ,params)
      const response = await this.postApi.get('/api/v1/pl/process_dashboard', { params });
      return response.data
    } catch (err) {
      console.error('API Error:', err);
    }
  }
}

const PlDashboardInstance = new PlDashboard();