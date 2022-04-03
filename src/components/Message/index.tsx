import React from 'react'
import classnames from 'classnames/bind'
import dayjs from 'dayjs'
import style from './message.module.scss'

const cx = classnames.bind(style)
type contentType = 'text' | 'image' | 'rich_text' | 'audio' | 'video' | 'question';
type roleType = 'visitor' | 'be_helper' | 'sys_helper';
export interface IMessage {
  message_id?: string;
  role: roleType;
  type: contentType;
  content: {
    text?: string;
    image?: string;
    rich_text?: string;
    audio?: string;
    video?: string;
    link?: string;
    // 选择题类型
    question?: {
      title: string; // 题目
      // value: number | boolean | string;
      options: Array<{
        label: string;
        value: number | boolean | string;
      }>
      more: 'input'
    };
  };
  timestamp: number;
  rightRole?: roleType;
}
function Content(prop: { type?: contentType, content: string }) {
  const { type, content } = prop;
  switch(type) {
    case 'image':
      return (
        <img className={cx('img')} src={content} alt="" />
      );
    case 'text':
    default:
      return (
        <div className={cx('text')}>{content}</div>
      )
  }
}
const Message: React.FC<IMessage> = prop => {
  const { role, type, content, timestamp, rightRole = 'visitor' } = prop;
  const avatar = role === 'visitor'
  ? 'https://zwdt.sh.gov.cn/smzy/qa/img/8666fc69f6c7d9358a9bd3f3beeb405d.png'
  : 'https://zwdt.sh.gov.cn/smzy/qa/img/9a4644558f7c5e724244013a7111c79f.png';
  return (
    <div className={cx('wrapper', { right: role === rightRole })}>
      <div className={cx('avatar')}>
        <img className={cx('avatar-img')} alt="" src={avatar} />
      </div>
      <div className={cx('bubble')}>
        <Content type={type} content={content?.[type] as string} />
        {content?.link && <a href={content.link} className={cx('link')}>办理服务</a>}
        <div className={cx('time')}>
          {dayjs(timestamp).format('YYYY-MM-DD HH:mm')}
        </div>
      </div>
    </div>
  );
}

export default Message;
