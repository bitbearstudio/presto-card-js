# presto-card-js

> Get info about your presto card using NodeJS or React Native.

[![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://forthebadge.com) [![forthebadge](http://forthebadge.com/images/badges/built-with-grammas-recipe.svg)](http://forthebadge.com)

## Installation

`yarn add presto-card-js`

## Usage

#### Login and get balance

```es6
const { getDefaultAPIWrapper, NoCardError } = require('presto-card-js');

const prestoCard = getDefaultAPIWrapper();
const username = 'YOUR_PRESTO_ACCOUNT_USERNAME';
const password = 'YOUR_PRESTO_ACCOUNT_PASSWORD';

(async () => {
    const loginResponse = await prestoCard.login(username, password);
    if (!loginResponse.success) {
        console.log('Bad credentials?');
        return;
    }

    try {
      const balance = await prestoCard.getBalance();
      console.log(`Balance for card #${balance.cardNumber} is ${balance.balance}`);
    } catch (e) {
        if (e instanceof NoCardError) {
            console.log('Error: No card associated with this account.');
        }
    }
})();
```

## PRESTO API Wrapper API

#### login(username, password)

```js
await login('cedric', 'goodpassword')
// => { success: true }

await login('cedric', 'badpassword')
// => { success: false, errorCode: 'INVALID_CREDENTIALS' }

await login('cedric', 'badpassword')
// => { success: false, errorCode: 'INVALID_CREDENTIALS' }

await login('cedric', 'badpassword')
// => { success: false, errorCode: 'INVALID_CREDENTIALS' }

await login('cedric', 'badpassword')
// => { success: false, errorCode: 'ACCOUNT_LOCKED' }
```

Possible login error codes:

- `INVALID_CREDENTIALS`
- `ACCOUNT_LOCKED`

Note that it won't work if user is already logged-in. Use `isLoggedIn()` if unsure.

#### loginWithCardNumber(cardNumber)

```js
await loginWithCardNumber('1234-5677-8908-976')
// => { success: true }

await loginWithCardNumber('1234-5677-8908-000')
// => { success: false, errorCode: 'INVALID_CARD_NUMBER' }

await loginWithCardNumber('1234-5677-8908-977')
// => { success: false, errorCode: 'ALREADY_LINKED' }
```

Possible login error codes:

- `ALREADY_LINKED`
- `INVALID_CARD_NUMBER`

Note that it won't work if user is already logged-in. Use `isLoggedIn()` if unsure.

#### logout()

Needs `login(username, password)` first.

#### isLoggedIn()

Returns a boolean.

```js
await login('cedric', 'goodpassword')
// => { success: true }

await isLoggedIn()
// => true

await logout()

await isLoggedIn()
// => false

await loginWithCardNumber('1234-5677-8908-976')
// => { success: true }

await isLoggedIn()
// => true
```

#### getCards()

```js
await login('cedric', 'goodpassword')
// => { success: true }

await getCards()
// => ['1234-5677-8908-977', '1234-5677-8908-976']
```

Needs `login(username, password)` first.
Last card is the current one.

#### setCurrentCard(cardNumber)

```js
await getCards()
// => ['1234-5677-8908-977', '1234-5677-8908-976']

await setCurrentCard('1234-5677-8908-977')
// => { success: true, currentBalanceData: {
//  balance: "$14.02",
//  cardName: "Cedric's card",
//  cardNumber: "1234-5677-8908-977",
//  lastUpdatedOn: 2017-12-09T05:00:00.000Z
// }}

await getBalance()
// => {
//  balance: "$14.02",
//  cardName: "Cedric's card",
//  cardNumber: "1234-5677-8908-977",
//  lastUpdatedOn: 2017-12-09T05:00:00.000Z
//}

await setCurrentCard('1234-5677-8908-000')
// => { success: false, currentBalanceData: {
//  balance: "$14.02",
//  cardName: "Cedric's card",
//  cardNumber: "1234-5677-8908-977",
//  lastUpdatedOn: 2017-12-09T05:00:00.000Z
// }}
```

Needs `login(username, password)` first.

Returns a boolean and the balance of the dashboard to avoid an extra call to `getBalance`.

Note that if the switch did not succeed, the balance data would not match the card number requested. You must check the `success` field.

Raises `NoCardError` if no card associated with the account.
Raises `NotLoggedIn` if not logged-in.

#### getBalance()

Needs `login(username, password)` first.

```js
await getBalance()
// => {
//  balance: "$14.02",
//  cardName: "Cedric's card",
//  cardNumber: "1234-5677-8908-977",
//  lastUpdatedOn: 2017-12-09T05:00:00.000Z
//}
```

Raises `NoCardError` if no card associated with the account.
Raises `NotLoggedIn` if not logged-in.

#### getActivityByMonth(year, month, pageSize)

Needs `login(username, password)` first.

Returns activities for a given month. `month` parameter is zero-indexed, acceptable values are 0-11.

`pageSize` is an optional parameter with a default value of `'200'`

Example: Get activity for December 2017:

```js
await getActivityByMonth(2017, 11)
// => [
//   {
//     agency: 'Toronto Transit Commission',
//     amount: '$3.00',
//     balance: '$75.00',
//     date: '12/7/2017 12:23:47 PM',
//     location: 'ST PATRICK STATION',
//     type: 'Fare Payment',
//   },
//   {
//     agency: 'Toronto Transit Commission',
//     amount: '$3.00',
//     balance: '$78.00',
//     date: '12/18/2017 9:59:04 AM',
//     location: 'UNION STATION',
//     type: 'Fare Payment',
//   },
// ]
```

#### getActivityByDateRange(from, to, pageSize)

Needs `login(username, password)` first.

Returns activities over a given date range.
Expects ISO Date formatted strings for arguments `from` and `to`

`pageSize` is an optional parameter with a default value of `'200'`

Example: Get activity from Feb 15 2017 to Jan 9 2018

```js
await getActivityByDateRange('2017-02-15', '2018-01-09')
// => [
//   {
//     agency: 'Toronto Transit Commission',
//     amount: '$3.00',
//     balance: '$75.00',
//     date: '02/15/2017 12:23:47 PM',
//     location: 'ST PATRICK STATION',
//     type: 'Fare Payment',
//   },
//   {
//     agency: 'Toronto Transit Commission',
//     amount: '$3.00',
//     balance: '$78.00',
//     date: '02/18/2017 9:59:04 AM',
//     location: 'UNION STATION',
//     type: 'Fare Payment',
//   },
// ]
```

## Use a custom axios instance

You may want to build a wrapper using a custom `axios` instance if you want to use `though-cookie` in a NodeJS environment.

Example:

```js
const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const { getAPIWrapperWithAxiosInstance } = require('presto-card-js');

const axiosInstance = axiosCookieJarSupport(axios);
axiosInstance.defaults.jar = true;
const prestoCard = getAPIWrapperWithAxiosInstance(axiosInstance);

(async () => {
    const loginResponse = await prestoCard.login(username, password);
    [...]
})();
```

## How does it work?

Since PRESTO does not provide a public API, the library executes HTTP requests to login and it parses the dashboard HTML in order to get the card info.

## Projects using it

* [presto-card-cli](https://github.com/cedricblondeau/presto-card-cli) - 🚋  A CLI tool for checking your Presto card balance
* [Prestmo - PRESTO Card Checker](https://itunes.apple.com/ca/app/prestmo-presto-card-checker/id1350574622) - 📱  Unofficial PRESTO card iOS app

## Testing

#### Run tests

`yarn jest`

## License

GNU Affero General Public License v3.0
