import axios from 'axios';
import 'babel-polyfill';

import withAxiosInstance from './withAxiosInstance';
import { NoCardError, NotLoggedIn } from './errors';

const getDefaultAPIWrapper = () => withAxiosInstance(axios.create());
export {
  getDefaultAPIWrapper,
  withAxiosInstance as getAPIWrapperWithAxiosInstance,
  NoCardError,
  NotLoggedIn,
};
