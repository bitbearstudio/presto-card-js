import axios from 'axios/index';
import httpAdapter from 'axios/lib/adapters/http';
import moment from 'moment';
import nock from 'nock';

import constants from '../lib/constants';
import { getDefaultAPIWrapper } from '../lib/index';
import { getSelectedMonthValue } from '../lib/activity';

const activityHtml = `
<div id="paginator-content">
  <table class="table table-bordered card-activity--table">
    <thead>
      <tr>
        <th>Transaction</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <span>12/7/2017 12:23:47 PM</span>
          <span>ST PATRICK STATION</span>
          <span>$3.00</span>
        </td>
        <td>
          <span>$75.00</span>
        </td>
      </tr>
      <tr>
        <td>
          <span>12/18/2017 9:59:04 AM</span>
          <span>UNION STATION</span>
          <span>$3.00</span>
        </td>
        <td>
          <span>$78.00</span>
        </td>
      </tr>
    </tbody>
  </table>
  <table id="tblTHR" class="table table-bordered table-responsive card-activity--table hidden-xs hidden-sm">
    <thead>
      <tr>
        <th class="tblTHRDate" style=" cursor: pointer;">
          Date
          <a href="javascript:void(0);" class="arrowImg">
              <img class="inline" height="8" width="14" src="/~/media/AFMS/Images/Accordion/AccordianDownArrow.ashx" alt="Sort by date in descending order">
          </a>
        </th>
        <th>Transit Agency</th>
        <th>Location</th>
        <th>Type</th>
        <th>Service Class</th>
        <th>Discount</th>
        <th>Amount</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody class="tbodydesktop tbodyprint" id="content-print">
      <tr>
        <td>12/7/2017 12:23:47 PM</td>
        <td>Toronto Transit Commission</td>
        <td>ST PATRICK STATION</td>
        <td>
          Fare Payment
        </td>
        <td>Regular</td>
        <td>$0.00</td>
        <td class="amount">$3.00</td>
        <td>$75.00</td>
      </tr>
      <tr>
        <td>12/18/2017 9:59:04 AM</td>
        <td>Toronto Transit Commission</td>
        <td>UNION STATION</td>
        <td>
          Fare Payment
        </td>
        <td>Regular</td>
        <td>$0.00</td>
        <td class="amount">$3.00</td>
        <td>$78.00</td>
      </tr>
    </tbody>
  <table>
</div>`;
const expectedActivity = [
  {
    agency: 'Toronto Transit Commission',
    amount: '$3.00',
    balance: '$75.00',
    date: '12/7/2017 12:23:47 PM',
    location: 'ST PATRICK STATION',
    type: 'Fare Payment',
  },
  {
    agency: 'Toronto Transit Commission',
    amount: '$3.00',
    balance: '$78.00',
    date: '12/18/2017 9:59:04 AM',
    location: 'UNION STATION',
    type: 'Fare Payment',
  },
];

const host = 'http://localhost';
axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

describe('Get activity by month', () => {
  beforeEach(() => {
    const currentMonthParameter = '2';
    nock(constants.baseUrl)
      .post(
        constants.activityPath,
        body => body.selectedMonth === currentMonthParameter,
      )
      .reply(200, activityHtml);
  });

  it('Returns the right activity info', async () => {
    await expect(
      getDefaultAPIWrapper().getActivityByMonth(
        new Date().getFullYear(),
        new Date().getMonth(),
      ),
    ).resolves.toEqual(expectedActivity);
  });
});

describe('Get activity by date range', () => {
  beforeEach(() => {
    const selectedMonth = '02/15/2017 - 01/09/2018';
    nock(constants.baseUrl)
      .post(
        constants.activityPath,
        body => body.selectedMonth === selectedMonth,
      )
      .reply(200, activityHtml);
  });

  it('Returns the right activity info', async () => {
    await expect(
      getDefaultAPIWrapper().getActivityByDateRange('2017-02-15', '2018-01-09'),
    ).resolves.toEqual(expectedActivity);
  });
});

describe('getSelectedMonthValue', () => {
  it('Converts a past month value at the beggining of next month', () => {
    expect(getSelectedMonthValue(2017, 11, moment('2018-01-01'))).toEqual('3');
  });

  it('Converts a past month value at the end of next month', () => {
    expect(getSelectedMonthValue(2017, 11, moment('2018-01-30'))).toEqual('3');
  });

  it('Converts current month value', () => {
    expect(getSelectedMonthValue(2017, 11, moment('2017-12-31'))).toEqual('2');
  });
});
