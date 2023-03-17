
import enumMap from './enum.js'
import http  from 'https'
import proxyAgent from 'proxy-agent'
import pkg from '../package.json' assert { type: "json" }

const getHttpOptions = (config, enumConf) => {
  const baseOptions = {
    headers: {}
  }
  if (enumConf &&  Object.keys(enumConf).length) {
    baseOptions.method = enumConf.method
  }
  if (config && Object.keys(config).length) {
    baseOptions.headers = {
      'User-Agent': `OpenAI/NodeJS/${pkg.author}/${pkg.version}`,
      'Authorization': `Bearer ${config.apiKey || config.apikey}`
    }
    if (config.organizationId) {
      baseOptions.headers['OpenAI-Organization'] = config.organizationId;
    }
    if (config.agent) {
      baseOptions.agent = config.agent
    }
  }
  return {
    url: enumConf.url,
    option: baseOptions
  }
}


const createRequest = (url, option) => {
  return new Promise((reslove, reject) => {
    const req = http.request(url, option, (res) => {
      let jsonStr = ''
      res.on('data', (data) => {
        jsonStr += data
      })
      res.on('end', () => {
        const jsonObj = JSON.parse(jsonStr)
        jsonObj && typeof jsonObj === 'object' ? reslove(jsonObj) : reslove(jsonStr)
      })
    })
    req.on('error', (err) => {
      reject(err)
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
    this.apiKey = configuration.apiKey || configuration.apikey
    this.organizationId = configuration.organizationId 
  }
  // 获取引擎列表
  async getModels() {
    const {url , option} = getHttpOptions(this.configuration, enumMap.interface.modelList)
    option.headers['Content-Type'] = 'application/json'
    const reqData = await createRequest(url, option)
    return reqData
  }
}
export default OpenAIInstance