angular.module('starter.services', [])

.factory('CommonFactory', ['$state', '$ionicLoading', function($state, $ionicLoading) {
        return {
            handler: function(response) {
                $ionicLoading.hide();
                if (response.controller == 'Authenticate' && response.action == 'auth_code') {
                    $ionicLoading.show({
                        template: response.error,
                        noBackdrop: true,
                        duration: 1000
                    });
                    $state.go("login");
                } else {
                    var error = typeof response.error !== 'undefined' ? response.error : 'Server is not responding.';
                    $ionicLoading.show({
                        template: error,
                        noBackdrop: true,
                        duration: 2000
                    });
                }
            }
        };
    }])
    .factory('ServiceProvider', ['$q', '$http', 'CommonFactory', '$state', 'BASE_URL', '$ionicLoading', '$rootScope', '$localStorage',
        function($q, $http, CommonFactory, $state, BASE_URL, $ionicLoading, $rootScope, $localStorage) {
            $http.defaults.useXDomain = true;
            $rootScope.$storage = $localStorage;

            Object.toparams = function(obj) {
                var p = [];
                for (var key in obj) {
                    p.push(key + '=' + encodeURIComponent(obj[key]));
                }
                return p.join('&');
            };

            function getAuthCode(query) {
                var auth_code = $rootScope.$storage.auth_code;
                if (auth_code != null) {
                    if (query == true) {
                        return '?auth_code=' + auth_code;
                    } else {
                        return auth_code;
                    }
                } else {
                    console.log('Authorisation code not found!');
                    return '';
                }
            }
            return {

                reponseHandler: function(response) {
                    console.log(JSON.stringify(response, null, 1));
                    CommonFactory.handler(response);
                },

                login: function(myobject) {

                    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner>',noBackDrop: false,});
                    var deferred = $q.defer();
                    var req = {
                        method: 'POST',
                        url: BASE_URL + 'login/',
                        data: Object.toparams(myobject),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                    $http(req).
                    success(function(response) {
                        deferred.resolve(response);
                    }).
                    error(function(data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },

                register: function(myobject) {

                    $ionicLoading.show({template: '<ion-spinner icon="bubbles"></ion-spinner>',noBackDrop: false, });
                    var deferred = $q.defer();
                    var req = {
                        method: 'POST',
                        url: BASE_URL + 'register/',
                        data: Object.toparams(myobject),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                    $http(req).
                    success(function(response) {
                        deferred.resolve(response);
                    }).
                    error(function(data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                },
                
                editprofile: function(myobject) {

                    $ionicLoading.show({template: '<ion-spinner icon="bubbles"></ion-spinner>',noBackDrop: false,});
                    var deferred = $q.defer();
                    var req = {
                        method: 'POST',
                        url: BASE_URL + 'update_profile/',
                        data: Object.toparams(myobject),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                    $http(req).
                    success(function(response) {
                        deferred.resolve(response);
                    }).
                    error(function(data) {
                        deferred.reject(data);
                    });
                    return deferred.promise;
                }
            }
        }
    ]);