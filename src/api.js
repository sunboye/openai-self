
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
  return Promise.reject(new Error(error));
});

const initParams = (str, obj, func, key) => {
  // 没传obj
  if (typeof obj === 'function') {
    func = obj
  }
  // 没传str
  if (typeof str === 'object') {
    obj = str
    str = obj[key]
  }

  let params = {}
  if (obj !== null && typeof obj === 'object') {
    params = Object.assign(params, obj, {[key]: str})
  } else if (typeof str === 'string') {
    params = Object.assign(params, {[key]: str})
  } else {
    params = Object.assign({}, params, {[key]: str})
  }
  params.callback = func
  return params
}

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

const createRequest = (config) => {
  console.log(config)
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
    const res = await createRequest(option)
    const resData = res && res.success && res.data ? res.data.data : res
    if (callback && typeof callback === 'function') {
      callback(resData)
    } else {
      return resData
    }
  }
  async createNomalCompletions(msg, options, callback) {
    const param = initParams(msg, options, callback, 'prompt')
    if (param && param.prompt) {
      if (!param.model) {
        param.model = 'text-davinci-003'
      }
      if (!param.max_tokens) {
        param.max_tokens = 500
      }
    } else {
      return new Error('param is not valid!!!')
    }
    const enumOptions = getHttpOptions(enumMap.interface.postNomalCompletions)
    enumOptions.data = param
    const res = await createRequest(enumOptions)
    const resData = res && res.success && res.data && res.data.choices ? res.data.choices[0].text : res
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }
  // 自定义请求
  async createCustomRequest(url, options, callback) {
    const param = initParams(url, options, callback, 'url')
    const option = getHttpOptions(param)
    const res = await createRequest(option)
    const resData = res && res.success ? res.data : res
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }
}
export default OpenAIInstance