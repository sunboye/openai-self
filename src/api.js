import fs from 'fs'
import path from 'path'
import httpsProxyAgent from 'https-proxy-agent'
import $axios  from 'axios'
import enumMap from './enum.js'
import utils from './utils.js'
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
    const option = utils.getHttpOptions(enumMap.interface.modelList)
    const res = await utils.createRequest(option)
    const resData = res && res.success && res.data ? res.data.data : res
    if (callback && typeof callback === 'function') {
      callback(resData)
    } else {
      return resData
    }
  }
  async createNomalCompletions(msg, options, callback) {
    const param = utils.initParams(msg, options, callback, 'prompt')
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
    const enumOptions = utils.getHttpOptions(enumMap.interface.postNomalCompletions)
    enumOptions.data = param
    const res = await utils.createRequest(enumOptions)
    const resData = res && res.success && res.data && res.data.choices ? res.data.choices[0].text : res
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }

  async createChatCompletions(msg, options, callback) {
    const param = utils.initParams(msg, options, callback, 'messages')
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
        const msgArr = utils.readContext(param)
        param.messages = msgArr
        delete param.context
      }
    } else {
      return new Error('param is not valid!!!')
    }
    const enumOptions = utils.getHttpOptions(enumMap.interface.postChatCompletions)
    enumOptions.data = param
    const res = await utils.createRequest(enumOptions)
    const resData = res && res.success && res.data && res.data.choices ? res.data.choices[0].message : res
    if (context && resData && resData.content) {
      param.messages.push(resData)
      const writeContext = param.messages
      utils.saveContext(context, writeContext)
    }
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }
  async clearContext(keyword, evn) {
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
    const param = utils.initParams(url, options, callback, 'url')
    const option = utils.getHttpOptions(param)
    const res = await utils.createRequest(option)
    const resData = res && res.success ? res.data : res
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }
}
export default OpenAIInstance