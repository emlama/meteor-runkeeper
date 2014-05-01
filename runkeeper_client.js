Runkeeper = {};

// Request Runkeeper credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Runkeeper.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'runkeeper'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  var credentialToken = Random.id();

  var loginUrl =
        'https://runkeeper.com/apps/authorize' +
        '?client_id=' + config.clientId +
        '&response_type=code' +
        '&redirect_uri=' + Meteor.absoluteUrl('_oauth/runkeeper?close') +
        '&state=' + credentialToken;

  Oauth.showPopup(
    loginUrl,
    _.bind(credentialRequestCompleteCallback, null, credentialToken),
    {width: 900, height: 450}
  );
};