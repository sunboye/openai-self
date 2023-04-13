import { Interface, ImageSizeEnum, ResImageType } from './enum.js'
import utils from './utils.js'

class OpenAIInstance {
  constructor (configuration) {
    this.configuration = configuration || {}
    this.configuration.apiKey = configuration.apiKey || configuration.apikey
    if (this.configuration.apiKey) {
      utils.axiosDefault(this.configuration)
      this.configuration.sourceDir = this.configuration.sourceDir || 'openai_source'
    } else {
      const errMsg = 'apiKey is required of OpenAIInstance'
      const error = new Error(errMsg)
      throw(error)
    }
  }
  // 获取引擎列表
  async getModels(callback) {
    const option = utils.getHttpOptions(Interface.modelList)
    const res = await utils.createRequest(option)
    if (callback && typeof callback === 'function') {
      callback(res)
    } else {
      return res
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
    const enumOptions = utils.getHttpOptions(Interface.nomalCompletions)
    enumOptions.data = param
    const res = await utils.createRequest(enumOptions)
    if (param.callback && typeof param.callback === 'function') {
      param.callback(res)
    } else {
      return res
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

      if (!param.n || param.n < 2) {
        if (param.context) {
          console.warn('The context parameter is not effective because n>1')
          context = param.context
          const msgArr = utils.readContext(this.configuration, param)
          param.messages = msgArr
          delete param.context
        }
      }
    } else {
      return new Error('param messages is not valid!!!')
    }
    const enumOptions = utils.getHttpOptions(Interface.chatCompletions)
    enumOptions.data = param
    const res = await utils.createRequest(enumOptions)
    const resData = res && res.success && res.choices && res.choices.length ? res.choices[0].message : res
    if (context) {
      res.tips = 'If you want to generate multiple chats, please pass in the parameter n. When n>1, the associated context function is no longer supported. You need to handle the associated context yourself!!!'
      if (resData && resData.content) {
        param.messages.push(resData)
        const writeContext = param.messages || ''
        utils.saveContext(this.configuration, context, writeContext)
      }
    }
    if (param.callback && typeof param.callback === 'function') {
      param.callback(res)
    } else {
      return res
    }
  }
  async generateImage(msg, options, callback) {
    const param = utils.initParams(msg, options, callback, 'prompt')
    if (param && param.prompt) {
      let isSave = false
      if (!param.n) {
        param.n = 1
      }
      if (!param.size) {
        param.size = ImageSizeEnum._512
      }
      if (Object.keys(param).includes('local')) {
        isSave = param.local
        delete param.local
      }
      if (isSave) {
        param.response_format = ResImageType.b64
      }
      const enumOptions = utils.getHttpOptions(Interface.getCreateImage)
      enumOptions.data = param
      const res = await utils.createRequest(enumOptions)
      res.type = param.response_format || ResImageType.url
      if (isSave) {
        if (res.success && res.data && res.data.length) {
          const dataTemp = res.data
          res.data = utils.baseImageSave(this.configuration, dataTemp)
          res.type = res.data && res.data.length && res.data[0].local_path ? 'local_path' : param.response_format || ResImageType.url
        }
      }
      if (param.callback && typeof param.callback === 'function') {
        param.callback(res)
      } else {
        return res
      }
    } else {
      return new Error('param prompt is not valid!!!')
    }
  }
  async clearContext(keyword) {
    utils.clearContext(this.configuration, keyword)
  }
  async clearSourceDir(keyword) {
    utils.clearSourceDir(this.configuration, keyword)
  }
  // 自定义请求
  async createCustomRequest(url, options, callback) {
    const param = utils.initParams(url, options, callback, 'url')
    const option = utils.getHttpOptions(param)
    const res = await utils.createRequest(option)
    if (param.callback && typeof param.callback === 'function') {
      param.callback(res)
    } else {
      return res
    }
  }
}
export default OpenAIInstance