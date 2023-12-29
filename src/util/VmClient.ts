import uniqid from 'uniqid'

type PromiseRes<T = any> = {
  res: (v: T) => void
  rej: (v: unknown) => void
}

class VMClient {
  // 正在执行的会话列表
  private sessionMap = new Map<string, PromiseRes>()

  constructor() {
    this.ListenerMessage()
  }

  /**
   * 发送消息事件
   */
  send<K extends keyof VM.Api>(action: K) {
    return (...arg: Parameters<VM.Api[K]>) => {
      return this.postMessage<Awaited<ReturnType<VM.Api[K]>>>({
        sessionId: uniqid(),
        action,
        data: arg
      })
    }
  }

  on() {}

  /**
   * 监听接受的消息,调用对应处理器
   */
  private ListenerMessage() {
    window.addEventListener('message', (target) => {
      // 没有消息体,不处理
      if (!target.data) return
      // 消息处理
      if (target.data.sessionId) {
        this.handlerSessionMsg(target.data)
        return
      }
      // 监听事件处理
      if (target.data.action) {
        this.handlerEvent(target.data)
        return
      }
      // 消息体不识别
      console.log('无法处理响应消息', target.data)
    })
  }

  /**
   * 处理响应的会话消息
   * @param msg 消息体
   */
  private handlerSessionMsg(msg: VM.SessionResponse) {
    if (this.sessionMap.has(msg.sessionId)) {
      const { res, rej } = this.sessionMap.get(msg.sessionId)!
      msg.state ? res(msg.data) : rej(msg.data)
      this.sessionMap.delete(msg.sessionId)
    } else {
      console.warn('接受到超时消息', msg)
    }
  }

  private handlerEvent(msg: VM.EventResponse) {
    console.log(msg)
    // do something
  }

  /**
   * 向VM发送消息
   * @param msg 消息体
   */
  private postMessage<T = any>(msg: VM.SessionRequest) {
    // 判断当前是否是内嵌窗口
    if (window.parent === window) {
      return Promise.reject('未发现父窗口, 自动取消发送消息')
    }
    // 向父窗口发送消息
    window.parent.postMessage(msg, '*')
    // 返回请求Promise
    return new Promise<T>((res, rej) => {
      // 存储当前会话, 监听响应
      this.sessionMap.set(msg.sessionId, { res, rej })
      // 设置响应超时
      setTimeout(() => {
        this.sessionMap.delete(msg.sessionId)
        rej('消息响应超时')
      }, 100 * 1000)
    })
  }
}

const ins = new VMClient()

export default ins
