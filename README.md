## openai-self

### 背景
  基于openai开放api封装，旨在可以更加简单的调用openai的api接口

### 源码地址
  [github/openai-self](https://github.com/sunboye/openai-self)

### 安装
  `npm i openai-self`

### 使用
  ```javascript
  const OpenAI = require('openai-self');

  const openai = new OpenAI({
    apikey: OPENAI_API_KEY, // openai的api_Key：必填，可前往openai官网申请
    // proxyUri: 'http://127.0.0.1:19180' // 代理服务器地址：非必填，科学上网时需要
    organizationId: '' // 组织机构Id：非必填
  });
  console.log(await openai.getModels()) // 获取openai所用可用引擎并输出

  ```
### 接口说明