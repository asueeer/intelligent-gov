import React, { useEffect, useMemo, useState, useRef } from 'react'
import classnames from 'classnames/bind'
import style from './im.module.scss'
import Message, {IMessage} from '../../components/Message'
import {
  loadMessageList,
  loadServiceMessage,
  sendServiceMessage,
  loginService,
  acceptConversation,
} from '../../services/api';
import ServiceItem from '../../components/ServiceItem';
import WS from '../../utils/websocket';

type Status = 'waiting' | 'chatting' | 'end';
interface convItem {
  conv_id: string;
  last_msg: IMessage;
  status: Status;
  timestamp: number;
}

const cx = classnames.bind(style)

const ImService: React.FC = () => {
  const [login, setLogin] = useState<string>('');
  const [loginForm, setLoginForm] = useState<Record<string, string>>({});
  const [convList, setList] = useState<convItem[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [convId, setConvid] = useState<string>('');
  const [waitStatus, setWaiting] = useState(false); 
  const wsRef = useRef<WS>();
  const [chatting, waiting, end] = useMemo(() => {
    const map: Status[] = ['chatting', 'waiting', 'end']
    return map.map(status => convList?.filter(c => c?.status === status));
  }, [convList])

  const fetchConvList = async (token: string) => {
    setLogin(token);
    const res = await loadMessageList(token);
    if (Array.isArray(res?.data?.conversations)) {
      setList(res?.data?.conversations);
      wsRef.current = new WS();
      wsRef.current.on('101', (res) => {
        const { content, conv_id } = res;
        setList((l) =>
          l.map((c) =>
            c.conv_id === conv_id
              ? {
                  ...c,
                  last_msg: {
                    ...c.last_msg,
                    content,
                  },
                }
              : c
          )
        );
      });
      wsRef.current.on('102', (res) => {
        setList((l) => [...l, res]);
      });
    }
  };

  const onLogin = async () => {
    const { username, password } = loginForm;
    const res = await loginService(username, password);
    if (res?.data?.token) {
      alert('登陆成功');
      fetchConvList(res?.data?.token);
      sessionStorage.setItem('service_token', res?.data?.token);
    }
  }

  const send = async () => {
    setMessages((ms) => [
      ...ms,
      {
        role: 'be_helper',
        type: 'text',
        content: {
          text: message,
        },
        conv_id: convId,
        timestamp: Date.now(),
      },
    ]);
    await sendServiceMessage({
      type: 'text',
      content: {
        text: message,
      },
      conv_id: convId,
    }, login);
    setMessage('');
  }
  const selectItem = (info: convItem) => {
    const { conv_id, status } = info
    setConvid(conv_id);
    setWaiting(status === 'waiting')
  }

  const checkin = async () => {
    const service_token = sessionStorage.getItem('service_token');
    if (service_token) {
      const res = await acceptConversation(convId, service_token);
      if (res?.meta?.code === 0){
        alert('接单成功');
        fetchConvList(service_token);
      }
    }
  }

  useEffect(() => {
    if (convId) {
      loadServiceMessage(convId, 0, login).then((res) => {
        if (Array.isArray(res?.data?.messages)) {
          setMessages(res?.data?.messages);
        }
      });
    }
  }, [convId, convList]);

  useEffect(() => {
    const win = document.querySelector('#window');
    if (win) {
      const top = win?.scrollHeight - win?.clientHeight;
      if (!isNaN(Number(top))) {
        win.scrollTo({
          top
        })
      }
    }
  }, [messages]);

  useEffect(() => {
    const auth_token = sessionStorage.getItem('service_token');
    if (auth_token) {
      fetchConvList(auth_token);
    }
    return () => {
      wsRef.current?.close();
    }
  }, []);

  return !login ? (
    <div className={cx('login')}>
      <div className={cx('username')}>
        <span className={cx('label')}>用户名</span>
        <input
          type="text"
          value={loginForm?.username}
          onChange={(e) =>
            setLoginForm((f) => ({ ...f, username: e?.target?.value }))
          }
        />
      </div>
      <div className={cx('username')}>
        <span className={cx('label')}>密码</span>
        <input
          type="password"
          value={loginForm?.password}
          onChange={(e) =>
            setLoginForm((f) => ({ ...f, password: e?.target?.value }))
          }
        />
      </div>
      <div className={cx('confirm')} onClick={onLogin}>
        确认
      </div>
    </div>
  ) : (
    <div className={cx('im')}>
      <div className={cx('header')}>客服工作台</div>
      <div className={cx('list')}>
        <div className={cx('sublist')}>
          <div className={cx('title')}>正在进行中</div>
          {chatting?.length > 0 ? (
            chatting?.map((c, index) => (
              <ServiceItem
                {...c}
                key={c?.conv_id}
                active={c?.conv_id === convId}
                onSelect={() => selectItem(c)}
              />
            ))
          ) : (
            <div className={cx('empty')}>暂无</div>
          )}
        </div>
        <div className={cx('sublist')}>
          <div className={cx('title')}>等待接单</div>
          {waiting?.length > 0 ? (
            waiting?.map((c, index) => (
              <ServiceItem
                {...c}
                key={c?.conv_id}
                active={c?.conv_id === convId}
                onSelect={() => selectItem(c)}
              />
            ))
          ) : (
            <div className={cx('empty')}>暂无</div>
          )}
        </div>
        <div className={cx('sublist')}>
          <div className={cx('title')}>已结束</div>
          {end?.length > 0 ? (
            end?.map((c, index) => (
              <ServiceItem
                {...c}
                key={c?.conv_id}
                active={c?.conv_id === convId}
                onSelect={() => selectItem(c)}
              />
            ))
          ) : (
            <div className={cx('empty')}>暂无</div>
          )}
        </div>
      </div>
      <div className={cx('main')}>
        <div className={cx('window')} id="window">
          {messages?.map((m) => (
            <Message {...m} rightRole="be_helper" key={m?.message_id} />
          ))}
        </div>
        {waitStatus ? (
          <div className={cx('checkin')} onClick={checkin}>等待中，点击接单</div>
        ) : (
          <div className={cx('input__wrapper')}>
            <input
              className={cx('input-box')}
              value={message}
              onChange={({ target }) => setMessage(target?.value)}
            />
            <div className={cx('input-button')} onClick={send}>
              发送
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImService;