import React, { useEffect, useRef, useState } from 'react'
import classnames from 'classnames/bind'
import style from './im.module.scss'
import Message, {IMessage} from '../../components/Message'
import {
  getImToken,
  createConversation,
  sendMessage,
  loadMessage,
} from '../../services/api';

const cx = classnames.bind(style)

const Im: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [convId, setConvId] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const pullRef = useRef<NodeJS.Timeout|null>(null);

  const loadConversation = async (id: string) => {
    const res = await loadMessage(id, 0);
    if (Array.isArray(res?.data?.messages)) {
      setMessages(res?.data?.messages);
    }
  }

  // const setFetcher = (id: string) => {
  //   pullRef.current = setInterval(async () => {
  //     // TODO: 拉取最新
  //   }, 5000);
  // };

  const callService = async () => {
    await getImToken();
    const res = await createConversation();
    if (res?.data?.conv_id) {
      localStorage.setItem('conv_id', res?.data?.conv_id);
      messages.push({
        role: 'sys_helper',
        content: {
          text: '已为您转接人工客服'
        },
        timestamp: Date.now(),
        type: 'text'
      });
      setConvId(res?.data?.conv_id);
    }
  }

  const send = async () => {
    if (convId) {
      await sendMessage({
        type: 'text',
        content: {
          text: message
        },
        conv_id: convId,
      });
      setTimeout(async () => {
        await loadConversation(convId);
      }, 1000);
    } else {
      switch (message) {
        case '人工':
          callService();
      }
      messages.push({
        role: 'visitor',
        content: {
          text: message,
        },
        timestamp: Date.now(),
        type: 'text',
      });
    }
    setMessage('');
  }
  useEffect(() => {
    const win = document.querySelector('#window');
    if (win) {
      const top = win?.scrollHeight - win?.clientHeight;
      if (!isNaN(Number(top))) {
        win.scrollTo({
          top,
        });
      }
    }
  }, [messages]);
  useEffect(() => {
    let t: null | NodeJS.Timer = null;
    if (localStorage.getItem('conv_id')) {
      loadConversation(String(localStorage.getItem('conv_id')));
      t = setInterval(() => {
        loadConversation(String(localStorage.getItem('conv_id')));
      }, 10000);
      setConvId(String(localStorage.getItem('conv_id')));
    } else {
      setMessages((m) =>
        m.concat([
          {
            role: 'sys_helper',
            content: {
              text: '我是智能客服，请问您有什么需要帮助？\n发送“人工”可以请求人工客服'
            },
            timestamp: Date.now(),
            type: 'text'
          },
        ])
      );
    }
    return () => {
      if (pullRef.current) clearInterval(pullRef.current);
      if (t) clearInterval(t);
    }
  }, [])
  return (
    <div className={cx('im')}>
      <div className={cx('header')}>智能客服</div>
      <div className={cx('window')} id="window">
        {messages?.map((m) => (
          <Message {...m} key={m?.message_id} />
        ))}
      </div>
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
    </div>
  );
}

export default Im;