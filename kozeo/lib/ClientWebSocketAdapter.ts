export class ClientWebSocketAdapter {
  _ws: any = null
  isDisposed = false
  connectionStatus = 'online'

  private messageListeners = new Set<(msg: any) => void>()
  private statusListeners = new Set<(status: any) => void>()

 constructor(getUri: () => string | Promise<string>) {
  console.log('Mock WebSocket Adapter initialized')

  const uriResult = getUri()
  if (uriResult instanceof Promise) {
    uriResult.then((uri) => console.log('Connecting to', uri))
  } else {
    console.log('Connecting to', uriResult)
  }
}

  close() {
    this.isDisposed = true
    this.connectionStatus = 'offline'
    console.log('Mock socket closed')
  }

  sendMessage(msg: any) {
    console.log('Mock message sent:', msg)
    // Simulate echo
    setTimeout(() => {
      this.messageListeners.forEach((cb) => cb({ type: 'echo', data: msg }))
    }, 100)
  }

  onReceiveMessage(cb: (msg: any) => void) {
    this.messageListeners.add(cb)
    return () => this.messageListeners.delete(cb)
  }

  onStatusChange(cb: (status: any) => void) {
    cb({ status: this.connectionStatus }) // Initial emit
    this.statusListeners.add(cb)
    return () => this.statusListeners.delete(cb)
  }

  restart() {
    console.log('Mock socket restarted')
    this.connectionStatus = 'online'
    this.statusListeners.forEach((cb) => cb({ status: 'online' }))
  }
}
