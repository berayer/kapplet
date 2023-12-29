declare module 'element-plus/dist/locale/zh-cn.mjs'

type AnyObj = {
  [key: string | number | symbol]: any
}

namespace VM {
  interface Api {
    getJsonDataByIds: (ids: string[]) => Promise<KJL.ParamModel[]>
    setSelectModel: (id: string) => Promise<void>
    findTopModelsAsync: () => Promise<string[]>
  }
  interface SessionRequest<T = any> {
    /** 会话Id */
    sessionId: string
    /** api */
    action: keyof VM.Api
    /** 数据 */
    data?: T
  }
  interface SessionResponse<T = any> {
    /** 会话Id */
    sessionId: string
    /** 响应状态 */
    state: 1 | 0
    /** 响应数据 */
    data?: T
  }
  interface EventResponse<T = any> {
    /** 监听事件 */
    action: string
    /** 响应数据 */
    data?: T
  }
}

namespace Json {
  type JsonType = NonNullable<Awaited<ReturnType<typeof IDP.Custom.Design.Export.getDesignJsonAsync>>['data']>
  type ParamModel = Json.JsonType['paramModel'][0]
  type Parameter = Json.ParamModel['parameters'][0]
}

namespace KJL {
  interface ParamModel {
    /** 模型id */
    id: string
    /** 父模型id */
    parentId?: string
    /** 真分类id */
    prodCatId: number
    /** 模型类型 */
    '@type': string
    /** 对接编码 */
    modelBrandGoodCode?: string
    /** 模型商品名称 */
    modelBrandGoodName: string
    /** 材质名称 */
    textureName?: string
    /** 参数数组 */
    parameters: KJL.Parameter[]
    /** 原始尺寸 */
    size: KJL.Coordinate
    /** 自定义输出尺寸 */
    customSize: KJL.Coordinate
    /** 子模型 */
    children?: KJL.ParamModel[]
  }

  interface Parameter {
    /** 参数名称 */
    name: string
    /** 参数显示名称 */
    displayName: string
    /** 参数值 */
    value: string
    /** 参数类型 */
    type: string
  }

  interface Coordinate {
    x: number
    y: number
    z: number
  }
}
