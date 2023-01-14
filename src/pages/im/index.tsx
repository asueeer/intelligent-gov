import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEventListener } from 'ahooks';
import { Notification, Button, Input } from '@arco-design/web-react';
import classnames from 'classnames/bind';
import style from './im.module.scss';
import Message, { IMessage } from '../../components/Message';
import InputVoice from '../../components/InputVoice';
import {
  getImToken,
  sendRobot,
  createConversation,
  sendMessage,
  loadMessage,
  transArti,
} from '../../services/api';
import { welcomeMsg } from '../../config'
import WS from '../../utils/websocket';

declare global {
  interface Window {
    startRecording: any;
    stopRecording: any;
  }
}

const cx = classnames.bind(style);

const Im: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [convId, setConvId] = useState<string>('');
  const [inChatting, setChatting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const wsRef = useRef<WS>();

  const scroll = useCallback(() => {
    if (winRef.current) {
      const top = winRef.current?.scrollHeight - winRef.current?.clientHeight;
      if (!isNaN(Number(top))) {
        winRef.current.scrollTo({
          top,
        });
      }
    }
  }, [winRef])

  const callService = useCallback(async () => {
    const res = await createConversation();
    let msg = '暂无客服，请稍后重试';
    if (res?.data?.conv_id) {
      localStorage.setItem('conv_id', res?.data?.conv_id);
      setConvId(res?.data?.conv_id);
      msg = '智能机器人为您服务中，请输入您的问题，如需人工服务请输入“人工”'
    }
    setMessages((ms) => [
      ...ms,
      {
        role: 'sys_helper',
        content: {
          text: msg,
        },
        timestamp: Date.now(),
        type: 'text',
      },
    ]);
  }, [setMessages, setConvId]);

  const callIMService = useCallback(async () => {
    if (convId) {
      const res = await transArti(convId);
      if (res?.meta?.code === 0) {
        setChatting(true);
        setMessages((ms) => [
          ...ms,
          {
            role: 'sys_helper',
            content: {
              text: '已为您转接人工客服，请等待客服接待...',
            },
            timestamp: Date.now(),
            type: 'text',
          },
        ]);
      }
    }
  }, [convId])

  const send = useCallback(async (msg?: string) => {
    const sendText = msg || message;
    if (sendText) {
      messages.push({
        role: 'visitor',
        content: {
          text: sendText,
        },
        timestamp: Date.now(),
        type: 'text',
      });
      if (!convId) {
        await callService();
      } else {
        if (inChatting) {
          await sendMessage({
            type: 'text',
            content: {
              text: sendText,
              service_name: msg || ''
            },
            conv_id: convId,
          });
        } else {
          switch (sendText) {
            case '人工':
              callIMService();
              break;
            default: {
              const key = msg ? 'service_name' : 'text';
              await sendMessage({ content: {
                [key]: sendText
              }, type: 'text', conv_id: convId });
            }
          }
        }
      }
      setMessage('');
      scroll();
    }
  }, [callService, callIMService, setMessage, convId, inChatting, messages, message, scroll]);

  useEventListener('keypress', (e) => {
    if (e?.key === 'Enter') {
      if (message) {
        send();
      } else {
        inputRef.current?.focus();
      }
    }
  })

  useEffect(() => {
    Notification.info({
      content: welcomeMsg,
      closable: true,
      duration: 8000,

    })
    getImToken();
    return () => {
      wsRef.current?.close();
    };
  }, []);
  useEffect(() => {
    if (convId) {
      // TODO: 交互恢复历史
      // loadMessage(convId, 0).then((res) => {
      //   if (res?.data?.messages) {
      //     setMessages(res?.data?.messages);
      //   }
      // });
      wsRef.current = new WS(String(sessionStorage.getItem('auth_token')));
      wsRef.current.on('101', (res) => {
        setMessages((ms) => [...ms, res]);
      });
      wsRef.current.on('105', (res) => {
        setMessages((ms) => [...ms, res]);
      })
      wsRef.current.on('103', () => {
        setMessages((ms) => [
          ...ms,
          {
            role: 'sys_helper',
            timestamp: Date.now(),
            type: 'text',
            content: {
              text: '人工客服来为您服务了',
            },
          },
        ]);
      });
    }
  }, [convId]);
  useEffect(() => {
    scroll();
  }, [messages, scroll]);

  return (
    <div className={cx('im')}>
      <div className={cx('header')}>智能客服</div>
      <div className={cx('window')} id="window" ref={winRef}>
        {messages?.map((m) => (
          <Message {...m} key={m?.message_id} send={send} />
        ))}
      </div>
      <div className={cx('input__wrapper')}>
        <InputVoice getText={text => setMessage(text)} />
        <Input size='large' placeholder='请输入问题' value={message} onChange={val => setMessage(val)} />
        <Button size='large' type='primary' onClick={() => send()}>发送</Button>
      </div>
    </div>
  );
};

export default Im;
