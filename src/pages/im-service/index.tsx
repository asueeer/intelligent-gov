import React, { useEffect, useMemo, useState, useRef } from 'react'
import classnames from 'classnames/bind'
import style from './im.module.scss'
import Message, {IMessage} from '../../components/Message'
import {
  loadMessageList,
  loadServiceMessage,
  sendServiceMessage,
} from '../../services/api';
import ServiceItem from '../../components/ServiceItem';
import WS from '../../utils/websocket';

interface convItem {
  conv_id: string;
  last_msg: IMessage;
  timestamp: number;
}

const cx = classnames.bind(style)

const ImService: React.FC = () => {
  const [convList, setList] = useState<convItem[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [msgIndex, setIndex] = useState<number>(-1);
  const wsRef = useRef<WS>();
  const convId = useMemo(() => {
    return convList?.[msgIndex]?.conv_id;
  }, [convList, msgIndex])

  const fetctConvList = async () => {
    const res = await loadMessageList();
    if (Array.isArray(res?.data?.conversations)) {
      setList(res?.data?.conversations);
    }
  };

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
    });
    setMessage('');
  }
  const selectItem = (i: number) => {
    setIndex(i);
  }

  useEffect(() => {
    if (convId) {
      loadServiceMessage(convId, 0).then((res) => {
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
    fetctConvList();
    wsRef.current = new WS();
    wsRef.current.on('101', (res) => {
      const { content, conv_id } = res;
      setList((l) => l.map((c) => c.conv_id === conv_id ? {
        ...c,
        last_msg: {
          ...c.last_msg,
          content
        }
      } : c));
      
    });
    wsRef.current.on('102', (res) => {
      setList(l => [...l, res]);
    });
    return () => {
      wsRef.current?.close();
    }
  }, []);
  return (
    <div className={cx('im')}>
      <div className={cx('header')}>客服工作台</div>
      <div className={cx('list')}>
        {convList?.map((c, index) => (
          <ServiceItem
            {...c}
            key={c?.conv_id}
            active={index === msgIndex}
            onSelect={() => selectItem(index)}
          />
        ))}
      </div>
      <div className={cx('main')}>
        <div className={cx('window')} id="window">
          {messages?.map((m) => (
            <Message {...m} rightRole='be_helper' />
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
    </div>
  );
}

export default ImService;