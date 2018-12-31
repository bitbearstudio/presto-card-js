export class NotLoggedIn extends Error {
  constructor() {
    super();
    this.constructor = NotLoggedIn;
    // eslint-disable-next-line no-proto
    this.__proto__ = NotLoggedIn.prototype;
  }
}

export class NoCardError extends Error {
  constructor() {
    super();
    this.constructor = NoCardError;
    // eslint-disable-next-line no-proto
    this.__proto__ = NoCardError.prototype;
  }
}
