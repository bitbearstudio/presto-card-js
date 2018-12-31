import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';

import constants from '../lib/constants';
import { getDefaultAPIWrapper } from '../lib/index';

const host = 'http://localhost';
axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const username = 'louis.charlemagne';
const correctPassword = 'goodpassowrd';
const incorrectPassword = 'badpassword';

const invalidPasswordMessage =
  'You could not be logged in to your online account. Please check your username and password and try again.';

const expectedToken = 'm08cGZUtyhWJJNgITyPJKGwL';
const homepageHtml = `
<html>
  <form action="/api/sitecore/AFMSAuthentication/SignInWithAccount" id="signwithaccount" method="post">
    <input name="__RequestVerificationToken" type="hidden" value="${expectedToken}" />
  </form>
</html>
`;

const lockedAccountUsername = 'noideawhatmypasswordis';
const lockedAccountMessage =
  'You have exceeded the number of available attempts to sign in. Please reset your password to access your account.';

describe('Login', () => {
  beforeEach(() => {
    nock(constants.baseUrl)
      .get(constants.homepagePath)
      .reply(200, homepageHtml);

    nock(constants.baseUrl)
      .post(constants.loginPath, {
        anonymousOrderACard: false,
        custSecurity: {
          Login: username,
          Password: incorrectPassword,
        },
      })
      .reply(200, invalidPasswordMessage);

    nock(constants.baseUrl)
      .post(constants.loginPath, {
        anonymousOrderACard: false,
        custSecurity: {
          Login: username,
          Password: correctPassword,
        },
      })
      .reply(200, { Result: 'success' });

    nock(constants.baseUrl)
      .post(constants.loginPath, {
        anonymousOrderACard: false,
        custSecurity: {
          Login: lockedAccountUsername,
          Password: correctPassword,
        },
      })
      .reply(200, lockedAccountMessage);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Login with correct password', async () => {
    await expect(
      getDefaultAPIWrapper().login(username, correctPassword),
    ).resolves.toEqual({
      success: true,
    });
  });

  it('Login with incorrect password', async () => {
    await expect(
      getDefaultAPIWrapper().login(username, incorrectPassword),
    ).resolves.toEqual({
      success: false,
      errorCode: 'INVALID_CREDENTIALS',
    });
  });

  it('Login with a locked account', async () => {
    await expect(
      getDefaultAPIWrapper().login(lockedAccountUsername, correctPassword),
    ).resolves.toEqual({
      success: false,
      errorCode: 'ACCOUNT_LOCKED',
    });
  });
});

describe('Is logged in?', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('Checks if user is logged in when not logged in', async () => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, '');

    await expect(
      getDefaultAPIWrapper().isLoggedIn(username, correctPassword),
    ).resolves.toBe(false);
  });

  it('Checks if user is logged in when logged in', async () => {
    const loggedInHtml = `
    <html>
      <body>
        <ul>
          <li>
            <a class="signInSignOut" href="/api/sitecore/AFMSAuthentication/Logout">
              Sign Out
            </a>
          </li>
        </ul>
      </body>
    </html>
    `;

    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, loggedInHtml);

    await expect(
      getDefaultAPIWrapper().isLoggedIn(username, correctPassword),
    ).resolves.toBe(true);
  });
});

describe('Login with card number', () => {
  const validCardNumber = '123';
  const invalidCardNumber = '7890';
  const invalidCardNumberResponse = {
    result: false,
    message: 'Incorrect PRESTO card number',
  };
  const alreadyLinkedCardNumber = '45678';
  const alreadyLinkedCardNumberResponse = {
    result: false,
    message: 'Your PRESTO card is already registered to an account.',
  };

  beforeEach(() => {
    nock(constants.baseUrl)
      .get(constants.homepagePath)
      .reply(200, homepageHtml);

    nock(constants.baseUrl)
      .post(constants.loginWithCardNumberPath, {
        anonymousOrderACard: true,
        fareMediaId: validCardNumber,
        registeredLoginError:
          'Your PRESTO card is already registered to an account.  Please log in using your username and password.',
      })
      .reply(200);

    nock(constants.baseUrl)
      .post(constants.loginWithCardNumberPath, {
        anonymousOrderACard: true,
        fareMediaId: invalidCardNumber,
        registeredLoginError:
          'Your PRESTO card is already registered to an account.  Please log in using your username and password.',
      })
      .reply(200, invalidCardNumberResponse);

    nock(constants.baseUrl)
      .post(constants.loginWithCardNumberPath, {
        anonymousOrderACard: true,
        fareMediaId: alreadyLinkedCardNumber,
        registeredLoginError:
          'Your PRESTO card is already registered to an account.  Please log in using your username and password.',
      })
      .reply(200, alreadyLinkedCardNumberResponse);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Logs in with a card number', async () => {
    await expect(
      getDefaultAPIWrapper().loginWithCardNumber(validCardNumber),
    ).resolves.toEqual({ success: true });
  });

  it('Logs in with an invalid card number', async () => {
    await expect(
      getDefaultAPIWrapper().loginWithCardNumber(invalidCardNumber),
    ).resolves.toEqual({ success: false, errorCode: 'INVALID_CARD_NUMBER' });
  });

  it('Logs in with an already linked card number', async () => {
    await expect(
      getDefaultAPIWrapper().loginWithCardNumber(alreadyLinkedCardNumber),
    ).resolves.toEqual({ success: false, errorCode: 'ALREADY_LINKED' });
  });
});
