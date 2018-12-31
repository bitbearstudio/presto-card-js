import getBalance from './balance';
import { getActivityByDateRange, getActivityByMonth } from './activity';
import { login, logout, isLoggedIn, loginWithCardNumber } from './auth';
import { getCards, setCurrentCard } from './cards';

const DEFAULT_PAGE_SIZE = '200';

export default axiosInstance => ({
  getActivityByDateRange: (from, to, pageSize = DEFAULT_PAGE_SIZE) =>
    getActivityByDateRange(axiosInstance, from, to, pageSize),
  getActivityByMonth: (year, month, pageSize = DEFAULT_PAGE_SIZE) =>
    getActivityByMonth(axiosInstance, year, month, pageSize),
  getBalance: () => getBalance(axiosInstance),
  login: (username, password) => login(axiosInstance, username, password),
  logout: () => logout(axiosInstance),
  isLoggedIn: () => isLoggedIn(axiosInstance),
  loginWithCardNumber: cardNumber =>
    loginWithCardNumber(axiosInstance, cardNumber),
  getCards: () => getCards(axiosInstance),
  setCurrentCard: cardNumber => setCurrentCard(axiosInstance, cardNumber),
});
