import cheerio from 'cheerio-without-node-native';
import moment from 'moment';

import API from './constants';
import paginationModel from '../data/paginationModel.json';

const activityUrl = `${API.baseUrl}${API.activityPath}`;

function extractActivities($) {
  const activities = [];
  $('#paginator-content table#tblTHR')
    .find('tbody tr')
    .each((_, activity) => {
      const values = $(activity)
        .find('td')
        .map((__, value) =>
          $(value)
            .text()
            .trim(),
        )
        .get();

      activities.push({
        agency: values[1],
        amount: values[6],
        balance: values[7],
        date: values[0],
        location: values[2],
        type: values[3],
      });
    });
  return activities;
}

function getSelectedMonthValue(year, month, currentMonthDate = moment()) {
  const requestedMonthDate = moment([year, month]);
  const monthDiff = currentMonthDate.diff(requestedMonthDate, 'months');
  const monthDiffPlusPrestoWeirdValue = monthDiff + 2;
  return monthDiffPlusPrestoWeirdValue.toString();
}

function getActivityRequestBody(pageSize, selectedMonth) {
  return {
    TransactionType: '0',
    Agency: '-1',
    PageSize: `${pageSize}`,
    currentModel: paginationModel,
    selectedMonth,
  };
}

async function getActivityByMonth(axiosInstance, year, month, pageSize) {
  const selectedMonth = getSelectedMonthValue(year, month);
  const activityResponse = await axiosInstance.post(
    activityUrl,
    getActivityRequestBody(pageSize, selectedMonth),
    { withCredentials: true },
  );
  const $ = cheerio.load(activityResponse.data);
  return extractActivities($);
}

async function getActivityByDateRange(
  axiosInstance,
  from,
  to = moment(),
  pageSize,
) {
  const fromFormatted = moment(from).format('MM/DD/YYYY');
  const toFormatted = moment(to).format('MM/DD/YYYY');
  const dateRange = `${fromFormatted} - ${toFormatted}`;
  const activityResponse = await axiosInstance.post(
    activityUrl,
    getActivityRequestBody(pageSize, dateRange),
    { withCredentials: true },
  );
  const $ = cheerio.load(activityResponse.data);
  return extractActivities($);
}

export { getActivityByMonth, getActivityByDateRange, getSelectedMonthValue };
