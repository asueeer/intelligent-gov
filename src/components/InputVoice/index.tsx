import React, { useMemo, useState } from 'react';
import classnames from 'classnames/bind';
import { Button } from '@arco-design/web-react';
import { IconVoice } from '@arco-design/web-react/icon';
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

  const text = useMemo(() => voiceStatus === 0
    ? '按住录音'
    : voiceStatus === 2
      ? '解析中'
      : '输入中', [voiceStatus])

  return (
    <div
        onMouseDown={inputVoice}
        onMouseUp={stopVoice}
      >
      <Button icon={<IconVoice />} size='large' type='outline'>
        {text}
      </Button>
    </div>
  )
}

export default InputVoice;