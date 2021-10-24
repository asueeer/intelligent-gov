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
    if (current < 5) {
      start = 1;
    } else if (current > 5 && current + 4 < total) {
      start = current - 5;
    } else {
      start = total - 9;
    }
    return new Array(Math.min(10, total)).fill('').map((_, index) => index + start);
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
