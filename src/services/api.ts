import { obj2Query } from '../utils/tools';
import { searchHost, imHost } from '../config';

interface requestConfig {
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers?: Record<string, any>;
  originName?: 'search' | 'im'
}
type messageType = 'text' | 'rich_text' | 'image' | 'audio' | 'video';
type messageRole = 'visitor' | 'sys_helper' | 'be_helper';
interface searchParams {
  query: string;
  input: string;
  select: string;
  webID: string;
  category?: string; // 分类名，有很多种
  sort_by?: string, // TIME | INTELLIGENT
  page_number: number;
  type?: string; // tab 名
  range?: string;
  time?: string; // FIXME: use em=num
}
interface reportEvent {
  eventName: string;
  header: {
    did: string;
    userAgent: string;
    url?: string;
  };
  params: Record<string, any>;
}
const sendRequest = (url: string, data: Record<string, any>, options?: requestConfig) => {
  // Default options are marked with *
  const { method = 'GET', headers = {}, originName } = options || {};
  const origin = originName === 'search' ? searchHost : imHost;
  let _url = url.startsWith('http') ? url : `${origin}${url}`;
  const fetchConfig: RequestInit = {
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers,
    method, // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
  }
  if (method === 'GET') {
    _url += obj2Query(data);
  } else if (method === 'POST') {
    fetchConfig.body = JSON.stringify(data); // must match 'Content-Type' header
  }

  return fetch(_url, fetchConfig)
  .then(response => response.json()) // parses response to JSON
  .then(data => {
    return data || {};
  }).catch((e) => {
    console.warn('fetch error', e);
  });
}
// 客服登陆
export const loginService = async (username: string, password: string) => sendRequest('/api/login', {
  username,
  password
}, {
  method: 'POST'
})
// 获取推荐
export const getQuerySuggestion = async (query: string) => sendRequest('/api/suggest/result', {
  query,
  page_size: 5
}, {
  originName: 'search'
});
// 获取搜索结果
export const getSearchResult = (params: searchParams) => sendRequest('/api/search/result/v2', {
  type: 'ALL', // default value
  ...params,
  page_size: 10
}, {
  originName: 'search'
});
/**
 * 获取客服 token
 * @param id 用户 userid
 * @param secret `sha256(${id}&${YYYY-MM-DD}&${day}) || pass`
 * @returns token
 */
export const getImToken = async () => {
  let token = sessionStorage.getItem('auth_token');
  if (token) return token;
  const id = localStorage.getItem('visitorId');
  const res = await sendRequest('/api/get_token', {
    // user_id: id,
    finger_print: id,
    // secret: 'pass', // TODO: use sha256 encode
  }, {
    method: 'POST',
  });
  if (res?.data) {
    sessionStorage.setItem('auth_token', res?.data?.token);
    return res?.data?.token;
  }
};

/**
 * 创建人工会话
 * @param token getToken 获取的 token
 * @returns {string} conv_id 会话id
 */
export const createConversation = () => sendRequest(`/api/im/create_conversation?auth_token=${sessionStorage.getItem('auth_token')}`, {
  type: 'helper',
}, {
  method:'POST',
});
// 发送人工客服消息
export const sendMessage = async (params: { type: messageType; conv_id: string; content: any }) => {
  const { type, content, conv_id } = params;
  sendRequest(`/api/im/send_message?auth_token=${sessionStorage.getItem('auth_token')}`, {
    type, content, conv_id,
    role: 'visitor',
    timestamp: Date.now()
  }, {
    method: 'POST'
  })
}
// 发送机器人消息
export const sendRobot: (params: { content: any }) => Promise<{data: {resp_content: string}}> = async ({ content }) =>
  sendRequest(`https://asueeer.com/api/im/send_robot?auth_token=${sessionStorage.getItem('auth_token')}`, {
    content: {
      text: String(content)
    },
    timestamp: Date.now()
  }, {
    method: 'POST'
  });
// 加载会话历史信息
export const loadMessage = (conv_id: string, cursor: number) => sendRequest(`/api/im/load_conversation_detail?auth_token=${sessionStorage.getItem('auth_token')}`, {
  conv_id,
  cursor: `${cursor}`,
  limit: 20
}, {
  method: 'POST',
})
// 加载客服历史会话
export const loadServiceMessage = (conv_id: string, cursor: number, service_token: string) => sendRequest(`/api/im/load_conversation_detail?auth_token=${service_token}`, {
  conv_id,
  cursor: `${cursor}`,
  limit: 10
}, {
  method: 'POST',
})
// 客服发送信息
export const sendServiceMessage = async (params: { type: messageType; conv_id: string; content: any }, service_token: string) => {
  const { type, content, conv_id } = params;
  sendRequest(`/api/im/send_message?auth_token=${service_token}`, {
    type, content, conv_id,
    role: 'be_helper',
    timestamp: Date.now()
  }, {
    method: 'POST'
  })
}
// 加载会话列表
export const loadMessageList = (token: string) => sendRequest(`/api/im/load_conversations?auth_token=${token}`, {
  status: ['chatting', 'waiting']
}, {
  method: 'POST',
})
// 接入会话工单
export const acceptConversation = (covId: string, token: string) => sendRequest(`/api/im/accept_conversation?auth_token=${token}`, {
  conv_id: covId,
}, {
  method: 'POST'
})
// 上报信息
export const report = (eventPramse: reportEvent) => sendRequest('/api/eventTracking', {
  event: eventPramse.eventName,
  header: encodeURIComponent(JSON.stringify(eventPramse.header)),
  params: encodeURIComponent(JSON.stringify(eventPramse.params)),
}, {
  originName: 'search'
});