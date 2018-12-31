import cheerio from 'cheerio-without-node-native';
import qs from 'qs';

import API from './constants';
import { getBalanceFromCheerioObject } from './balance';
import { NoCardError, NotLoggedIn } from './index';

function extractCurrentCardNumber($) {
  return $('span#cardNumber')
    .first()
    .text();
}

function extractOtherCardNumbers($) {
  const numbers = $('[data-visibleid]')
    .map((_, link) =>
      $(link)
        .attr('data-visibleid')
        .toString(),
    )
    .get();
  return Array.from(new Set(numbers));
}

function hasNoCardMessage($) {
  const hasNoCardMessageDiv = !!$('html').has('.dashboard__no-card-message')
    .length;
  const hasSummary = !!$('html').has('.dashboard__card-summary').length;
  return hasNoCardMessageDiv && !hasSummary;
}

function hasCardSummaryClass($) {
  return !!$('html').has('.dashboard__card-summary').length;
}

async function getCards(axiosInstance) {
  const url = `${API.baseUrl}${API.dashboardPath}`;
  const dashboardResponse = await axiosInstance.get(url, {
    withCredentials: true,
  });

  const dashboardHtml = dashboardResponse.data;
  const $ = cheerio.load(dashboardHtml);

  if (hasNoCardMessage($)) {
    return [];
  }
  const otherCardNumbers = extractOtherCardNumbers($);
  return [extractCurrentCardNumber($), ...otherCardNumbers].reverse();
}

function getToken($) {
  return $('[data-visibleid]')
    .first()
    .closest('form')
    .find('input[name=__RequestVerificationToken]')
    .val()
    .toString();
}

async function setCurrentCard(axiosInstance, cardNumber) {
  const dashboardUrl = `${API.baseUrl}${API.dashboardPath}`;
  const dashboardResponse = await axiosInstance.get(dashboardUrl, {
    withCredentials: true,
  });
  const beforeSwitchCheerioResponse = cheerio.load(dashboardResponse.data);

  if (hasNoCardMessage(beforeSwitchCheerioResponse)) {
    throw new NoCardError();
  }

  if (!hasCardSummaryClass(beforeSwitchCheerioResponse)) {
    throw new NotLoggedIn();
  }

  if (extractCurrentCardNumber(beforeSwitchCheerioResponse) === cardNumber) {
    return {
      success: true,
      currentBalanceData: getBalanceFromCheerioObject(
        beforeSwitchCheerioResponse,
      ),
    };
  }

  const url = `${API.baseUrl}${API.setCurrentCardPath}`;
  const params = {
    setFareMediaSession: cardNumber,
    __RequestVerificationToken: getToken(beforeSwitchCheerioResponse),
  };
  const response = await axiosInstance.post(url, qs.stringify(params), {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const afterSwithCheerioResponse = cheerio.load(response.data);
  const currentCardNumber = extractCurrentCardNumber(afterSwithCheerioResponse);
  return {
    success: currentCardNumber === cardNumber,
    currentBalanceData: getBalanceFromCheerioObject(afterSwithCheerioResponse),
  };
}

export { getCards, setCurrentCard };
