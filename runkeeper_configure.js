Template.configureLoginServiceDialogForRunkeeper.siteUrl = function () {
  return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForRunkeeper.fields = function () {
  return [
    {property: 'clientId', label: 'Client ID'},
    {property: 'secret', label: 'Client Secret'}
  ];
};