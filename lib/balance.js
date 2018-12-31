import cheerio from 'cheerio-without-node-native';

import API from './constants';
import { NoCardError, NotLoggedIn } from './index';

function extractCardNumber($) {
  return $('span#cardNumber')
    .first()
    .text();
}

function extractCardName($) {
  return $('.dashboard__card-summary h2')
    .first()
    .text()
    .replace('Balance on ', '');
}

function extractLastUpdatedOn($) {
  return $(
    '.dashboard__card-summary ul.commontooltip strong:contains("Last Updated on:")',
  )
    .first()
    .parent()
    .find('span')
    .first()
    .text()
    .trim();
}

function extractBalance($) {
  return $('p.dashboard__quantity')
    .first()
    .text();
}

function hasCardSummaryClass($) {
  return !!$('html').has('.dashboard__card-summary').length;
}

function hasNoCardMessage($) {
  const hasNoCardMessageDiv = !!$('html').has('.dashboard__no-card-message')
    .length;
  const hasSummary = !!$('html').has('.dashboard__card-summary').length;
  return hasNoCardMessageDiv && !hasSummary;
}

export const getBalanceFromCheerioObject = $ => ({
  balance: extractBalance($),
  cardName: extractCardName($),
  cardNumber: extractCardNumber($),
  lastUpdatedOn: new Date(extractLastUpdatedOn($)),
});

export default async function getBalance(axiosInstance) {
  const url = `${API.baseUrl}${API.dashboardPath}`;
  const dashboardResponse = await axiosInstance.get(url, {
    withCredentials: true,
  });

  const dashboardHtml = dashboardResponse.data;
  const $ = cheerio.load(dashboardHtml);

  if (hasNoCardMessage($)) {
    throw new NoCardError();
  }

  if (!hasCardSummaryClass($)) {
    throw new NotLoggedIn();
  }

  return getBalanceFromCheerioObject($);
}
