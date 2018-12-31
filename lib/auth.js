import cheerio from 'cheerio-without-node-native';

import API from './constants';

function getRequestBody(username, password) {
  return {
    anonymousOrderACard: false,
    custSecurity: {
      Login: username,
      Password: password,
    },
  };
}

function getCardNumberRequestBody(cardNumber) {
  return {
    anonymousOrderACard: true,
    fareMediaId: cardNumber,
    registeredLoginError:
      'Your PRESTO card is already registered to an account.  Please log in using your username and password.',
  };
}

function isLoginSuccess(loginResponseBody) {
  return (
    Object.prototype.hasOwnProperty.call(loginResponseBody, 'Result') &&
    loginResponseBody.Result === 'success'
  );
}

function getErrorCode(errorMessage) {
  if (!errorMessage || !(typeof errorMessage === 'string')) {
    return null;
  }

  const errorCodes = {
    ACCOUNT_LOCKED: 'exceeded the number of available attempts',
    INVALID_CREDENTIALS: 'check your username and password',
    ALREADY_LINKED: 'already registered to an account',
    INVALID_CARD_NUMBER: 'Incorrect PRESTO card',
  };

  return Object.keys(errorCodes).find(code =>
    errorMessage.includes(errorCodes[code]),
  );
}

async function getToken(axiosInstance) {
  const homepageUrl = `${API.baseUrl}${API.homepagePath}`;
  const homepageResponse = await axiosInstance.get(homepageUrl, {
    withCredentials: true,
  });
  const $ = cheerio.load(homepageResponse.data);

  return $('#signwithaccount input[name="__RequestVerificationToken"]').attr(
    'value',
  );
}

async function isLoggedIn(axiosInstance) {
  const dashboardUrl = `${API.baseUrl}${API.dashboardPath}`;
  try {
    const resp = await axiosInstance.get(dashboardUrl, {
      maxRedirects: 0,
      withCredentials: true,
    });
    if (resp.status !== 200) {
      return false;
    }

    const $ = cheerio.load(resp.data);
    return $('body').find('.signInSignOut').length > 0;
  } catch (_) {
    return false;
  }
}

async function loginWithCardNumber(axiosInstance, cardNumber) {
  const token = await getToken(axiosInstance);
  const loginResponse = await axiosInstance.post(
    `${API.baseUrl}${API.loginWithCardNumberPath}`,
    getCardNumberRequestBody(cardNumber),
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        __RequestVerificationToken: token,
      },
    },
  );

  const success = !(loginResponse.data.result === false);
  if (success) {
    return { success: true };
  }

  const errorCode = getErrorCode(loginResponse.data.message);
  if (errorCode) {
    return {
      success: false,
      errorCode,
    };
  }
  return { success: false };
}

async function login(axiosInstance, username, password) {
  const token = await getToken(axiosInstance);
  const loginUrl = `${API.baseUrl}${API.loginPath}`;
  const loginResponse = await axiosInstance.post(
    loginUrl,
    getRequestBody(username, password),
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        __RequestVerificationToken: token,
      },
    },
  );

  if (isLoginSuccess(loginResponse.data)) {
    return { success: true };
  }

  const errorCode = getErrorCode(loginResponse.data);
  if (errorCode) {
    return {
      success: false,
      errorCode,
    };
  }

  return { success: false };
}

async function logout(axiosInstance) {
  const url = `${API.baseUrl}${API.logoutPath}`;
  await axiosInstance.get(url, {
    withCredentials: true,
  });
}

export { login, logout, isLoggedIn, loginWithCardNumber };
