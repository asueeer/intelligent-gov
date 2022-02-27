import classnames from 'classnames/bind';
import React, { useMemo } from 'react';
import styles from './pagination.module.scss';

interface IPagination {
  total: number;
  current: number;
  jump: (page: number) => void;
}

const cx = classnames.bind(styles);

const Pagination: React.FC<IPagination> = prop => {
  const { total, current, jump } = prop;
  const list = useMemo<number[]>(() => {
    let start = current;
    if (total > 10) {
      if (total - current > 4) {
        start = current - 5 > 0 ? current - 5 : 1;
      } else {
        start = total - 9;
      }
      return new Array(10).fill('').map((_, index) => index + start);
    } else {
      return new Array(total).fill('').map((_, index) => index + 1);
    }
  }, [current, total]);

  return (
    <div className={cx('pagination')}>
      {list.map(p => (
        <div className={cx('page', { curr: current === p})} onClick={() => jump(p)}>{p}</div>
      ))}
    </div>
  );
};
export default Pagination;
