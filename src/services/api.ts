import { obj2Query } from '../utils/tools';
const origin = 'http://10.13.56.36:8080';

interface requestConfig {
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers?: Record<string, any>;
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
  let _url = url.startsWith('http') ? url : `${origin}${url}`;
  const { method = 'GET', headers = {} } = options || {};
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
export const getQuerySuggestion = async (query: string) => sendRequest('/api/suggest/result', {
  query,
  page_size: 5
});

export const getSearchResult = (params: searchParams) => sendRequest('/api/search/result/v2', {
  type: 'ALL', // default value
  ...params,
  page_size: 10
});

export const getArticleDetail = (id: number) => sendRequest('/api/search/result', {
  id
});
// 客服 origin https://asueeer.com
/**
 * 
 * @param id 用户 userid
 * @param secret `sha256(${id}&${YYYY-MM-DD}&${day}) || pass`
 * @returns token
 */
export const getImToken = async () => {
  let token = sessionStorage.getItem('auth_token');
  if (token) return token;
  const id = localStorage.getItem('visitorId');
  const res = await sendRequest('https://asueeer.com/api/get_token', {
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
 * 
 * @param token getToken 获取的 token
 * @returns {string} conv_id 会话id
 */
export const createConversation = () => sendRequest(`https://asueeer.com/api/im/create_conversation?auth_token=${sessionStorage.getItem('auth_token')}`, {
  type: 'helper',
}, {
  method:'POST',
});

export const sendMessage = async (params: { type: messageType; conv_id: string; content: any }) => {
  const { type, content, conv_id } = params;
  sendRequest(`https://asueeer.com/api/im/send_message?auth_token=${sessionStorage.getItem('auth_token')}`, {
    type, content, conv_id,
    role: 'visitor',
    timestamp: Date.now()
  }, {
    method: 'POST'
  })
}

export const loadMessage = (conv_id: string, cursor: number) => sendRequest(`https://asueeer.com/api/im/load_conversation_detail?auth_token=${sessionStorage.getItem('auth_token')}`, {
  conv_id,
  cursor: `${cursor}`,
  limit: 20
}, {
  method: 'POST',
})

/**
 * 客服相关接口，目前通过 mock_login 参数鉴权
 * // TODO: 客服登录
 */

export const loadServiceMessage = (conv_id: string, cursor: number) => sendRequest('https://asueeer.com/api/im/load_conversation_detail?mock_login=123', {
  conv_id,
  cursor: `${cursor}`,
  limit: 10
}, {
  method: 'POST',
})

export const sendServiceMessage = async (params: { type: messageType; conv_id: string; content: any }) => {
  const { type, content, conv_id } = params;
  sendRequest('https://asueeer.com/api/im/send_message?mock_login=123', {
    type, content, conv_id,
    role: 'be_helper',
    timestamp: Date.now()
  }, {
    method: 'POST'
  })
}

export const loadMessageList = () => sendRequest('https://asueeer.com/api/im/load_conversations?mock_login=123', {}, {
  method: 'POST',
})

export const report = (eventPramse: reportEvent) => sendRequest('/api/eventTracking', {
  event: eventPramse.eventName,
  header: encodeURIComponent(JSON.stringify(eventPramse.header)),
  params: encodeURIComponent(JSON.stringify(eventPramse.params)),
});