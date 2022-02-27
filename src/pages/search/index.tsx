import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loading, Pagination } from '../../components';
import Selectors from './Selectors';
import InputVoice from '../../components/InputVoice';
import classnames from 'classnames/bind';
import dayjs from 'dayjs';

import {
  getQuerySuggestion,
  getSearchResult,
} from "../../services/api";
import Log from '../../utils/report';
import style from './search.module.scss';

const cx = classnames.bind(style);
const log = new Log();

const Search: React.FC = () => {
  const [list, setList] = useState<Array<string>>([]);
  const [result, setResult] = useState<Array<any>>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [inputFocus, setInputFocus] = useState<boolean>(false);
  const [params, setParams] = useState<Record<string, string|number>>({});
  const [category, setCategory] = useState<string>('ALL'); // TODO: select cate
  const [type, setType] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);
  const timer = useRef<NodeJS.Timeout>();

  const checkSuggestion = () => {
    if (query) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        getQuerySuggestion(query).then((res) => {
          setList(res?.results)
        });
      }, 500);
    } else {
      setList([]);
    }
  }

  const onInputFocus = () => {
    setInputFocus(true);
    checkSuggestion();
  }

  const onInputBlur = () => {
    setInputFocus(false);
  }

  const search = useCallback((input?: string, select?: boolean) => {
    if (!input && !query) {
      return;
    }
    if (select && input) {
      setQuery(input);
      log.send('pick_suggestion', {
        query,
        suggestion: input,
      });
    } else if (query) {
      log.send('search_query', {
        query,
      });
    }
      getSearchResult({
        query: input || query, // FIXME:
        input: input || '',
        select: select ? input || '' : '',
        webID: String(localStorage.getItem('visitorId')),
        page_number: page,
        type,
        category,
        ...params,
      }).then((res) => {
        const { list, total } = res?.data;
        if (list?.length) {
          setResult(list as Array<any>);
          setTotalPage(Math.ceil(total / 10));
          setLoading(false);
        }
      });
    },[query, category, params, type, page]);

  const clickResult = (detail: any) => {
    const { title, category, department, serviceLink } = detail;
    log.send('click_result', {
      title,
      category,
      department,
      serviceLink,
    });
  }

  useEffect(() => {
    checkSuggestion();
  }, [query]);

  useEffect(() => {
    document.title = '智能搜索';
    search(query);
  }, []);

  useEffect(() => {
      setPage(1);
      search();
  }, [params, type, search]);

  const pickParam = (name: string, value: string | number) => {
    setParams((p) => ({ ...p, [name]: value }));
  };

  const service = (link: string, e: any) => {
    e.stopPropagation();
    window.open(link);
  }

  return (
    <div className={cx('page')}>
      <Link className={cx('service', 'im-service')} to="/im">客服</Link>
      <div className={cx('flex__wrapper', { focus: inputFocus || query })}>
        <div className={cx('padding')}></div>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <img
              className={cx('header__img')}
              src="/bg.jpeg"
              alt=""
            />
          </div>
          <div className={cx('search__wrapper')}>
            <InputVoice getText={text => setQuery(text)} />
            <div className={cx('search', 'search-common')}>
              <div className={cx('input')}>
                <input
                  className={cx('input_el', 'query')}
                  onChange={({ target }) => setQuery(target?.value)}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  value={query}
                ></input>
              </div>
              <div className={cx('button')} onClick={() => search(query)}>
                搜索
              </div>
            </div>
            <div
              className={cx('recommends', 'search-common', {
                show: Boolean(list?.length > 0 && inputFocus),
              })}
            >
              {list?.map((l) => (
                <div className={cx('query')} onClick={() => search(l, true)}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Selectors
        params={params}
        updateParams={pickParam}
        updateCate={(value) => setType(value)}
      />
      {loading ? (
        <Loading />
      ) : (
        <div className={cx('body')}>
          <div className={cx('result__wrapper')}>
            {result?.map((res) => (
              <a
                className={cx('result')}
                href={res?.contextLink}
                onClick={() => clickResult(res)}
                rel="noreferrer"
                target="_blank"
              >
                <div className={cx('title')}>
                  {res?.category && (<div className={cx('category')}>{res?.category?.split(';')?.[0]}</div>)}
                  <span
                    className={cx('link')}
                    dangerouslySetInnerHTML={{ __html: res?.title }}
                  ></span>
                </div>
                <div className={cx('detail')}>
                  <span
                    className={cx('link')}
                    dangerouslySetInnerHTML={{ __html: res?.abs }}
                  ></span>
                </div>
                {res?.department && (
                  <div className={cx('department')}>
                    办理机构：{res.department}
                  </div>
                )}
                {res?.serviceLink && (
                  <div
                    className={cx('service')}
                    onClick={(e) => service(res.serviceLink, e)}
                  >
                    立即办理
                  </div>
                )}
                {res?.time && (<div className={cx('time')}>
                  时间：{dayjs(res?.time).format('YYYY-MM-DD')}
                </div>)}
              </a>
            ))}
          </div>
          <div className={cx('right')}></div>
        </div>
      )}
      {totalPage > 1 && (
        <Pagination current={page} total={totalPage} jump={(p) => setPage(p)} />
      )}
    </div>
  );
}

export default Search;