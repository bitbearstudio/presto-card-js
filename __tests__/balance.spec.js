import axios from 'axios/index';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';

import constants from '../lib/constants';
import { getDefaultAPIWrapper, NoCardError, NotLoggedIn } from '../lib/index';

const expectedBalance = '$30';
const expectedCardNumber = '1234';
const expectedCardName = "Luis' card";
const expectedLastUpdatedOn = 'December 9, 2017';
const correctHtml = `
<html>
  <div class="dashboard__card-summary">
    <h2>Balance on ${expectedCardName}</h2>
    <span id="cardNumber">${expectedCardNumber}</span>
    <p class="dashboard__quantity">${expectedBalance}</p>
    <ul class="commontooltip">
      <li>
        <strong>Last Updated on:</strong>
        <span>${expectedLastUpdatedOn}<span>
      </li>
    </ul>
  </div>
  <div class="dashboard__no-card-message">
    <p><strong>I use this class because I do what I want.</strong></p>
  </div>
</html>
`;
const noCardHtml = `
<html>
  <div class="dashboard__no-card-message">
    <p><strong>You do not have a PRESTO card associated with this account.</strong></p>
  </div>
</html>
`;
const errorHtml = `<html></html>`;

const host = 'http://localhost';
axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

describe('Get balance when logged-in with an account with one card', () => {
  beforeEach(() => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, correctHtml);
  });

  it('Returns the right balance info', async () => {
    const balance = await getDefaultAPIWrapper().getBalance();
    expect(balance.cardNumber).toEqual(expectedCardNumber);
    expect(balance.cardName).toEqual(expectedCardName);
    expect(balance.lastUpdatedOn.getTime()).toEqual(
      new Date(expectedLastUpdatedOn).getTime(),
    );
    expect(balance.balance).toEqual(expectedBalance);
  });
});

describe('Get balance when logged-in with an account without a card', () => {
  beforeEach(() => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, noCardHtml);
  });

  it('Raises a NoCardError', async () => {
    await expect(getDefaultAPIWrapper().getBalance()).rejects.toThrowError(
      NoCardError,
    );
  });
});

describe('Get balance when not logged-in', () => {
  beforeEach(() => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, errorHtml);
  });

  it('Raises a NotLoggedIn', async () => {
    await expect(getDefaultAPIWrapper().getBalance()).rejects.toThrowError(
      NotLoggedIn,
    );
  });
});
