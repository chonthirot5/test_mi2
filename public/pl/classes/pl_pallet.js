class PlPallet {
  postApi = null;
  baseURL = 'http://localhost:3002';
  constructor(){
      this.postApi = new Axios({
        baseURL: this.baseURL,
      });
  }

  async getDataPlan(obj){
    try {
      const { machine_id } = obj
      const params = {};
      if(machine_id) params.machine_id
      const response = {
        success: 1,
        data: [
          { job_id: "J825100001", plan_id: 2500001, machine_id: "5420", machine_name: "SANWA", process_id: 5, process_name: "Die-cut", zone_code: "B", zone_name: "รอยต่อ 1-2 ไดคัท", next_machine_id: "5000", next_machine_name: "Lexcus 1", next_process_id: 23, next_process_name: "Paper Sheeter", next_zone_code: "PS", next_zone_name: "จัดเตรียมกระดาษ", sig: 1, sig_folding: "", part_name: "Sheet A", qty: 100, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J825100002", plan_id: 2500002, machine_id: "5000", machine_name: "Lexcus 1", process_id: 23, process_name: "Paper Sheeter", zone_code: "PS", zone_name: "จัดเตรียมกระดาษ", next_machine_id: "3817", next_machine_name: "WEB 35M1", next_process_id: 18, next_process_name: "Web", next_zone_code: "J", next_zone_name: "โรง 4 พิมพ์เว็บ", sig: 1, sig_folding: "", part_name: "Sheet A2", qty: 80, pallet_type: "พาเลทตัวอย่าง", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J825100003", plan_id: 2500003, machine_id: "5510", machine_name: "Glue-1", process_id: 22, process_name: "GLUE Packaging", zone_code: "GMP", zone_name: "GMP", next_machine_id: "3604", next_machine_name: "L640APC-B", next_process_id: 19, next_process_name: "Sheet", next_zone_code: "A", next_zone_name: "โรง 1 พิมพ์ชีท", sig: 1, sig_folding: "", part_name: "Sheet Large", qty: 120, pallet_type: "พาเลท NCR", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J825100004", plan_id: 2500004, machine_id: "5525", machine_name: "ASAHI API300", process_id: 5, process_name: "Die-cut", zone_code: "B", zone_name: "รอยต่อ 1-2 ไดคัท", next_machine_id: "3815", next_machine_name: "WEB 35K1", next_process_id: 21, next_process_name: "Web", next_zone_code: "J", next_zone_name: "โรง 4 พิมพ์เว็บ", sig: 1, sig_folding: "", part_name: "Print Web 38S", qty: 60, pallet_type: "พาเลท NCR", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "YES", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660032", job_qty: 100000 },
          { job_id: "J52500005", plan_id: 2500005, machine_id: "5530", machine_name: "Metal Detector NIKKA DENSOK", process_id: 58, process_name: "Window Patching Packaging", zone_code: "K", zone_name: "ชั้น 2 หลังการพิมพ์เครื่อง", next_machine_id: "3828", next_machine_name: "WEB 35K6", next_process_id: 21, next_process_name: "Web", next_zone_code: "J", next_zone_name: "โรง 4 พิมพ์เว็บ", sig: 1, sig_folding: "", part_name: "Print Web 35K5", qty: 70, pallet_type: "พาเลทตัวอย่าง", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500006", plan_id: 2500006, machine_id: "5420", machine_name: "SANWA", process_id: 5, process_name: "Die-cut", zone_code: "B", zone_name: "รอยต่อ 1-2 ไดคัท", next_machine_id: "5001", next_machine_name: "Lexcus 2", next_process_id: 23, next_process_name: "Paper Sheeter", next_zone_code: "PS", next_zone_name: "จัดเตรียมกระดาษ", sig: 1, sig_folding: "", part_name: "Lexcus Sheet 1", qty: 120, pallet_type: "พาเลทตัวอย่าง", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "YES", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500007", plan_id: 2500007, machine_id: "5103", machine_name: "Heidelberg", process_id: 7, process_name: "Folding", zone_code: "F", zone_name: "F", next_machine_id: "5104", next_machine_name: "Heidelberg", next_process_id: 7, next_process_name: "Folding", next_zone_code: "F", next_zone_name: "F", sig: 1, sig_folding: "", part_name: "Folding Heidelberg", qty: 90, pallet_type: "พาเลทตัวอย่าง", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500008", plan_id: 2500008, machine_id: "5122", machine_name: "Trimmer 1", process_id: 20, process_name: "Trimming", zone_code: "H", zone_name: "H", next_machine_id: "5154", next_machine_name: "Purple Magna", next_process_id: 47, next_process_name: "Cover Edge", next_zone_code: "GMP", next_zone_name: "GMP", sig: 1, sig_folding: "", part_name: "Trimming Head 1", qty: 25, pallet_type: "พาเลทตัวอย่าง", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500009", plan_id: 2500009, machine_id: "5741", machine_name: "GS-500F8", process_id: 13, process_name: "Punch", zone_code: "D", zone_name: "โรง 3 ทำมือ", next_machine_id: "5146", next_machine_name: "เครื่องตัด C/B แผ่นใหญ่", next_process_id: 1, next_process_name: "Board Cutter", next_zone_code: "K", next_zone_name: "ชั้น 2 หลังการพิมพ์เครื่อง", sig: 1, sig_folding: "", part_name: "Board Cutter Small", qty: 30, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "YES", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500010", plan_id: 2500010, machine_id: "5200", machine_name: "POLAR115-X", process_id: 20, process_name: "Trimming", zone_code: "H", zone_name: "H", next_machine_id: "5201", next_machine_name: "EX380 JBI", next_process_id: 26, next_process_name: "Punch", next_zone_code: "K", next_zone_name: "ชั้น 2 หลังการพิมพ์เครื่อง", sig: 1, sig_folding: "", part_name: "Trimming POLAR", qty: 50, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "YES", is_send_out: "YES", plan_date: "2025-10-02", technician_id: "2660032", job_qty: 100000 },
          { job_id: "J52500011", plan_id: 2500011, machine_id: "5801", machine_name: "ผ่านกาว", process_id: 2, process_name: "Case In", zone_code: "C", zone_name: "โรง 2 เย็บเข็ม", next_machine_id: "5202", next_machine_name: "PU2 Auto Punching(KUGLER)", next_process_id: 26, next_process_name: "Punch", next_zone_code: "K", next_zone_name: "ชั้น 2 หลังการพิมพ์เครื่อง", sig: 1, sig_folding: "", part_name: "Punch Auto 1", qty: 30, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "YES", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500012", plan_id: 2500012, machine_id: "5808", machine_name: "French join", process_id: 50, process_name: "French join", zone_code: "I", zone_name: "โรง 5 ไสกาว", next_machine_id: "5322", next_machine_name: "Buhrs 3000", next_process_id: 15, next_process_name: "Polywrap", next_zone_code: "K", next_zone_name: "ชั้น 2 หลังการพิมพ์เครื่อง", sig: 1, sig_folding: "", part_name: "Polywrap Complete", qty: 45, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500013", plan_id: 2500013, machine_id: "5926", machine_name: "Silk Screen#2 Manual", process_id: 16, process_name: "Spot UV", zone_code: "E", zone_name: "โรง 3 เคลือบ", next_machine_id: "5525", next_machine_name: "ASAHI API300", next_process_id: 5, next_process_name: "Die-cut โรง2", next_zone_code: "B", next_zone_name: "รอยต่อ 1-2 ไดคัท", sig: 1, sig_folding: "", part_name: "Die-cut 1", qty: 55, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500014", plan_id: 2500014, machine_id: "5525", machine_name: "ASAHI API300", process_id: 5, process_name: "Die-cut โรง2", zone_code: "B", zone_name: "รอยต่อ 1-2 ไดคัท", next_machine_id: "5933", next_machine_name: "เครื่องทำบล็อกสกรีน", next_process_id: 16, next_process_name: "Spot UV", next_zone_code: "C", next_zone_name: "โรง 2 เย็บเข็ม", sig: 1, sig_folding: "", part_name: "Die-cut 2", qty: 70, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500015", plan_id: 2500015, machine_id: "5180", machine_name: "Astronic", process_id: 18, process_name: "Sewing", zone_code: "K", zone_name: "ชั้น 2 หลังการพิมพ์เครื่อง", next_machine_id: "3403", next_machine_name: "CD440A", next_process_id: 19, next_process_name: "Sheet", next_zone_code: "A", next_zone_name: "โรง 1 พิมพ์ชีท", sig: 1, sig_folding: "", part_name: "Sewing Astronic", qty: 40, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500016", plan_id: 2500016, machine_id: "0002", machine_name: "FG", process_id: 33, process_name: "FG", zone_code: "FG", zone_name: "Finish Good", next_machine_id: "3607", next_machine_name: "L640C", next_process_id: 19, next_process_name: "Sheet", next_zone_code: "A", next_zone_name: "โรง 1 พิมพ์ชีท", sig: 1, sig_folding: "", part_name: "Finish Goods", qty: 50, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "YES", is_send_out: "YES", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500017", plan_id: 2500017, machine_id: "5109", machine_name: "Heidelberg", process_id: 7, process_name: "Folding", zone_code: "F", zone_name: "F", next_machine_id: "3606", next_machine_name: "GL844", next_process_id: 19, next_process_name: "Sheet", next_zone_code: "A", next_zone_name: "โรง 1 พิมพ์ชีท", sig: 1, sig_folding: "", part_name: "Sheet AKIYAMA", qty: 90, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500018", plan_id: 2500018, machine_id: "5106", machine_name: "STAHL", process_id: 7, process_name: "Folding", zone_code: "F", zone_name: "F", next_machine_id: "3822", next_machine_name: "WEB 442K1", next_process_id: 21, next_process_name: "Web", next_zone_code: "J", next_zone_name: "โรง 4 พิมพ์เว็บ", sig: 1, sig_folding: "", part_name: "Print Web 35K7", qty: 65, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500019", plan_id: 2500019, machine_id: "3804", machine_name: "WEB 38 S", process_id: 18, process_name: "Web", zone_code: "J", zone_name: "โรง 4 พิมพ์เว็บ", next_machine_id: "5108", next_machine_name: "Heidelberg", next_process_id: 7, next_process_name: "Folding", next_zone_code: "F", next_zone_name: "F", sig: 1, sig_folding: "", part_name: "Folding STAHL", qty: 50, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J52500020", plan_id: 2500020, machine_id: "3521", machine_name: "AKIYAMA", process_id: 19, process_name: "Sheet", zone_code: "A", zone_name: "โรง 1 พิมพ์ชีท", next_machine_id: "5110", next_machine_name: "Heidelberg", next_process_id: 7, next_process_name: "Folding", next_zone_code: "F", next_zone_name: "F", sig: 1, sig_folding: "", part_name: "Folding Heidelberg 2", qty: 100, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "YES", is_send_out: "NO", plan_date: "2025-10-02", technician_id: "2660032", job_qty: 100000 },
          { job_id: "J52500021", plan_id: 2500021, machine_id: "3408", machine_name: "LS244", process_id: 19, process_name: "Sheet", zone_code: "A",  zone_name: "โรง 1 พิมพ์ชีท", next_machine_id: "0002", next_machine_name: "FG", next_process_id: 33, next_process_name: "FG", next_zone_code: "FG", next_zone_name: "Finish Good", sig: 1, sig_folding: "", part_name: "Folding Heidelberg 2", qty: 1000, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-05", technician_id: "2660031", job_qty: 100000 },
          { job_id: "J825100001", plan_id: 2500022, machine_id: "5143", machine_name: "Warehouse - Trimmer 2", process_id: 18, process_name: "Warehouse - Trimming", zone_code: "PS",  zone_name: "จัดเตรียมกระดาษ", next_machine_id: "5528", next_machine_name: "Konica Minolta C3070", next_process_id: 9, next_process_name: "Digital Print", next_zone_code: "GMP", next_zone_name: "GMP", sig: 1, sig_folding: "", part_name: "Folding Heidelberg 2", qty: 1000, pallet_type: "พาเลททั่วไป", is_wait_dry: 0, wait_dry_hr: 0, is_last_pallet: "NO", is_send_out: "NO", plan_date: "2025-10-05", technician_id: "2660031", job_qty: 1000, timesheet_remark: "test remark", trim_detail: 'WOODFREE PRO NEW (SCG) 70g 25" x 35.5"', trim_size: "12.5x17.5", trim_height: 24, trims: [{ qty_paper: 10, paper_per_qty: 8, sequence: 1 }, { qty_paper: 1, paper_per_qty: 5, sequence: 2 }]},

        ]
      }
      return response
    } catch (err) {
      throw new Error(err);
    }
  }

  async getDataMachine(obj){
    try {
      const { machine_id } = obj
      const params = {};
      if(machine_id) params.machine_id
      const response = await this.postApi.get('/api/v1/pl/get_machine', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getPallet(page, pageSize) {
    let response;
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const { pallet_code, job_id, plan_id, sig, qty, part_name, process_id, next_process_id, process_name, zone_code, next_zone_code, status } = PlSearchInstance.getSearch('pl');
      const params = {
        page,
        pageSize,
        ...(pallet_code && { pallet_code }),
        ...(job_id && { job_id }),
        ...(plan_id && { plan_id }),
        ...(sig && { sig }),
        ...(qty && { qty }),
        ...(part_name && { part_name }),
        ...(process_id && { process_id }),
        ...(next_process_id && { next_process_id }),
        ...(process_name && { process_name: process_name }),
        ...(zone_code && { zone_code }),
        ...(next_zone_code && { next_zone_code }),
        ...(status && { status }),
      };
      response = await this.postApi.get('/api/v1/pl/', { params });
      return response.data;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getSelectPallet(){
    try {
        const params = {
          // page: 1,
          // pageSize: 22,
        };
      const response = await this.postApi.get('/api/v1/pl/', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getSelectJobData(){
    try {
      let response;
      response = await this.postApi.get('/api/v1/pl/get_job');
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getPalletOne(obj){
    try {
      const { pallet_code } = obj
      const params = {
        ...(pallet_code && { pallet_code }),
      };
      const response = await this.postApi.get('/api/v1/pl/', { params });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getPalletDashboard(page, pageSize, params){
    try {
      console.log('params' ,params)
      const { process_id, next_process_id, zone_code, next_zone_code, status, type } = params
      const data = {
        page,
        pageSize,
        ...(process_id && { process_id }),
        ...(next_process_id && { next_process_id }),
        ...(zone_code && { zone_code }),
        ...(next_zone_code && { next_zone_code }),
        ...(status && { status }),
        ...(type && { type }),
      };
      console.log('data' ,data)
      const response = await this.postApi.get('/api/v1/pl/', { params: data });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getPallets(params){
    try {
      console.log('params' ,params)
      let response;
      let data;
      const { process_id, next_process_id, zone_code, next_zone_code, status } = params
      data = {
        ...(process_id && { process_id }),
        ...(zone_code && { zone_code }),
        ...(next_process_id && { next_process_id }),
        ...(next_zone_code && { next_zone_code }),
        ...(status && { status }),
      };
      response = await this.postApi.get('/api/v1/pl/get_pallet_dashboard', { params: data });

      // if(type === 'outbound'){
      //   data = {
      //     ...(process_id && { process_id }),
      //     ...(zone_code && { zone_code }),
      //   };
      //   response = await this.postApi.get('/api/v1/pl/pallet_outbound', { params: data });
      // }else if(type === 'inbound'){
      //   data = {
      //     ...(process_id && { process_id }),
      //     ...(zone_code && { zone_code }),
      //   };
      //   response = await this.postApi.get('/api/v1/pl/pallet_inbound', { params: data });
      // }
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async getJob(params){
    try {
      console.log('params' ,params)
      let response;
      let data;
      const { job_id } = params
      data = {
        ...(job_id && { job_id }),
      };
      response = await this.postApi.get('/api/v1/pl/get_job', { params: data });
      return response.data
    } catch (err) {
      throw new Error(err);
    }
  }

  async createPallet(obj) {
    try {
      // await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('obj.data' ,obj.data)
      const response = await this.postApi.post('/api/v1/pl', obj.data, {
        signal: Axios.controller.signal,
      });
      // console.log('response' ,response)
      return response.data;
    } catch (err) {
      console.log('err' ,err)
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async updatePallet(data){
    try {
      const response = await this.postApi.put('/api/v1/pl', data);
      return response.data
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async deletePallet(data) {
    try {
      // await new Promise(resolve => setTimeout(resolve, 5000));
      const response = await this.postApi.delete('/api/v1/pl', {
        data,
        signal: Axios.controller.signal,
      });
      console.log('deletePallet response' ,response)
      return response.data;
    } catch (err) {
      console.log('deletePallet err' ,err)
      if (await this.isRequestCanceled(err)) return null;
      throw err;
    }
  }

  async cancelPallet(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await this.postApi.put('/api/v1/pl/cancelled_pallet', data, { signal: Axios.controller.signal });
      return response.data;
    } catch (err) {
      if (await this.isRequestCanceled(err)) return null;
      throw new Error(err);
    }
  }

  async getSelectProcess(){
    try {
      const response = await this.postApi.get('/api/v1/pl/get_process');
      return response.data
    } catch (err) {
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

  async updateQcStatus(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const response = await this.postApi.put('/api/v1/pl/update_qc_status', data, { signal: Axios.controller.signal });
      console.log('updateQcStatus response' ,response)
      return response.data;
    } catch (err) {
      console.log('deletePupdateQcStatusallet err' ,err)
      if (await this.isRequestCanceled(err)) return null;
      throw err;
    }
  }

  async movePallets(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const response = await this.postApi.put('/api/v1/pl/move_pallets', data, { signal: Axios.controller.signal });
      console.log('movePallets response' ,response)
      return response.data;
    } catch (err) {
      console.log('movePallets err' ,err)
      if (await this.isRequestCanceled(err)) return null;
      throw err;
    }
  }

}

const PlPalletInstance = new PlPallet();