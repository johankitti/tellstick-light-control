/*global homeDashboard*/
/*global moment*/

(function() {
  'use strict';
  var restService = function($http) {
    this.http = $http;
  };

  //LIGHTING REST SERVICES
  restService.prototype.loadLightingInfo = function() {
    return this.http.get('/api/lighting/');
  };

  restService.prototype.updateLightingStatus = function(lamp) {
    this.http.post('/api/lighting/', {lamp: lamp}).
    error(function(data, status, headers, config) {
      console.log('Couldn\'t update lamp.');
    }).
    success(function(data, status, headers, config) {
      console.log('Lamp successfully updated.');
    });
  };

  homeDashboard.service('restService', restService);
}());
