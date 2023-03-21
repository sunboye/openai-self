
import enumMap from './enum.js'
import proxyAgent from 'proxy-agent'
import http from 'http'
import https from 'https'
import $axios  from 'axios'
import pkg from '../package.json' assert { type: "json" }

$axios.interceptors.request.use(config => {
  // loading
  console.log(config)
  return config
}, error => {
  return Promise.reject(error)
})

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
      if (!baseOptions.headers) {
        baseOptions.headers = {}
      }
      baseOptions.headers = Object.assign({}, enumConf.headers)
    }
  } else {
    baseOptions.method = 'get'
  }
  return baseOptions

}

const createRequest = (config) => {
  return new Promise((reslove, reject) => {
    config.url = "https://api.openai.com/v1/models"
    $axios.request(config).then((res) =>{
      reslove(res.data)
    }).catch(e => {
      reslove(e.message)
    })
  })
}

class OpenAIInstance {
  constructor (configuration) {
    this.configuration = configuration || {}
    this.configuration.apiKey = configuration.apiKey || configuration.apikey
    if (this.configuration.apiKey) {
      $axios.defaults.baseURL = enumMap.BASE_PATH
      // $axios.defaults.httpAgent = new http.Agent({ keepAlive: true })
      $axios.defaults.httpsAgent = new https.Agent({ keepAlive: true })
      // $axios.defaults.agent = new proxyAgent(configuration.proxy)
      $axios.defaults.headers.common['User-Agent'] = `OpenAI/NodeJS/${pkg.author}/${pkg.version}`
      $axios.defaults.headers.common['Authorization'] = `Bearer ${this.configuration.apiKey}`
      if (this.configuration.organizationId) {
        $axios.defaults.headers.common['OpenAI-Organization'] = configuration.organizationId
      }
      if (this.configuration.proxy) {
        if (typeof this.configuration.proxy === 'object') {
          $axios.defaults.proxy = this.configuration.proxy
        } else if (typeof this.configuration.proxy === 'string') {
          const urlObj = new URL(this.configuration.proxy)
          $axios.defaults.proxy = {
            protocol: urlObj.protocol && urlObj.protocol.indexOf(':') > -1 ? urlObj.protocol.split(':')[0]  : urlObj.protocol,
            host: urlObj.hostname,
            port: urlObj.port
          }
        }
      }
    } else {
      const errMsg = 'OpenAIInstance is required apiKey'
      const error = new Error(errMsg)
      throw(error)
    }
  }
  // 获取引擎列表
  async getModels() {
    const option = getHttpOptions(enumMap.interface.modelList)
    // option.headers['Content-Type'] = 'application/json'
    const reqData = await createRequest(option)
    return reqData
  }
  // 自定义请求
  async createCustomRequest(url, option, callback) {
    const errMsg = "ERROR: please check params, params is no valid, first param is url, it's required and the type is string"
    if (url && typeof url === 'string') {
      let params = {}
      if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
        params.url = url
      } else {
        params.url = `${enumMap.BASE_PATH}${url.indexOf('/') === 0 ? '' : '/'}${url}`
      }
      if (option && typeof option === 'object') {
        params = Object.assign({}, params, option)
        if (params.proxyUri) {
          try {
            params.agent = new proxyAgent(option.proxyUri)
          } catch (e) {
            params.agent = null
            console.error(e)
          }
        }
        params.protocol && delete params.protocol
        params.hostname && delete params.hostname
        params.host && delete params.host
        params.port && delete params.port
      } else if (option && typeof option === 'function') {
        callback = option
      } else {
        console.warn("Warning: Function createCustomRequest's option is undefined")
      }
      const httpOption = getHttpOptions(this.configuration, params)
      const reqData = await createRequest(httpOption.url, httpOption.option)
      if (callback && typeof callback === 'function') {
        callback(reqData)
      } else {
        return reqData
      }
    } else {
      // 未传url
      // 未传option，传了callback
      if (option && typeof option === 'function') {
        callback = option
      }
      console.error(errMsg)
      if (callback && typeof callback === 'function') {
        callback(errMsg)
      } else {
        return errMsg
      }
    }
  }
}
export default OpenAIInstance