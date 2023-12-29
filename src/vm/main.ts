class VMServer {
  /** 默认挂载视图 */
  private iframe = IDP.Miniapp.view.defaultFrame
  /** 会话列表 */
  private sessionList = new Map<string, Function>()
  /** 页面基础配置 */
  private option = {
    layoutWith: 320,
    position: { x: 44, y: 0 }
  }

  constructor() {
    // 设置页面大小
    this.windowResize()
    // 挂载视图
    this.mountView()
    // 监听消息
    this.messageListener()
  }

  /* 添加对应的事件处理器 */
  add<K extends keyof VM.Api>(action: K, handler: (...arg: Parameters<VM.Api[K]>) => ReturnType<VM.Api[K]>) {
    if (this.sessionList.has(action)) {
      console.error('重复添加事件处理器', action)
      return
    }
    this.sessionList.set(action, handler)
  }

  /* 通过计算获取布局高度 */
  private getLayoutHeight() {
    return IDP.UI.computeLayout().leftPanel.height - 62
  }

  /* 在指定位置挂载视图 */
  private mountView() {
    this.iframe.mount(IDP.Miniapp.view.mountPoints.main)
    IDP.Miniapp.view.setContainerOptions(IDP.Miniapp.view.defaultFrame, {
      position: this.option.position
    })
  }

  /* 添加VM消息接受监听器 */
  private messageListener() {
    this.iframe.onMessageReceive((data) => {
      // 空消息不处理
      if (!data) return

      // 处理会话消息
      if (data.sessionId) {
        this.handlerSessionMessage(data)
        return
      }

      console.warn('未知消息类型', data)
    })
  }

  /* 设置视图窗口大小, 并监听窗口大小变动同步更改 */
  private windowResize() {
    this.iframe.resize(this.option.layoutWith, this.getLayoutHeight())
    IDP.Events.on('IDP.UI.Layout.WindowResize', () => {
      this.iframe.resize(this.option.layoutWith, this.getLayoutHeight())
    })
  }

  /* 处理视图层发送来的会话消息 */
  private async handlerSessionMessage(msg: VM.SessionRequest) {
    // 消息体
    const response: VM.SessionResponse = {
      sessionId: msg.sessionId,
      state: 0
    }
    // 获取对应会话消息处理器
    const handler = this.sessionList.get(msg.action)
    if (!handler) {
      response.data = {
        msg: '未找到对应会话消息处理器',
        data: msg.data
      }
    } else {
      // 调用对应会话消息处理器
      response.data = await handler(...msg.data)
      response.state = 1
    }
    // 发送响应结果
    this.postMessage(response)
  }

  /* 向视图发送响应结果 */
  private postMessage(msg: VM.SessionResponse) {
    this.iframe.postMessage(msg)
  }
}

const server = new VMServer()

/** 选中当前模型 */
server.add('setSelectModel', async (id) => {
  IDP.Interaction.setSelectedElements([{ id: id, type: IDP.DB.Types.ElementType.Wardrobe }])
})

/** 获取顶层模型id */
server.add('findTopModelsAsync', async () => {
  const data = await IDP.Custom.Design.CustomModel.findTopModelsAsync()
  return data.map((item) => item.id)
})

/** 通过顶层模型ids获取json数据 */
server.add('getJsonDataByIds', async (ids) => {
  const { data } = await IDP.Custom.Design.Export.getDesignFullJsonAsync({ modelIds: ids })
  if (data) {
    return getCustomModels(data.paramModel)
  }
  return []
})

function getCustomModels(model: Json.ParamModel[]) {
  const result: KJL.ParamModel[] = []
  model.forEach((item) => {
    let child: KJL.ParamModel[] = []
    item.subModels && (child = getCustomModels(item.subModels))
    if (item.modelBrandGoodCode || child.length > 0) {
      const cur = covertParamModel(item)
      if (child.length > 0) cur.children = child
      result.push(cur)
    }
  })
  return result
}

function covertParamModel(model: Json.ParamModel): KJL.ParamModel {
  return {
    id: model.id,
    parentId: model.parentId,
    prodCatId: model.prodCatId,
    '@type': model['@type'],
    modelBrandGoodCode: model.modelBrandGoodCode,
    modelBrandGoodName: model.modelBrandGoodName,
    textureName: model.textureName,
    parameters: covertParameter(model.ignoreParameters).concat(covertParameter(model.parameters)),
    size: model.size,
    customSize: model.customSize
  }
}

function covertParameter(params: Json.Parameter[]): KJL.Parameter[] {
  if (!params) return []
  return params.map((v) => ({
    name: v.name,
    displayName: v.displayName,
    type: v.type,
    value: v.value
  }))
}
