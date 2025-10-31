class TemplateApi {
  // baseURL = `http://${API_CONFIG.URL}:${API_CONFIG.PORT}/api/v1/color-limit`;

  baseUrl = 'https://httpbin.org';
  uploadUrl = 'http://localhost:3001';
  fileDestination = 'inventory/uploads/zz';
  postApi = null;

  constructor() {
    this.postApi = new Axios({
      baseURL: this.baseUrl,
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
    });
  }

  async test() {
    try {
      const res = await this.postApi.get('/delay/3');
      return res;
    } catch (err) {
      throw new Error(err);
    }
  }
}

const TEMPLATE_API = new TemplateApi();
