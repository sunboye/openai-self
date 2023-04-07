import { Interface, ImageSizeEnum, ResImageType } from './enum.js'
import utils from './utils.js'

class OpenAIInstance {
  constructor (configuration) {
    this.configuration = configuration || {}
    this.configuration.apiKey = configuration.apiKey || configuration.apikey
    if (this.configuration.apiKey) {
      utils.axiosDefault(this.configuration)
      this.configuration.sourceDir = this.configuration.sourceDir || 'openai-source'
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
    const enumOptions = utils.getHttpOptions(Interface.nomalCompletions)
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
        const msgArr = utils.readContext(this.configuration, param)
        param.messages = msgArr
        delete param.context
      }
    } else {
      return new Error('param messages is not valid!!!')
    }
    const enumOptions = utils.getHttpOptions(Interface.chatCompletions)
    enumOptions.data = param
    const res = await utils.createRequest(enumOptions)
    const resData = res && res.success && res.data && res.data.choices ? res.data.choices[0].message : res
    if (context && resData && resData.content) {
      param.messages.push(resData)
      const writeContext = param.messages || ''
      utils.saveContext(this.configuration, context, writeContext)
    }
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
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
      if (Object.keys(param).includes('localSave')) {
        isSave = param.localSave
        delete param.localSave
      }
      if (isSave) {
        param.response_format = ResImageType.b64
      }
      const enumOptions = utils.getHttpOptions(Interface.getCreateImage)
      enumOptions.data = param
      const res = await utils.createRequest(enumOptions)
      const dataTemp = res && res.success && res.data && res.data.data.length ? res.data.data : res
      let resData = []
      if (res.success && res.data && res.data.data.length) {
        if (param.response_format === ResImageType.b64) {
          const bases = dataTemp.map(item => item[ResImageType.b64]) || []
          resData = isSave ? utils.baseImageSave(this.configuration, bases) : bases
        } else {
          const imageUrls = dataTemp.map(item => item[ResImageType.url]) || []
          resData = imageUrls
        }
      } else {
        resData = dataTemp
      }
      if (param.callback && typeof param.callback === 'function') {
        param.callback(resData)
      } else {
        return resData
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
    const resData = res && res.success ? res.data : res
    if (param.callback && typeof param.callback === 'function') {
      param.callback(resData)
    } else {
      return resData
    }
  }
}
export default OpenAIInstance