const BASE_PATH = 'https://api.openai.com'
const Interface = {
  modelList: {
    method: 'get',
    url: '/v1/models'
  },
  nomalCompletions: {
    method: 'post',
    url: '/v1/completions'
  },
  chatCompletions: {
    method: 'post',
    url: '/v1/chat/completions'
  },
  getCreateImage: {
    method: 'post',
    url: '/v1/images/generations'
  },
  postEdit: {
    method: 'post',
    url: '/v1/edits'
  },
  getModelById: (modelId) => {
    return {
      method: 'get',
      url: `/v1/models/${modelId}`
    }
  }
}
const RoleEnum = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant'
}

const ImageSizeEnum = {
  _256: '256x256',
  _512: '512x512',
  _1024: '1024x1024'
}

const ResImageType = {
  url: 'url',
  b64: 'b64_json'
}
const sourceSubDir = {
  context: 'context',
  image: 'image',
  video: 'video'
}
export {
  BASE_PATH,
  Interface,
  RoleEnum,
  ImageSizeEnum,
  ResImageType,
  sourceSubDir
}