import React, { useMemo } from 'react';
import classnames from 'classnames/bind';
import styles from './selecter.module.scss';

const cx = classnames.bind(styles);

type configItem = {
  value: string | number;
  name: string;
};
interface ISelector {
  show: boolean;
  value?: string | number;
  label?: string;
  config: Array<configItem>;
  close?: boolean;
  onClick: () => void;
  onSelect: (value: string | number) => void;
}
const Selector: React.FC<ISelector> = prop => {
  const { value, label, config, onSelect, onClick } = prop;
  const name = useMemo(()=> {
    return config.find(c => c.value === value)?.name || config?.[0]?.name || '全部';
  }, [value, config]);

  const pick = (item: configItem) => {
    if (onSelect) onSelect(item?.value);
  }

  return (
    <div className={cx("selector")}>
      <div className={cx("flex")}>
        <span className={cx("label")}>{label}: </span>
        <span className={cx("name")} onClick={onClick}>
          {name}
        </span>
      </div>
      <div className={cx("options")}>
        {config.map((c) => (
          <div
            className={cx("option")}
            onClick={() => pick(c)}
            key={c?.value}
          >
            {c?.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Selector;