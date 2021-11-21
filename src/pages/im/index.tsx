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
import WS from '../../utils/websocket';

const cx = classnames.bind(style)

const Im: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [convId, setConvId] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const wsRef = useRef<WS>();

  const callService = async () => {
    if (convId) return;
    await getImToken();
    const res = await createConversation();
    if (res?.data?.conv_id) {
      localStorage.setItem('conv_id', res?.data?.conv_id);
      setMessages((ms) => [
        ...ms,
        {
          role: 'sys_helper',
          content: {
            text: '已为您转接人工客服',
          },
          timestamp: Date.now(),
          type: 'text',
        },
      ]);
      setConvId(res?.data?.conv_id);
    } else {
      setMessages((ms) => [
        ...ms,
        {
          role: 'sys_helper',
          content: {
            text: '暂无客服，请稍后重试',
          },
          timestamp: Date.now(),
          type: 'text',
        },
      ]);
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
      setMessages((ms) => [
        ...ms,
        {
          role: 'visitor',
          type: 'text',
          content: {
            text: message,
          },
          timestamp: Date.now(),
        },
      ]);
    } else {
      switch (message) {
        case '人工':
          callService();
      }
    }
    messages.push({
      role: 'visitor',
      content: {
        text: message,
      },
      timestamp: Date.now(),
      type: 'text',
    });
    setMessage('');
  }

  useEffect(() => {
    if (localStorage.getItem('conv_id')) {
      setConvId(String(localStorage.getItem('conv_id')));
    }
    return () => {
      console.warn('leave');
      wsRef.current?.close();
    }
  }, []);
  useEffect(() => {
    if (convId) {
      loadMessage(convId, 0).then(res => {
        if (res?.data?.messages) {
          setMessages(res?.data?.messages);
        }
      });
      wsRef.current = new WS(String(sessionStorage.getItem('auth_token')));
      wsRef.current.on('101', (res) => {
        setMessages(ms => [...ms, res]);
      })
    }
  }, [convId]);
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