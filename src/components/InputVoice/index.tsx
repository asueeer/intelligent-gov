import React, { useState } from 'react';
import classnames from 'classnames/bind';
import { IconMicrophone } from '../../components/icons';
import style from './index.module.scss';

interface IInputVoice {
  getText: (text: string) => void;
}
const cx = classnames.bind(style);
const InputVoice: React.FC<IInputVoice> = ({ getText }) => {
  const [voiceStatus, setVoice] = useState<number>(0);

  const inputVoice = () => {
    window.startRecording();
    setVoice(1);
  };

  const stopVoice = async () => {
    setVoice(2);
    const res = await window.stopRecording();
    if (res?.code === 0) {
      getText(res?.data);
    }
    setVoice(0);
  };

  return (
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
  )
}

export default InputVoice;