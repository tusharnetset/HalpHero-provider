
angular.module('starter', ['ionic','starter.controllers','starter.services','ngCordova','ngStorage','ngCordovaOauth','googleplus','yaru22.angular-timeago'])
.run(function($state,$window,$ionicPlatform,$rootScope,$http,localStorageService,BASE_URL,$state,$ionicPopup,$interval) {

  $ionicPlatform.ready(function() {
    inAppPurchase
    //.getProducts(['com.halphero.provider.purchase'])
    .getProducts(['com.halphero.provider.purchasetesting'])
    .then(function (products) {
      console.log(products);
    })
    .catch(function (err) {
      console.log(err);
    });

    if($window.plugins && $window.plugins.googleplus) {
      $window.plugins.googleplus.isAvailable(
      function (available) {
        if (available) {
        }
      });
    }
    
    FCMPlugin.getToken(
      function(token){
        console.log(token);
        if (token == null) {
          console.log("null token");
          setTimeout(token, 2000);
        }else{
          localStorageService.set('device_token',token);
          var currentPlatform = ionic.Platform.platform();
          console.log("update token on serverrrrrr");
          var u_token = localStorageService.get('customer_data');
          $http({
            method: 'POST',
            data: 'user_token=' + u_token.user_token + '&user_id=' + u_token.id + '&device_id=' + token + '&device_type=' + currentPlatform,
            url: BASE_URL+'update_profile/',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).success(function(response){
            console.log(response);
            if(response.status == false){
              console.log("false");
            }else{
              localStorageService.set('customer_data', response.data);
            }
          }).error(function(error){
          });
        }
      },
      function(err){
        console.log('error retrieving token:' + err);
      }
    )

    FCMPlugin.onNotification(function(data){
      var u_token = localStorageService.get('customer_data');
      console.log(u_token);
      console.log(JSON.stringify(data));
      if(u_token.notification == 'y'){
        if(data.noti_type == "create_job"){
          var confirmPopup = $ionicPopup.confirm({
            title: data.label,
            cache:false,
            cssClass:'logout_popup',
            template: data.msg
          });
          confirmPopup.then(function(res) {
            if(res) {
              console.log('You are sure');
              $state.go('tab.home');
            }else {
              console.log('You are not sure');
            }
          })
        }else{
          console.log("err");
        }
      }else{
        console.log("off");
      }

      if(u_token.notification == 'y'){
        if(data.noti_type == "hire_service_provider"){
          var confirmPopup = $ionicPopup.confirm({
            title: data.label,
            cache:false,
            cssClass:'logout_popup',
            template: data.msg
          });
          confirmPopup.then(function(res) {
            if(res){
              console.log('You are sure');
              $state.go('tab.myjobs');
            }else{
              console.log('You are not sure');
            }
          })
        }else{
          console.log("err");
        }
      }
      else{
        console.log("off");
      }

      if(u_token.notification == 'y'){
        if(data.noti_type == "chat"){
          if($state.current.name != "conversations"){
            var confirmPopup = $ionicPopup.confirm({
              title: data.label,
              cache:false,
              cssClass:'logout_popup',
              template: data.msg
            });
            confirmPopup.then(function(res) {
              if(res) {
                console.log('You are sure');
                 $rootScope.ch_id_cus = data.reciver_id;
                console.log($rootScope.ch_id_cus);
                $state.go('conversations');
              }else{
                console.log('You are not sure');
              }
            })
            $rootScope.chatConver();
          }else{
            $rootScope.chatConver();
          }
        }else{
          console.log("err");
        }
      }else{
        $rootScope.chatConver();
      }

    })


    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        // swal("Sorry, no Internet connectivity detected. Please reconnect and try again.!")
        // swal("Sorry!", "no Internet connectivity detected. Please reconnect and try again.!")
        $ionicPopup.confirm({
          title: 'No Internet Connection',
          cssClass:'logout_popup',
          content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
        })
        .then(function(result) {
          console.log(result);
          if(!result) {
            // startWatching: function(){
            //   if(ionic.Platform.isWebView()){
            //     $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            //       console.log("went online");
            //     });

            //     $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            //       console.log("went offline");
            //     });
            //   } else {
            //     window.addEventListener("online", function(e) {
            //       console.log("went online");
            //     }, false);    
            //     window.addEventListener("offline", function(e) {
            //       console.log("went offline");
            //     }, false);  
            //   }       
            // }
            ionic.Platform.exitApp();
          }
        });
      }
    }

  })
})



.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');

