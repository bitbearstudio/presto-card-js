export default {
  baseUrl: 'https://www.prestocard.ca',
  loginPath: '/api/sitecore/AFMSAuthentication/SignInWithAccount',
  loginWithCardNumberPath:
    '/api/sitecore/AFMSAuthentication/SignInWithFareMedia',
  logoutPath: '/api/sitecore/AFMSAuthentication/Logout',
  homepagePath: '/home',
  dashboardPath: '/en/dashboard',
  activityPath: '/api/sitecore/Paginator/CardActivityFilteredIndex',
  setCurrentCardPath:
    '/api/sitecore/Global/UpdateFareMediaSession?id=lowerFareMediaId&class=lowerFareMediaId',
};
