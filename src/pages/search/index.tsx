import React from 'react';
import classnames from 'classnames/bind';
import style from './search.module.scss';

const cx = classnames.bind(style);

const Search = () => {
    return (
        <div className={cx('page')}>search</div>
    )
}

export default Search;