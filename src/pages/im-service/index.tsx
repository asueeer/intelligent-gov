import React, { useEffect, useMemo, useState } from 'react'
import classnames from 'classnames/bind'
import style from './im.module.scss'
import Message, {IMessage} from '../../components/Message'
import {
  loadMessageList,
  loadServiceMessage,
  sendServiceMessage,
} from '../../services/api';
import ServiceItem from '../../components/ServiceItem';

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
    await sendServiceMessage({
      type: 'text',
      content: {
        text: message,
      },
      conv_id: convId,
    });
    setMessage('');
    setTimeout(async () => {
      const res = await loadServiceMessage(convId, 0);
      if (Array.isArray(res?.data?.messages)) {
        setMessages(res?.data?.messages);
      }
    }, 1000);
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
  }, [convId]);

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
    const t = setInterval(() => {
      fetctConvList();
    }, 5000);
    return () => {
      clearInterval(t);
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