import React, { useEffect, useState } from 'react';
import classnames from 'classnames/bind';
import { Selector } from '../../../components';
import { searchCategory, searchConfig } from '../../../config';
import style from './selectors.module.scss';

const cx = classnames.bind(style);
interface ISelector {
  params: Record<string, string|number>;
  updateParams: (name: string, value: string|number) => void;
  updateCate: (value: string) => void;
}
const Selectors: React.FC<ISelector> = (prop) => {
  const { params, updateParams, updateCate } = prop;
  const [currentParam, setCurrent] = useState<string>('');
  const [categoryIndex, setCategory] = useState<number>(0);

  useEffect(() => {
    updateCate(searchCategory[categoryIndex]?.value);
  }, [categoryIndex, updateCate]);

  const pickParam = (value: string | number, name: string) => {
    updateParams(name, value);
    setCurrent('');
  };

  const pickCategory = (index: number) => {
    setCategory(index);
  }

  return (
    <div className={cx('config__wrapper')}>
      <div className={cx('categorise')}>
        {searchCategory?.map((category, index) => (
          <div
            className={cx('category', { active: index === categoryIndex })}
            onClick={() => pickCategory(index)}
            key={category?.value}
          >
            {category?.name}
          </div>
        ))}
      </div>
      <div className={cx('params')}>
        {searchConfig?.map((selector) => (
          <div className={cx('selector__wrapper')} key={selector?.value}>
            <Selector
              value={params?.[selector?.value]}
              label={selector?.label}
              show={currentParam === selector?.value}
              config={selector?.list}
              onClick={() => setCurrent(selector?.value)}
              onSelect={(v) => pickParam(v, selector?.value)}
            ></Selector>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Selectors;