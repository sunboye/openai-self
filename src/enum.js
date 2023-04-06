const BASE_PATH = 'https://api.openai.com'
const Interface = {
  modelList: {
    method: 'get',
    url: '/v1/models'
  },
  postNomalCompletions: {
    method: 'post',
    url: '/v1/completions'
  },
  postChatCompletions: {
    method: 'post',
    url: '/v1/chat/completions'
  },
  getImageByContent: {
    method: 'get',
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
  _256x256: '256x256',
  _512x512: '512x512',
  _1024x1024: '1024x1024'
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
  sourceSubDir
}