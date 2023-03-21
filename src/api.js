
import enumMap from './enum.js'
import httpsProxyAgent from 'https-proxy-agent'
import $axios  from 'axios'
import pkg from '../package.json' assert { type: "json" }


// 添加响应拦截器
$axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return {
    data: response.data,
    status: response.status,
    msg: response.statusText,
    success: response.status === 200
  };
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(
    new Error(error));
  });

const getHttpOptions = (enumConf) => {
  const baseOptions = Object.assign({}, enumConf)
  if (enumConf &&  Object.keys(enumConf).length) {
    baseOptions.method = enumConf.method || 'get'
    if (enumConf.url.indexOf('http://') === 0 || enumConf.url.indexOf('https://') === 0) {
      baseOptions.url = enumConf.url
    } else {
      baseOptions.url = `${enumConf.url.indexOf('/') === 0 ? '' : '/'}${enumConf.url}`
    }
    if (enumConf.headers) {
      baseOptions.headers = Object.assign({}, enumConf.headers)
    }
  } else {
    baseOptions.method = 'get'
  }
  return baseOptions

}

const returnResData = (callback) => {

}

const createRequest = (config) => {
  return new Promise((reslove, reject) => {
    $axios.request(config).then((res) =>{
      reslove(res)
    }).catch(e => {
      reslove(e)
    })
  })
}

class OpenAIInstance {
  constructor (configuration) {
    this.configuration = configuration || {}
    this.configuration.apiKey = configuration.apiKey || configuration.apikey
    if (this.configuration.apiKey) {
      $axios.defaults.baseURL = enumMap.BASE_PATH
      $axios.defaults.headers.common['User-Agent'] = `OpenAI/NodeJS/${pkg.author}/${pkg.version}`
      $axios.defaults.headers.common['Authorization'] = `Bearer ${this.configuration.apiKey}`
      if (this.configuration.organizationId) {
        $axios.defaults.headers.common['OpenAI-Organization'] = configuration.organizationId
      }
      if (this.configuration.proxy) {
        $axios.defaults.httpsAgent = new httpsProxyAgent(this.configuration.proxy).on('error', err => {
          throw err
        })
      }
    } else {
      const errMsg = 'apiKey is required of OpenAIInstance'
      const error = new Error(errMsg)
      throw(error)
    }
  }
  // 获取引擎列表
  async getModels(callback) {
    const option = getHttpOptions(enumMap.interface.modelList)
    const reqData = await createRequest(option)
    if (callback && typeof callback === 'function') {
      callback(reqData)
    } else {
      return reqData
    }
  }
  // 自定义请求
  async createCustomRequest(url, options, callback) {
    // 没传options
    if (typeof options === 'function') {
      callback = options
    }
    // 没传url
    if (typeof url === 'object') {
      options = url
      url = options.url
    }
  
    let params = {}
    if (options !== null && typeof options === 'object') {
      params = Object.assign(params, options, {url: url})
    } else if (typeof url === 'string') {
      params = Object.assign(params, {url: url})
    } else {
      params = Object.assign({}, params, {url: url})
    }
    const option = getHttpOptions(params)
    const reqData = await createRequest(option)
    if (callback && typeof callback === 'function') {
      callback(reqData)
    } else {
      return reqData
    }
  }
}
export default OpenAIInstance