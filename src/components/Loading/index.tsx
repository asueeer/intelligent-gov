import classnames from 'classnames/bind';
import { IconLoading } from "../icons";
import styles from './loading.module.scss';

const cx = classnames.bind(styles);

const Loading = () => {
  return (
    <div className={cx("loading")}>
      <div className={cx("loading__icon")}>
        <IconLoading color="#0168b7" width={60} height={60} />
      </div>
    </div>
  );
}
export default Loading;