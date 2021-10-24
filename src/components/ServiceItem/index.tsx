import React from 'react'
import dayjs from 'dayjs';
import classnames from 'classnames/bind'
import style from './service.module.scss'
import { IMessage } from '../Message'

const cx = classnames.bind(style)
export interface IServiceItem {
  user?: string; // 用户名
  conv_id: string;
  timestamp: number;
  last_msg: IMessage;
  active?: boolean;
  unread?: number;
  onSelect: () => void;
}

const ServiceItem: React.FC<IServiceItem> = (prop) => {
  const { user, conv_id, last_msg, timestamp, unread, active, onSelect } = prop;
  console.warn(last_msg);

  return (
    <div className={cx('wrapper', { active })} onClick={() => onSelect()}>
      <div className={cx('title')}>{conv_id}</div>
      <div className={cx('abstract')}>{last_msg?.content?.[last_msg?.type||'text']||'暂无消息'}</div>
      <div className={cx('time')}>{dayjs(timestamp).format('MM-DD HH:mm')}</div>
      {unread && <div className={cx('alert')}>{unread}</div>}
    </div>
  );
};

export default ServiceItem;