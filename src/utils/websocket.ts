const host = 'wss://asueeer.com'
class WS {
  ws?: WebSocket;
  cbs: Record<string, ((msg: any) => void)[]>;
  interval: NodeJS.Timer | null;
  constructor(auth_token?: string) {
    const service_token = sessionStorage.getItem('service_token');
    if (auth_token) {
      this.ws = new WebSocket(`${host}/ws?auth_token=${auth_token}`)
    } else if (service_token) {
      this.ws = new WebSocket(`${host}/ws?auth_token=${service_token}`);
    }
    this.init();
    this.interval = null;
    this.cbs = {};
  }
  init() {
    if (!this.ws) return;
    this.ws.onopen = () => {
      console.log( "ws connected");
      this.interval = setInterval(() => {
        this.ws?.send(JSON.stringify({
          type: 0,
          message: 'heartbeats'
        }))
      }, 30000);
    }
    this.ws.onmessage = (evt) => {
      if (evt.data) {
        this.receiveMessage(evt.data);
      }
    }
    this.ws.onerror = () => {
      if (this.interval) {
        clearInterval(this.interval)
      }
    }
    this.ws.onclose = () => {
      if (this.interval) {
        clearInterval(this.interval)
      }
    }
  }
  receiveMessage(messageData:string) {
    try {
      const { type, msg } = JSON.parse(messageData);
      if (Array.isArray(this.cbs[type])) {
        for (const cb of this.cbs[type]) {
          cb?.(msg)
        }
      }
    } catch {
    }
  }
  on(type: string, cb: (msg: any) => void) {
    if (Array.isArray(this.cbs[type])) {
      this.cbs[type].push(cb);
    } else {
      this.cbs[type] = [cb];
    }
  }
  close() {
    this.ws?.close();
  }
}

export default WS;