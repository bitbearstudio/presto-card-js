import axios from 'axios/index';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';

import constants from '../lib/constants';
import { getDefaultAPIWrapper } from '../lib/index';

const host = 'http://localhost';
axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

const formToken = 'AZBY1029';

const currentCardNumber = '1234';
const currentCardBalance = '$30';
const currentCardName = "Luis' card";
const currentCardLastUpdatedOn = 'December 9, 2017';

const firstOtherCardNumber = '8679';
const secondOtherCardNumber = '1029';

const multipleCardsHtml = `
<html>
  <form>
    <input name="__RequestVerificationToken" type="hidden" value="${formToken}" id="inputCTID2">
    <ul class="dropdown-menu cardBalenceDropdown" role="menu">
      <li class="cardBalenceDropdown03" role="menuitem">
            <a data-visibleid="${firstOtherCardNumber}" class="fareMediaID">
            </a>
        </li>
        <li class="cardBalenceDropdown03" role="menuitem">
            <a data-visibleid="${secondOtherCardNumber}" class="fareMediaID">
            </a>
        </li>
    </ul>
  </form>
  <div class="dashboard__card-summary">
    <h2>Balance on ${currentCardName}</h2>
    <span id="cardNumber">${currentCardNumber}</span>
    <p class="dashboard__quantity">${currentCardBalance}</p>
    <ul class="commontooltip">
      <li>
        <strong>Last Updated on:</strong>
        <span>${currentCardLastUpdatedOn}<span>
      </li>
    </ul>
  </div>
  <div class="dashboard__no-card-message">
    <p><strong>I use this class because I do what I want.</strong></p>
  </div>
  <form>
    <input name="__RequestVerificationToken" type="hidden" value="XXXXX" id="inputCTID2">
    <ul class="dropdown-menu cardBalenceDropdown" role="menu">
        <li class="cardBalenceDropdown03" role="menuitem">
            <a data-visibleid="${firstOtherCardNumber}" class="fareMediaID">
            </a>
        </li>
        <li class="cardBalenceDropdown03" role="menuitem">
            <a data-visibleid="${secondOtherCardNumber}" class="fareMediaID">
            </a>
        </li>
    </ul>
  </form>
</html>
`;

const singleCardHtml = `
<html>
  <ul class="dropdown-menu cardBalenceDropdown" role="menu">
  </ul>
  <div class="dashboard__card-summary">
    <h2>Balance on ${currentCardName}</h2>
    <span id="cardNumber">${currentCardNumber}</span>
    <p class="dashboard__quantity">${currentCardBalance}</p>
    <ul class="commontooltip">
      <li>
        <strong>Last Updated on:</strong>
        <span>${currentCardLastUpdatedOn}<span>
      </li>
    </ul>
  </div>
  <div class="dashboard__no-card-message">
    <p><strong>I use this class because I do what I want.</strong></p>
  </div>
  <ul class="dropdown-menu cardBalenceDropdown" role="menu">
</html>
`;

const noCardHtml = `
<html>
  <div class="dashboard__no-card-message">
    <p><strong>You do not have a PRESTO card associated with this account.</strong></p>
  </div>
</html>
`;

describe('Get cards', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('Gets multiple cards', async () => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, multipleCardsHtml);

    await expect(getDefaultAPIWrapper().getCards()).resolves.toEqual([
      secondOtherCardNumber,
      firstOtherCardNumber,
      currentCardNumber,
    ]);
  });

  it('Gets only the current card', async () => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, singleCardHtml);

    await expect(getDefaultAPIWrapper().getCards()).resolves.toEqual([
      currentCardNumber,
    ]);
  });

  it('Returns an empty set if account has no card', async () => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, noCardHtml);

    await expect(getDefaultAPIWrapper().getCards()).resolves.toEqual([]);
  });
});

describe('Set current card', () => {
  const getDashboardHtml = (number, name, balance, lastUpdatedOn) => `
    <html>
      <div class="dashboard__card-summary">
        <h2>Balance on ${name}</h2>
        <span id="cardNumber">${number}</span>
        <p class="dashboard__quantity">${balance}</p>
        <ul class="commontooltip">
          <li>
            <strong>Last Updated on:</strong>
            <span>${lastUpdatedOn}<span>
          </li>
        </ul>
      </div>
  </html>
  `;

  beforeEach(() => {
    nock(constants.baseUrl)
      .get(constants.dashboardPath)
      .reply(200, multipleCardsHtml);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Sets first card', async () => {
    const firstOtherCardBalance = '$50';
    const firstOtherCardName = 'Pipiscine Party';
    const firstOtherCardLastUpdatedOn = 'August 11, 2018';

    nock(constants.baseUrl)
      .post(
        constants.setCurrentCardPath,
        `setFareMediaSession=${firstOtherCardNumber}&__RequestVerificationToken=${formToken}`,
      )
      .reply(
        200,
        getDashboardHtml(
          firstOtherCardNumber,
          firstOtherCardName,
          firstOtherCardBalance,
          firstOtherCardLastUpdatedOn,
        ),
      );

    await expect(
      getDefaultAPIWrapper().setCurrentCard(firstOtherCardNumber),
    ).resolves.toEqual({
      success: true,
      currentBalanceData: {
        balance: firstOtherCardBalance,
        cardName: firstOtherCardName,
        cardNumber: firstOtherCardNumber,
        lastUpdatedOn: new Date(firstOtherCardLastUpdatedOn),
      },
    });
  });

  it('Sets invalid card number', async () => {
    const invalidCardNumber = '12345678900987654321';
    nock(constants.baseUrl)
      .post(
        constants.setCurrentCardPath,
        `setFareMediaSession=${invalidCardNumber}&__RequestVerificationToken=${formToken}`,
      )
      .reply(200, multipleCardsHtml);

    await expect(
      getDefaultAPIWrapper().setCurrentCard(invalidCardNumber),
    ).resolves.toEqual({
      success: false,
      currentBalanceData: {
        balance: currentCardBalance,
        cardName: currentCardName,
        cardNumber: currentCardNumber,
        lastUpdatedOn: new Date(currentCardLastUpdatedOn),
      },
    });
  });

  it('Sets the card already set', async () => {
    await expect(
      getDefaultAPIWrapper().setCurrentCard(currentCardNumber),
    ).resolves.toEqual({
      success: true,
      currentBalanceData: {
        balance: currentCardBalance,
        cardName: currentCardName,
        cardNumber: currentCardNumber,
        lastUpdatedOn: new Date(currentCardLastUpdatedOn),
      },
    });
  });
});
