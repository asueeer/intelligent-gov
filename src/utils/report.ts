import { report } from '../services/api'

export default class Log {
  userAgent: string;
  url?: string;
  did: string;
  initParams?: Record<string, any>;

  constructor(initConfig?: Record<string, any>) {
    const { userAgent } = navigator;
    const { href } = window.location;
    this.userAgent = userAgent;
    // this.url = href;
    this.did = localStorage.getItem('visitorId') || '';
    this.initParams = initConfig;
  }

  send(eventName: string, evnetParams: Record<string, any>) {
    const header = {
      userAgent: this.userAgent,
      // url: this.url,
      did: this.did
    };
    const params = {
      ...this.initParams,
      ...evnetParams
    };
    report({
      eventName,
      header,
      params
    })
  }
}