
import enumMap from './enum.js'
import http  from 'https'
import proxyAgent from 'proxy-agent'
import pkg from '../package.json' assert { type: "json" }

const getHttpOptions = (config, enumConf) => {
  const baseOptions = Object.assign({}, enumConf)
  if (baseOptions && !baseOptions.headers) {
    baseOptions.headers = {}
  }
  if (enumConf &&  Object.keys(enumConf).length) {
    baseOptions.method = enumConf.method || 'get'
    if (enumConf.headers) {
      baseOptions.headers = Object.assign({}, baseOptions.headers, enumConf.headers)
    }
    // agent来自于createCustomRequest时
    if (enumConf.agent) {
      baseOptions.agent = enumConf.agent
    }
  } else {
    baseOptions.method = 'get'
  }
  if (config && Object.keys(config).length) {
    if (!baseOptions.headers['User-Agent']) {
      baseOptions.headers['User-Agent'] = `OpenAI/NodeJS/${pkg.author}/${pkg.version}`
    }
    if (!baseOptions.headers['Authorization']) {
      baseOptions.headers['Authorization'] = `Bearer ${config.apiKey}`
    }
    if (!baseOptions.headers['OpenAI-Organization'] && config.organizationId) {
      baseOptions.headers['OpenAI-Organization'] = config.organizationId
    }
    if (!baseOptions.headers['Content-Type']) {
      baseOptions.headers['Content-Type'] = 'application/json'
    }
    if (!baseOptions.agent && config.agent) {
      baseOptions.agent = config.agent
    }
  }
  return {
    url: enumConf.url,
    option: baseOptions
  }
}

const isJsonToFormat = (str) => {
  if (str && typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (obj && typeof obj === 'object') {
        return obj;
      } else {
        return str;
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e);
      return str;
    }
  } else {
    return str
  }
}

const createRequest = (url, option) => {
  console.log(url)
  console.log(option)
  return new Promise((reslove, reject) => {
    const req = http.request(url, option, (res) => {
      let resStr = ''
      console.log(res.statusCode)
      res.on('data', (data) => {
        resStr += data.toString()
      })
      res.on('end', () => {
        reslove(isJsonToFormat(resStr))
      })
    })
    req.on('error', (err) => {
      reslove(err)
    });
    req.end()
  })
}

class OpenAIInstance {
  constructor (configuration) {
    this.configuration = configuration || {}
    if (configuration && configuration.proxyUri) {
      this.configuration.agent = new proxyAgent(configuration.proxyUri).on('error', err => {
        throw err
      })
    }
    this.configuration.apiKey = configuration.apiKey || configuration.apikey
  }
  // 获取引擎列表
  async getModels() {
    const {url , option} = getHttpOptions(this.configuration, enumMap.interface.modelList)
    option.headers['Content-Type'] = 'application/json'
    const reqData = await createRequest(url, option)
    return reqData
  }
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