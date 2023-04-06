import fs from 'fs'
import path from 'path'
import $axios  from 'axios'
import httpsProxyAgent from 'https-proxy-agent'
import { BASE_PATH, sourceSubDir } from './enum.js'
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

const axiosDefault = (config) => {
  $axios.defaults.baseURL = BASE_PATH
  $axios.defaults.headers.common['User-Agent'] = `OpenAI/NodeJS/${pkg.author}/${pkg.version}`
  $axios.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`
  if (config.organizationId) {
    $axios.defaults.headers.common['OpenAI-Organization'] = config.organizationId
  }
  if (config.proxy) {
    $axios.defaults.httpsAgent = new httpsProxyAgent(config.proxy).on('error', err => {
      throw err
    })
  }
}

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

const createDir = (dir) => {
  const pathDir = path.resolve(dir)
  try {
    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir)
    } 
  } catch (error) {
    console.log(error)
    throw error
  }
}

const checkSourceDir = (config, dir) => {
  const pathTemp = path.join(`${config.sourceDir}${path.sep}${dir}`)
  if (!fs.existsSync(pathTemp)) {
    const sep = path.sep
    const pathArr = pathTemp.split(sep)
    let curPath = ''
    if (pathArr && pathArr.length) {
      pathArr.forEach(item => {
        curPath = curPath ? `${curPath}${sep}${item}` : item
        createDir(curPath)
      })
    }
    return fs.existsSync(path.resolve(pathTemp))
  }
  return true
}

const readContext = (config, param) => {
  const keyword = param.context
  if (checkSourceDir(config, sourceSubDir.context)) {
    try {
      const defaultDir = path.resolve(`${config.sourceDir}${path.sep}${sourceSubDir.context}`)
      if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
        fs.mkdirSync(defaultDir)
      }
      const filePath = path.resolve(`${defaultDir}${path.sep}${keyword}.json`)
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
  } else {
    throw(new Error('create context of sourceDir failed!!!'))
  }
}

const saveContext = (config, keyword, data) => {
  if (checkSourceDir(config, sourceSubDir.context)) {
    try {
      const defaultDir = path.resolve(`${config.sourceDir}${path.sep}${sourceSubDir.context}`)
      if (!fs.existsSync(defaultDir) || !fs.statSync(defaultDir).isDirectory()) {
        fs.mkdirSync(defaultDir)
      }
      if (keyword && data) {
        const filePath = path.resolve(`${defaultDir}${path.sep}${keyword}.json`)
        fs.writeFileSync(filePath, JSON.stringify(data))
      }
    } catch (error) {
      console.log(new Error('save Context failed !!!'))
    }
  } else {
    throw(new Error('create context of sourceDir failed!!!'))
  }
}

const clearContext = (config, keyword) => {
  const defaultDir = path.resolve(`${config.sourceDir}${path.sep}${sourceSubDir.context}`)
  if (fs.existsSync(defaultDir)) {
    let fileKeys = []
    if (keyword) {
      fileKeys = Array.isArray(keyword) ? keyword.map(k => k + '.json') || [] : [`${keyword}.json`]
    } else {
      fileKeys = fs.readdirSync(defaultDir)
    }
    fileKeys.forEach(f => {
      try {
        const filePath = path.resolve(`${defaultDir}${path.sep}${f}`)
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
}

const removeSourceDir = (dir) => {
  if (fs.existsSync(path.resolve(dir))) {
    const fileNames = fs.readdirSync(dir);
    let childPath = null
    fileNames.forEach(item => {
      childPath = path.resolve(`${dir}${path.sep}${item}`)
      if (fs.statSync(childPath).isDirectory()) {
        removeSourceDir(childPath)
        fs.rmdirSync(childPath)
      } else {
        fs.unlinkSync(childPath)
      }
    })
  } else {
    console.log(`path ${dir} is not exist`)
  }
}

const clearSourceDir = (config, dir) => {
  const rmDir = path.resolve(dir ? `${config.sourceDir}${path.sep}${dir}` : config.sourceDir)
  console.log(rmDir)
  if (fs.existsSync(rmDir)) {
    if (fs.statSync(rmDir).isDirectory()) {
      removeSourceDir(rmDir)
    } else {
      fs.unlinkSync(rmDir)
    }
  }
}

// 暴露方法
export default {
  axiosDefault,
  initParams,
  getHttpOptions,
  createRequest,
  checkSourceDir,
  readContext,
  saveContext,
  clearContext,
  clearSourceDir
}
