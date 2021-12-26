import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEventListener } from 'ahooks';
import classnames from 'classnames/bind';
import style from './im.module.scss';
import Message, { IMessage } from '../../components/Message';
import { IconMicrophone } from '../../components/icons';
import {
  getImToken,
  sendRobot,
  createConversation,
  sendMessage,
  loadMessage,
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
  const [voiceStatus, setVoice] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<IMessage[]>([
    {
      role: 'sys_helper',
      content: {
        text: welcomeMsg,
      },
      type: 'text',
      timestamp: Date.now(),
    },
  ]);
  const wsRef = useRef<WS>();

  const callService = useCallback(async () => {
    const res = await createConversation();
    if (res?.data?.conv_id) {
      localStorage.setItem('conv_id', res?.data?.conv_id);
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
      setConvId(res?.data?.conv_id);
      setChatting(true);
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
  }, [setMessages, setConvId]);

  const send = useCallback(async () => {
    if (message) {
      messages.push({
        role: 'visitor',
        content: {
          text: message,
        },
        timestamp: Date.now(),
        type: 'text',
      });
      if (convId && inChatting) {
        await sendMessage({
          type: 'text',
          content: {
            text: message,
          },
          conv_id: convId,
        });
      } else {
        switch (message) {
          case '人工':
            callService();
            break;
          default: {
            const res = await sendRobot({ content: message });
            if (res?.data) {
              setMessages((ms) => [
                ...ms,
                {
                  role: 'sys_helper',
                  type: 'text',
                  content: {
                    text: res?.data?.resp_content,
                  },
                  timestamp: Date.now(),
                },
              ]);
            }
          }
        }
      }
      setMessage('');
    }
  }, [callService, setMessage, setMessages, convId, inChatting, messages, message]);

  const inputVoice = () => {
    window.startRecording();
    setVoice(1);
  };

  const stopVoice = async () => {
    setVoice(2);
    const res = await window.stopRecording();
    if (res?.code === 0) {
      setMessage(res?.data);
    }
    setVoice(0);
  };

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
        <div
          className={cx('input-audio')}
          onMouseDown={inputVoice}
          onMouseUp={stopVoice}
        >
          <IconMicrophone
            color={voiceStatus === 0 ? '#2c2c2c' : '#0168b7' }
            width={24}
            height={24}
          />
          {voiceStatus === 0
            ? '按住录音'
            : voiceStatus === 2
            ? '解析中'
            : '输入中'}
        </div>
        <input
          ref={inputRef}
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
};

export default Im;
