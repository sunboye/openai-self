const BASE_PATH = "https://api.openai.com"
export default {
  interface: {
    modelList: {
      method: 'get',
      url: `${BASE_PATH}/v1/models`,
      desc: '获取所有可用的模型和其详细信息'
    },
    postNomalCompletions: {
      method: 'post',
      url: `${BASE_PATH}/v1/completions`,
      desc: '普通聊天'
    },
    postHighCompletions: {
      method: 'post',
      url: `${BASE_PATH}/v1/chat/completions`,
      desc: '高级聊天'
    },
    getImageByContent: {
      method: 'get',
      url: `${BASE_PATH}/v1/images/generations`,
      desc: '根据要求创作图片'
    },
    postEdit: {
      method: 'post',
      url: `${BASE_PATH}/v1/edits`,
      desc: '未知'
    },
    getModelById: (modelId) => {
      return {
        method: 'get',
        url: `${BASE_PATH}/v1/models/${modelId}`,
        desc: '根据 modelId 获取模型详情'
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