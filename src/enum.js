const BASE_PATH = "https://api.openai.com"
export default {
  BASE_PATH: BASE_PATH,
  interface: {
    modelList: {
      method: 'get',
      url: '/v1/models'
    },
    postNomalCompletions: {
      method: 'post',
      url: '/v1/completions'
    },
    postHighCompletions: {
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
  },
  completionRoleEnum: {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
  },
  imageRequestSizeEnum: {
    _256x256: '256x256',
    _512x512: '512x512',
    _1024x1024: '1024x1024'
  }
}