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
  const [showPannel, setShowPannel] = useState<boolean>(false);
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
    if (input) {
      setPage(1);
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
      page_number: input ? 1 : page,
      type,
      category,
      ...params,
    }).then((res) => {
      const { list, total } = res?.data;
      if (list?.length) {
        setResult(list as Array<any>);
        setTotalPage(Math.ceil(total / 10));
        setLoading(false);
        document.scrollingElement?.scrollTo?.({ top: 0 })
      }
    });
    },[page, query, params, category, type]);

  const clickResult = (detail: any) => {
    const { title, category, department, serviceLink } = detail;
    log.send('click_result', {
      title,
      category,
      department,
      serviceLink,
    });
  }

  const searchWithSetting = () => {
    console.warn('form data');
  }

  useEffect(() => {
    checkSuggestion();
  }, [query]);

  useEffect(() => {
    document.title = '智能搜索';
  }, []);

  useEffect(() => {
    search(query);
  }, [category, type, params])
  useEffect(() => {
    search();
  }, [page])

  const pickParam = (name: string, value: string | number) => {
    setParams((p) => ({ ...p, [name]: value }));
  };

  const service = (link: string, e: any) => {
    e.stopPropagation();
    window.open(link);
  }

  return (
    <div className={cx('page')}>
      <div className={cx('more__setting', { show: showPannel })}>
        <div className={cx('setting')}>
          <div className={cx('setting__header')}>高级搜索设置</div>
          <div className={cx('setting__form')}>
            <div className={cx('setting__item')}>
              <div className={cx('setting__labal')}>包含检索词</div>
              <div className={cx('setting__value')}>
                <input className={cx('input_el')} />
              </div>
            </div>
            <div className={cx('setting__item')}>
              <div className={cx('setting__labal')}>包含至少一个检索词</div>
              <div className={cx('setting__value')}>
                <input className={cx('input_el')} />
              </div>
            </div>
            <div className={cx('setting__item')}>
              <div className={cx('setting__labal')}>不包含检索词</div>
              <div className={cx('setting__value')}>
                <input className={cx('input_el')} />
              </div>
            </div>
            <div className={cx('setting__item')}>
              <div className={cx('setting__labal')}>检索位置</div>
              <div className={cx('setting__value')}>
                <input type="radio" checked name="全部" value="ALL" /><span>全部</span>
                <input type="radio" name="标题" value="TITLE" /><span>标题</span>
                <input type="radio" name="正文" value="FULLTEXT" /><span>正文</span>
              </div>
            </div>
          </div>
          <div className={cx('button')} onClick={searchWithSetting}>确认</div>
        </div>
      </div>
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
            <div className={cx('search', 'search-common')}>
              <InputVoice getText={text => setQuery(text)} />
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
              <div className={cx('button')} onClick={() => setShowPannel(true)}>
                高级搜索
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
