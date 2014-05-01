Runkeeper = {};

Oauth.registerService('runkeeper', 2, null, function(query) {

  var accessToken = getAccessToken(query);
  var identity = getIdentity(accessToken);

  return {
    serviceData: {
      id: identity.userID,
      accessToken: OAuth.sealSecret(accessToken),
      name: identity.name,
      profile: identity.profile,
      medium_picture: identity.medium_picture,
      normal_picture: identity.normal_picture
    },
    options: {
      profile: {
        name: identity.name,
        medium_picture: identity.medium_picture,
        normal_picture: identity.normal_picture
      }
    }
  };
});

var userAgent = "Meteor";
if (Meteor.release)
  userAgent += "/" + Meteor.release;

var getAccessToken = function (query) {
  // See if we've been registered
  var config = ServiceConfiguration.configurations.findOne({service: 'runkeeper'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://runkeeper.com/apps/token", {
        headers: {
          Accept: 'application/json',
          "User-Agent": userAgent
        },
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          client_id: config.clientId,
          client_secret: config.secret,
          redirect_uri: Meteor.absoluteUrl("_oauth/runkeeper?close")
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Runkeeper. " + err.message),
                   {response: err.response});
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Runkeeper. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken) {
  var userResponse, profileResponse, response;
  try {
    userResponse = HTTP.get(
      "http://api.runkeeper.com/user", {
        params: {access_token: accessToken}
      }).content;
    userResponse = JSON.parse(userResponse);

    profileResponse = HTTP.get(
      "http://api.runkeeper.com" + userResponse.profile, {
        params: {access_token: accessToken}
      }).content;
    profileResponse = JSON.parse(profileResponse);

  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Runkeeper. " + err.message),
                   {response: err.response});
  }

  // Need both the user and profile responses for max info about a user
  response = _.extend(userResponse, profileResponse);

  return response;
};


Runkeeper.retrieveCredential = function(credentialToken) {
  return Oauth.retrieveCredential(credentialToken);
};