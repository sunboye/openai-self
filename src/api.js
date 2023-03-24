import fs from 'fs'
import path from 'path'
import httpsProxyAgent from 'https-proxy-agent'
import $axios  from 'axios'
import enumMap from './enum.js'
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
    obj = {}
  }
  // 没传str或者str不为string类型
  if (typeof str === 'object') {
    if (Array.isArray(str)) {
      // 适配/v1/chat/completions接口
      if (!obj) {
        obj = {}
      }
      obj[key] = str
    } else {
      obj = str
      str = obj[key]
    }
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
  return new Promise((reslove, reject) => {
    $axios.request(config).then((res) =>{
      reslove(res)
    }).catch(e => {
      reslove(e)
    })
  })
}

const readContext = (param) => {
  const keyword = param.context
  try {
    const defaultDir = path.resolve('./source_context')
    if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
      fs.mkdirSync(defaultDir)
    }
    const filePath = path.resolve(`${defaultDir}/${keyword}.json`)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const buf = fs.readFileSync(filePath)
      const json = JSON.parse(buf)
      return Array.isArray(json) ? json.concat(param.messages) : param.messages
    } else {
      return param.messages
    }
  } catch (error) {
    return param.messages
  }
}

const saveContext = (keyword, data) => {
  try {
    const defaultDir = path.resolve('./source_context')
    if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
      fs.mkdirSync(defaultDir)
    }
    const filePath = path.resolve(`${defaultDir}/${keyword}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data))
  } catch (error) {
    console.log(new Error('save Context failed !!!'))
  }
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
        param.max_tokens = 350
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

  async createChatCompletions(msg, options, callback) {
    const param = initParams(msg, options, callback, 'messages')
    let context = ''
    if (param && param.messages) {
      if (!Array.isArray(param.messages)) {
        param.messages = [{role: 'user', content: param.messages}]
      }
      if (!param.model) {
        param.model = 'gpt-3.5-turbo'
      }
      if (!param.max_tokens) {
        param.max_tokens = 350
      }
      if (param.context) {
        context = param.context
        const msgArr = readContext(param)
        param.messages = msgArr
        delete param.context
      }
    } else {
      return new Error('param is not valid!!!')
    }
    const enumOptions = getHttpOptions(enumMap.interface.postChatCompletions)
    enumOptions.data = param
    const res = await createRequest(enumOptions)
    const resData = res && res.success && res.data && res.data.choices ? res.data.choices[0].message : res
    if (context && resData && resData.content) {
      param.messages.push(resData)
      const writeContext = param.messages
      saveContext(context, writeContext)
    }
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }
  async delectContext(keyword, evn) {
    const defaultDir = path.resolve('./source_context')
    let fileKey = []
    if (keyword) {
      fileKey = Array.isArray(keyword) ? keyword.map(k => k + '.json') || [] : [`${keyword}.json`]
    } else {
      fileKey = fs.readdirSync(defaultDir)
    }
    console.log(fileKey)
    fileKey.forEach(f => {
      try {
        const filePath = path.resolve(`${defaultDir}/${f}`)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        } else {
          console.log('context file is no exist!!!')
        }
      } catch (e) {
        console.error(e)
      }
    })

    
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