$stateProvider
  
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/Service_provider/tabs.html'
  })

  .state('tab.account', {
    cache:false,
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/Service_provider/tab-account.html',
        controller: 'settingCtrl'
      }
    }
  })

  .state('login', {
    cache:false,
    url: '/login',
    templateUrl: 'templates/Service_provider/login.html',
    controller: 'LoginCtrl'
  })

  .state('signup', {
    cache:false,
    url: '/signup',
    templateUrl: 'templates/Service_provider/signup.html',
    controller: 'SignupCtrl'
  })

  .state('add_account', {
    cache:false,
    url: '/add_account',
    templateUrl: 'templates/Service_provider/add_account.html',
    controller: 'accountCtrl'
  })

  .state('createprofile', {
    cache:false,
      url: '/createprofile',
      templateUrl: 'templates/Service_provider/createprofile.html',
      controller: 'CreateProfileCtrl'
  })
  .state('tab.home', {
    cache:false,
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/Service_provider/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('tab.myjobs', {
    cache: false,
    url: '/myjobs',
    views: {
      'tab-myjobs': {
        templateUrl: 'templates/Service_provider/myjobs.html',
        controller: 'MyjobsCtrl'
      }
    }
  })

  .state('tab.notifications', {
    cache: false,
    url: '/notifications',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/Service_provider/notifications.html',
        controller: 'notificationsCtrl'
      }
    }
  })

  .state('tab.completed_jobs', {
    cache:false,
    url: '/completed_jobs',
    views: {
      'tab-completed_jobs': {
        templateUrl: 'templates/Service_provider/completed_jobs.html',
        controller: 'CompletedjobsCtrl'
      }
    }
  })
  .state('job_detail', {
    cache:false,
    url: '/job_detail',
    templateUrl: 'templates/Service_provider/job_detail.html',
    controller: 'JobDetailCtrl'
  })

  .state('job_detail_applied', {
    cache:false,
    url: '/job_detail_applied',
    templateUrl: 'templates/Service_provider/job_detail_applied.html',
    controller: 'JobDetailApplied'
  })

  .state('job_detail_completed', {
    cache:false,
    url: '/job_detail_completed',
    templateUrl: 'templates/Service_provider/job_detail_completed.html',
    controller: 'JobDetailCompletedCtrl'
  })

  .state('profile', {
    cache: false,
    url: '/profile',
    templateUrl: 'templates/Service_provider/profile.html',
    controller: 'profileCtrl'
  })

  .state('change_password', {
    cache: false,
    url: '/change_password',
    templateUrl: 'templates/Service_provider/change_password.html',
    controller: 'changePassCtrl'
  })
  .state('edit_profile', {
    cache: false,
    url: '/edit_profile',
    templateUrl: 'templates/Service_provider/edit_profile.html',
    controller: 'editprofileCtrl'
  })

  .state('conversations', {
    cache: false,
    url: '/conversations',
    templateUrl: 'templates/Service_provider/conversations.html',
    controller: 'conversationsCtrl'
  })

  .state('message', {
    cache:false,
    url: '/message',
    templateUrl: 'templates/Service_provider/message.html',
    controller: 'MessageCtrl'
  })

   .state('receipt', {
    cache:false,
    url: '/receipt',
    templateUrl: 'templates/Service_provider/receipt.html',
    controller: 'receiptCtrl'
  })
  
  .state('rating', {
    url: '/rating',
    templateUrl: 'templates/Service_provider/rating.html',
    controller: 'RatingCtrl'
  })  

  .state('forgot_password', {
    cache:false,
    url: '/forgot_password',
    templateUrl: 'templates/Service_provider/forgot_password.html',
    controller: 'forgotPassCtrl'
  })

  .state('purchase', {
    cache:false,
    url: '/purchase',
    templateUrl: 'templates/Service_provider/purchase.html',
    controller: 'purchaseCtrl'
  });

  $urlRouterProvider.otherwise('/login');

})

.constant('BASE_URL', 'http://142.4.10.93/~vooap/service_provider/webservice/')
.constant('IMG_URL', 'http://142.4.10.93/~vooap/service_provider/public/uploads/user/')
// .constant('BASE_URL', 'http://halphero.com/halphero/webservice/')
// .constant('IMG_URL', 'http://halphero.com/halphero/public/uploads/user/')
 

.factory('ConnectivityMonitor', function($rootScope,$cordovaNetwork){
  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();    
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();    
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
      if(ionic.Platform.isWebView()){
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
          console.log("went online");
        });

        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
          console.log("went offline");
        });
      } else {
        window.addEventListener("online", function(e) {
          console.log("went online");
        }, false);    
        window.addEventListener("offline", function(e) {
          console.log("went offline");
        }, false);  
      }       
    }
  }
})

// .directive('input', function($timeout) {
//   return {
//     restrict: 'E',
//     scope: {
//       'returnClose': '=',
//       'onReturn': '&',
//       'onFocus': '&',
//       'onBlur': '&'
//     },
//     link: function(scope, element, attr) {
//       element.bind('focus', function(e) {
//         if (scope.onFocus) {
//           $timeout(function() {
//             scope.onFocus();
//           });
//         }
//       });
//       element.bind('blur', function(e) {
//         if (scope.onBlur) {
//           $timeout(function() {
//             scope.onBlur();
//           });
//         }
//       });
//       element.bind('keydown', function(e) {
//         if (e.which == 13) {
//           if (scope.returnClose) element[0].blur();
//           if (scope.onReturn) {
//             $timeout(function() {
//               scope.onReturn();
//             });
//           }
//         }
//       });
//     }
//   }
// })

.directive('sameValueAs', function () {
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$validators.sameValueAs = function (modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue) || attrs.sameValueAs === viewValue) {
          return true;
        }
        return false;
      };
    }
  };
})


.service('UserService', function() {
  var setUser = function(user_data) {
    window.localStorage.starter_google_user = JSON.stringify(user_data);
  };
  var getUser = function(){
    return JSON.parse(window.localStorage.starter_google_user || '{}');
  };
  return {
    getUser: getUser,
    setUser: setUser
  };
})

.directive('limitChar', function() {
  'use strict';
  return {
    restrict: 'A',
    scope: {
      limit: '=limit',
      ngModel: '=ngModel'
    },
    link: function(scope) {
      scope.$watch('ngModel', function(newValue, oldValue) {
        if (newValue) {
          var length = newValue.toString().length;
          if (length > scope.limit) {
              scope.ngModel = oldValue;
          }
        }
      });
    }
  };
})

.directive('starRating',function() {
  return {
    restrict : 'A',
    template : '<ul class="rating">'+ ' <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'+ '  <i class="fa fa-star-o"></i>'+ ' </li>'+ '</ul>',
    scope : {
      ratingValue : '=',
      max : '=',
      onRatingSelected : '&'
    },
    link : function(scope, elem, attrs) {
      var updateStars = function() {
        scope.stars = [];
        for ( var i = 0; i < scope.max; i++) {
          scope.stars.push({
            filled : i < scope.ratingValue
          });
        }
      };
      scope.toggle = function(index) {
        scope.ratingValue = index + 1;
        scope.onRatingSelected({
          rating : index + 1
        });
      };
      scope.$watch('ratingValue',
      function(oldVal, newVal) {
        if (newVal) {
          updateStars();
        }
      });
    }
  };
})

.directive('googleplace', [ function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, model) {
      var options = {
        types: [],
        componentRestrictions: {  country:'IN' }
      };
      scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
      google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
        var geoComponents = scope.gPlace.getPlace();
        var latitude = geoComponents.geometry.location.lat();
        var longitude = geoComponents.geometry.location.lng();
        var addressComponents = geoComponents.address_components;
        //scope.myLat = latitude;
        callFunctionHello(latitude,longitude);
        addressComponents = addressComponents.filter(function(component){
          switch (component.types[0]) {
            case "locality": // city
            return true;
            case "administrative_area_level_1": // state
            return true;
            case "country": // country
            return true;
            default:
            return false;
          }
        }).map(function(obj) {
          return obj.long_name;
        });
        addressComponents.push(latitude, longitude);
        scope.$apply(function() {
          scope.details = addressComponents; // array containing each location component
          model.$setViewValue(element.val());  
        });
      });
    }
  };
}])


.directive('moDateInput', function ($window) {
  return {
    require:'^ngModel',
    restrict:'A',
    link:function (scope, elm, attrs, ctrl) {
      var moment = $window.moment;
      var dateFormat = attrs.moDateInput;
      attrs.$observe('moDateInput', function (newValue) {
        if (dateFormat == newValue || !ctrl.$modelValue) return;
        dateFormat = newValue;
        ctrl.$modelValue = new Date(ctrl.$setViewValue);
      });
      ctrl.$formatters.unshift(function (modelValue) {
        if (!dateFormat || !modelValue) return "";
        var retVal = moment(modelValue).format(dateFormat);
        return retVal;
      });
      ctrl.$parsers.unshift(function (viewValue) {
        var date = moment(viewValue, dateFormat);
        return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
      });
    }
  };
})

.directive('noCacheSrc', function($window) {
  return {
    priority: 99,
    link: function(scope, element, attrs) {
      attrs.$observe('noCacheSrc', function(noCacheSrc) {
        noCacheSrc += '?' + (new Date()).getTime();
        attrs.$set('src', noCacheSrc);
      });
    }
  }
})

.directive('repeatDone', function () {
 return function (scope,element,attrs) {
    if (scope.$last) {
     scope.$eval(attrs.repeatDone);
    }
  }
})

.directive('myRepeatDirective', function() {
  return function(scope,element,attrs) {
    angular.element(element).css('color','blue');
    if (scope.$last){
    }
  };
})


function callFunctionHello(latitude, longitude){
  angular.element(document.getElementById('idLatitude')).scope().setLatLong(latitude,longitude); 
}

//Find out near by service providers for Child Care and Pet Care services.

// HalpHero makes you capable to find out experienced Child Care and Pet Care service providers around your area.
// HalpHero service providers are verified and highly experienced and motivated towards providing good customer experience.
// Its really quick to get help on your door steps. Just add your job requirement in our application and we will send it to lot of service providers who can apply to your requirements and then you can hire the one according to your preferences.