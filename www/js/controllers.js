angular.module('starter.controllers', ['LocalStorageModule'])

.controller('LoginCtrl', function($cordovaToast,$ionicPlatform,$cordovaOauth,$cordovaInstagram,$scope, $state, $ionicPopup, $ionicLoading, $http, BASE_URL, localStorageService, ServiceProvider) {
  $ionicPlatform.registerBackButtonAction(function(event) {
    if($state.current.name == "login") {
      $ionicPopup.confirm({
        title: 'EXIT',
        template: 'Are you sure you want to Exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      }) 
    }
  },100);

/////////////////////Session////////////////////////
  $check = localStorageService.get('customer_data');
  console.log($check);
  if(!$check) {
    $state.go('login');
  }else if(!$check.DOB || $check.DOB =='0000-00-00'){
    $state.go("createprofile");
  }else if($check.bank_status == false) {
    $state.go('add_account');
  }else if($check.purchase == 'n'){
    $state.go("purchase");
  }else{
    $state.go("tab.home");
  }
//////////////////////////////////////////////////////

  $scope.loginUser = function($dataa, $valid) {
    var device_token = localStorageService.get('device_token');
    console.log(device_token);
    $scope.currentPlatform = ionic.Platform.platform();
    $scope.submitted = true;
    if($valid) {
      $scope.errorUserName = '';
      $scope.errorPassword = '';
      $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
      $userdataa = localStorageService.get('customer_data');
      $dataa.device_type = ionic.Platform.device().platform;
      var Url = BASE_URL + 'login/';
      $http({
        method: 'POST',
        data: 'email=' + $dataa.email + '&password=' + $dataa.password + '&device_id=' + device_token + '&device_type=' + $scope.currentPlatform + '&user_type=' + 'sp',
        url: Url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(data) {
        console.log(data);
        $ionicLoading.hide();
        if(data.status == true) {
          localStorageService.set('customer_data', data.data);
          if(data.data.DOB =='0000-00-00'){
            $state.go("createprofile");
          }else if(data.data.bank_status == false){
            $state.go("add_account");
          } else if(data.data.purchase == 'n') {
            $state.go("purchase");
          }else{
            $ionicLoading.hide();
            localStorageService.set('customer_data', data.data);
            $state.go('tab.home');
          }
        } else {
          $ionicLoading.hide();
          $cordovaToast.showLongBottom(data.message).then(function(success) {
          }, function(error) {
          })
          if(data.type == 'email')
            $scope.errorUserName = data.message;
          else if(data.type == 'password')
            $scope.errorPassword = data.message;
          else $scope.errorMessages = data.message;
        }
      })
      .error(function(data) {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(data.message).then(function(success) {
          }, function(error) {
        });
      });
    } else {
      console.log("Required fields");
      $cordovaToast.showLongBottom("Please fill required fields").then(function(success) {
        console.log(success);
      }, function(error) {
        console.log(error);
      });
    }
  }

  $scope.signup = function() {
    $state.go('signup');
  }

  $scope.login = function() {
    $state.go('tab.home');
  }

  $scope.facebookLogin = function(){ 
    var fb_app_id = '255319991593527';
    $cordovaOauth.facebook(fb_app_id, ["email", "public_profile"],{redirect_uri: "https://igotevent-82f2d.firebaseapp.com/__/auth/handler"}).then(function(result) {
      console.log(result);
      $scope.accessToken = result.access_token;
      var re_id = result;
      console.log(re_id);
        $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: result.access_token, fields: "id,name,gender,first_name,last_name,email,location,picture", format: "json" } 
        }).then(function(result) {
        console.log(result);
        $scope.uData = result.data;
        $scope.u_id = result.data.id;
        console.log($scope.u_id);
      
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
        var device_token = localStorageService.get('device_token');
        var device_type = ionic.Platform.device().platform;
        var Url = BASE_URL + 'register/';
        $http({
          method: 'POST',
          data: 'other_reg_type_login_id=' + $scope.u_id + '&registration_type=' + 'F' + '&device_id=' + device_token + '&device_type=' + device_type + '&user_type=' + 'sp' + '&first_name=' + $scope.uData.first_name + '&last_name=' + $scope.uData.last_name + '&email=' + $scope.uData.email,
          url: Url,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data) {
          console.log(data);
          if(data.status == true) {
             $ionicLoading.hide();
            localStorageService.set('customer_data', data.data);
          if(data.data.DOB =='0000-00-00'){
            $state.go("createprofile");
          }else if(data.data.bank_status == false){
            $ionicLoading.hide();
            $state.go("add_account");
          }else if(data.data.purchase == "n"){
            $state.go("purchase");
          }else{
            $ionicLoading.hide();
            localStorageService.set('customer_data', data.data);
            $state.go('tab.home');
          }
          }else {
            $ionicLoading.hide();
            //$state.go("createprofile");
          }
        })
        .error(function(data) {
          $ionicLoading.hide();
          $cordovaToast.showLongBottom(data.message).then(function(success) {
            console.log(success);
          }, function(error) {
            console.log(error);
          });
        });
      })
    })
  }


 $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  $scope.googleLogin = function() {

    if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
      };
    }
    var clientId = "435140076880-livfr98i03vcu0khll90olj3b2qto9rg.apps.googleusercontent.com";
    var clientSecret =  'HhUCQyowk6vb86uBZ-UF69Vl';
    var ref = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/userinfo.email&https://www.googleapis.com/auth/userinfo.profile&https://www.googleapis.com/auth/urlshortener&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no');
    ref.addEventListener('loadstart', function(event) { 
      if((event.url).startsWith("http://localhost/callback")) {
        requestToken = (event.url).split("code=")[1];
        console.log(requestToken);
        $http({method: "post", url: "https://accounts.google.com/o/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
          .success(function(data) {
            console.log(data);
            $scope.accessToken = data.access_token;
            console.log($scope.accessToken);
            $http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + $scope.accessToken, {params: {format: 'json' }
          }).then(function(result) {
            console.log(result);
            $scope.g_Id = result.data.id;
            $scope.guserData = result.data;
            $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
            var device_token = localStorageService.get('device_token');
            var device_type = ionic.Platform.device().platform;
            var Url = BASE_URL + 'register/';
            $http({
              method: 'POST',
              data: 'other_reg_type_login_id=' + $scope.g_Id + '&registration_type=' + 'G' + '&device_id=' + device_token + '&device_type=' + device_type + '&user_type=' + 'sp' + '&first_name=' + $scope.guserData.name + '&last_name=' + '' + '&email=' + $scope.guserData.email, 
              url: Url,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function(data) {
              console.log(data);
              if(data.status == true) {
                $ionicLoading.hide();
                localStorageService.set('customer_data', data.data);
                if(data.data.DOB =='0000-00-00'){
                  $state.go("createprofile");
                }else if(data.data.bank_status == false){
                  $ionicLoading.hide();
                  $state.go("add_account");
                }else if(data.data.purchase == "n"){
                  $state.go("purchase");
                }else{
                  $ionicLoading.hide();
                  localStorageService.set('customer_data', data.data);
                  $state.go('tab.home');
                }
              } else {
                $ionicLoading.hide();
                $cordovaToast.showLongBottom(data.message).then(function(success) {
                },function(error) {
              });
              }
            })
            .error(function(data) {
              $ionicLoading.hide();
              $cordovaToast.showLongBottom(data.message).then(function(success) {
              }, function(error) {
              });
            });
          })
           .error(function(data, status) {
              alert("ERROR: " + JSON.stringify(data));
              console.log("ERROR: " + JSON.stringify(data));
          })          
          })
        ref.close();
      }
    });
  }

  $scope.forgotpass = function(){
    $state.go("forgot_password");
  }

})

.controller('forgotPassCtrl', function($ionicPlatform,$ionicHistory,$cordovaToast,$scope, $state, $cordovaToast, $ionicPopup, $ionicLoading, $http, BASE_URL, localStorageService) {

  $ionicPlatform.registerBackButtonAction(function(event) {
   $ionicHistory.goBack();
  },100);

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  }

  $scope.forgotPassword = function(data,valid){
    $scope.submitted = true;
    if(valid){
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'email=' + data.email,
      url: BASE_URL+'forgot_password',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      $ionicLoading.hide();
      if(response.status == false){
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        }, function(error) {
        });
      }else{
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        }, function(error) {
        });
        $ionicLoading.hide();
        $state.go('login');
      }
    }).error(function(error){
      $ionicLoading.hide();
    });
  }else{
    $cordovaToast.showLongBottom("Please fill required fields").then(function(success) {
    }, function(error) {
    });
  }
  }


})

.controller('SignupCtrl', function($ionicPlatform,$ionicHistory,$cordovaToast,$scope, $state, $cordovaToast, $ionicPopup, $ionicLoading, $http, BASE_URL, localStorageService) {
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  }

  // $scope.login = function() {
  //   $state.go('login');
  // } 

  $scope.loginGo = function(){
    $state.go('login');
  }

  

  $scope.create_profile = function($dataa, $valid) {
    var device_token = localStorageService.get('device_token');
    console.log($dataa);
    $scope.submitted = true;
    if($valid){
      $dataa.user_type = 'sp';
      $dataa.device_type = ionic.Platform.device().platform;
      $dataa.device_id = device_token;
      $dataa.registration_type = "O";
      $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
      var Url = BASE_URL + 'register/';
      var config = {
        headers: { 'Content-Type': 'application/json;' }
    };
    $http({
      method: 'POST',
      url: Url,
      data: $dataa,
      transformRequest: function(obj) {
        var str = [];
        for (var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      console.log(data);
      if(data.status == true) {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom("Registered Succesfully").then(function(success) {
        }, function(error) {
        });
        localStorageService.set('customer_data', data.data);
        $state.go('createprofile');
      } else {
        $ionicLoading.hide();
        if (data.type == 'email')
          $scope.errorEmail = data.message;
        else
          $scope.errorMessages = data.message;
        console.log("error");
      }
    }).error(function(data) {
        $ionicPopup.alert({
          title: 'Message',
          template: data
        });
        $ionicLoading.hide();
      });
    }else{
      $cordovaToast.showLongBottom("Please fill required fields").then(function(success) {
          //success
        }, function(error) {
          //error
        });
    }
  }

})


.controller('CreateProfileCtrl', function($ionicHistory,$filter,$ionicPlatform,$cordovaToast,$scope, $state, $ionicPopup, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaCamera, $ionicActionSheet, $cordovaFileTransfer, $rootScope, $timeout) {
 
  $ionicPlatform.registerBackButtonAction(function(event) {
    // $ionicHistory.goBack();
  },100);

  $scope.user = {};

  $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');
    angular.element(container).on("click", function(){
      document.getElementById('searchTextField').blur();
    })
  }

  $scope.setLatLong = function(lat,long){
    $scope.lat = lat;
    console.log($scope.lat);
    $scope.lng = long;
    console.log($scope.lng);
  }


  var selectedDate;
  $scope.checkDate = function(DOB){
    console.log(DOB);
    $scope.DOB = DOB;
    var selectedText = document.getElementById('datepicker').value;
    $rootScope.selectedDate = new Date(selectedText);
    var date = new Date();
    date.setHours( 0,0,0,0 );
    $rootScope.now = date;
    if ( $rootScope.selectedDate > $rootScope.now) {
      alert("Date of birth should be before today.");
      $scope.DOB = "";
     }
  }


   function initialize() {
      var input = document.getElementById('searchTextField');
      var options = {
      types: ['address']};
      var autocomplete = new google.maps.places.Autocomplete(input, options);
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        console.log(place);
        $scope.user.city = place.formatted_address;
        for (var i = 0; i < place.address_components.length; i++) {
          for (var j = 0; j < place.address_components[i].types.length; j++) {
            if (place.address_components[i].types[j] == "country") {
              $scope.country = place.address_components[i].long_name;
              console.log($scope.country);
            }
          }
        }
        // $scope.user.address = place.name;document.getElementById('city2').value = place.name;
        // document.getElementById('cityLat').value = place.geometry.location.lat();
        // document.getElementById('cityLng').value = place.geometry.location.lng();
        document.getElementById('country').value = $scope.country;
        $scope.user.country = $scope.country;
        // document.getElementById('city').value = $scope.city;
      });
    }
    google.maps.event.addDomListener(window, 'load', initialize);initialize();


  $scope.go_home = function($dataa,$valid) {
    $dataa.DOB = $filter('date')($dataa.DOB, "yyyy-MM-dd");
    var device_token = localStorageService.get('device_token');
    $scope.currentPlatform = ionic.Platform.platform();
    $scope.submitted = true;
    $userdata = localStorageService.get('customer_data');
    console.log($userdata);
    if ($valid) {
      if ( $rootScope.selectedDate > $rootScope.now) {
        $cordovaToast.showLongBottom("Date of birth should be before today.").then(function(success) {
        },function(error) {
        });
        $dataa.DOB = "";
        return;
      }else{
        console.log('success');
      }  
      $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
      var url = BASE_URL + 'update_profile/';
      if ($rootScope.my_profile_image) {
        console.log($rootScope.my_profile_image);
        var targetPath = $rootScope.my_profile_image;
        var filename = targetPath.split("/").pop();
        filename = filename.split('?');
        console.log(filename);
          var options = {
            fileKey: "pic",
            fileName: filename[0],
            chunkedMode: false,
            mimeType: "image/jpg",
          };
          var params = {};
          params.user_token = $userdata.user_token;
          params.user_id = $userdata.id;
          params.country = $dataa.country;
          params.city = $dataa.city;
          params.device_id = device_token;
          params.device_type = $scope.currentPlatform;
          params.price = $dataa.price;
          params.experience = $dataa.experience;
          params.about_me = $dataa.about_me;
          params.job_type = $dataa.job_type;
          params.DOB = $filter('date')($dataa.DOB, "yyyy-MM-dd");
          options.params = params;
          $cordovaFileTransfer.upload(url, targetPath, options).then(function(result) {
          $ionicLoading.hide();
          var hh = JSON.parse(result.response);
          if (hh.status == true) {
            $ionicLoading.hide();
            localStorageService.set('customer_data', hh.data);
            $state.go('add_account');
          } else {
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(hh.message).then(function(success) {
            },function(error) {
            })
            return false;
          }
        }, function(err) {
          $ionicLoading.hide();
          $scope.imgURI = undefined;
          console.log("ERROR: " + JSON.stringify(err));
          $cordovaToast.showLongBottom(err.msg).then(function(success) {
          },function(error) {
          });
        }, function(progress) {
          console.log(progress);
          $ionicLoading.hide();
          $ionicLoading.show({
            template: '<ion-spinner icon="lines"></ion-spinner>'
          });
          $timeout(function() {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
          })
        });
      } else {
        $ionicLoading.hide();
        $dataa.user_token = $userdata.user_token;
        $dataa.user_id = $userdata.id;
        var config = {
          headers: { 'Content-Type': 'application/json;' }
        };                                           
        $http({
          method: 'POST',
          url: url,
          data: $dataa,
          transformRequest: function(obj) {
            var str = [];
            for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data) {
          $ionicLoading.hide();
          if (data.status == true) {
            $ionicLoading.hide();
            localStorageService.set('customer_data', data.data);
            console.log(data.data);
            $state.go('add_account');
          } else {
            $ionicLoading.hide();
            console.log("error");
          }
        }).error(function(data) {
          $ionicLoading.hide();
          $cordovaToast.showLongBottom(data.message).then(function(success) {
          },function(error) {
          });
        });
      }
    }else{
      $ionicLoading.hide();
       $cordovaToast.showLongBottom("Please fill required fields").then(function(success) {
      }, function(error) {
      });
    }
  }

  $scope.chooseimage = function() {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take Photo' },
        { text: 'Take Photo from albums' }
      ],
      titleText: 'Select photos from',
      cancelText: 'Cancel',
      cancel: function() {
        hideSheet();
      },
      buttonClicked: function(index) {
        if (index == 0) {
            takePicture2({
              quality: 100,
              allowEdit: true,
              targetWidth: 500,
              targetHeight: 500,
              sourceType: Camera.PictureSourceType.CAMERA,
              correctOrientation: true,
              encodingType: Camera.EncodingType.JPEG,
              destinationType: Camera.DestinationType.FILE_URI
            });
        } else if (index == 1) {
          takePicture2({
            quality: 100,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            correctOrientation : true,
            destinationType: Camera.DestinationType.FILE_URI,
            MediaType: Camera.MediaType.PICTURE
          });
        } else {
          return true;
        }
        hideSheet();
      }
    });
  }
  
  var takePicture2 = function(options) {
    $cordovaCamera.getPicture(options).then(function(imageURI) {
      console.log(imageURI);
      $scope.imageURI = imageURI;
      $rootScope.my_profile_image = imageURI;
    },function(err) {
      console.error(err);
    });
  }

  $scope.upload_document = function() {
    options = {
      quality : 80,
      allowEdit : true,
      targetWidth: 400,
      targetHeight: 400,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: Camera.EncodingType.JPEG,
      destinationType: Camera.DestinationType.FILE_URI,
      correctOrientation : true,
      MediaType: Camera.MediaType.ALLMEDIA
    };
    $cordovaCamera.getPicture(options).then(function(imageData){ 
      console.log(imageData);
      $scope.imageUri = imageData;
      $rootScope.docs = imageData;
      console.log($rootScope.docs);
    },function(err){
      console.error(err);
    });
  }

})


.controller('accountCtrl', function($ionicPlatform,$ionicHistory,$cordovaToast,$scope, $state, $cordovaToast, $ionicPopup, $ionicLoading, $http, BASE_URL, localStorageService) {

  $ionicPlatform.registerBackButtonAction(function(event) {
    // $ionicHistory.goBack();
  },100);

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  }

  $scope.addBankDetail = function(data,valid){
    $userdata = localStorageService.get('customer_data');
    console.log($userdata);
    if(valid){
      $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
      $http({
        method: 'POST',
        data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id+ '&bankName=' + data.bank_name + '&accountNumber=' + data.account_number +'&routingNumber=' + data.routing_number + '&accountName=' + data.account_name,
        url: BASE_URL+'add_benificiary_account/',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(response) {
        $ionicLoading.hide();
        console.log(response);
        if(response.status == true){
          $ionicLoading.hide();
          localStorageService.set('customer_data', response.data);
          $state.go('purchase');
        } else {
          $ionicLoading.hide();
          $cordovaToast.showLongBottom(response.message).then(function(success) {
          },function(error) {
          });  
        }
      }).error(function(error){
        $ionicLoading.hide();
        console.log(error.Message);
      });
    }else{
      $cordovaToast.showLongBottom("Please fill required fields").then(function(success) {
      },function(error) {
      }); 
    }
  }


})



.controller('homeCtrl', function($ionicPopup,$ionicPlatform,$cordovaToast,$location,$scope, $rootScope, $state, $http, $location, BASE_URL, $ionicHistory, $ionicLoading, localStorageService) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    if($state.current.name=="tab.home") {
      $ionicPopup.confirm({
        title: 'EXIT',
        template: 'Are you sure you want to Exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      }) 
    }
  },100);

  $scope.cusdata = [];
  $scope.getjobs = function() {
    $userdata = localStorageService.get('customer_data');
    $scope.inapp = $userdata.purchase;
    console.log($userdata);
    $scope.submitted = true;
    var params = {
      'user_token': $userdata.user_token
    };
    console.log(params);
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    var Url = BASE_URL + '/get_all_jobs';
    var config = {
      headers: {
       'Content-Type': 'application/json;'
      }
    };
    $http({
      method: 'POST',
      url: Url,
      data: params,
      transformRequest: function(obj) {
        var str = [];
        for (var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $ionicLoading.hide();
      console.log(data);
      if(data.status == false) {
        $ionicLoading.hide();
        if(response.message == "Session Expired!! Please login again."){
          localStorageService.remove('customer_data');
          $ionicHistory.clearCache().then(function() {
            $state.go('login'); 
          })
        }
      } else {
        $ionicLoading.hide();
        $scope.cusdata = data.data;
      }
    }).error(function(data) {
      $ionicLoading.hide();
      $cordovaToast.showLongBottom(data.message).then(function(success) {
      }, function(error) {
      });
    });
  }

  $scope.doRefresh = function() {
    $userdata = localStorageService.get('customer_data');
    console.log($userdata);
    $scope.submitted = true;
    var params = {
      'user_token': $userdata.user_token
    };
    console.log(params);
    var Url = BASE_URL + '/get_all_jobs';
    var config = {
      headers: { 'Content-Type': 'application/json;' }
    };
    $http({
      method: 'POST',
      url: Url,
      data: params,
      transformRequest: function(obj) {
        var str = [];
        for (var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      console.log(data);
      if(data.status == true) {
        $ionicLoading.hide();
        $scope.cusdata = data.data;
        console.log($scope.cusdata);
      } else {
        $ionicLoading.hide();
        console.log(data.message);
      }
      }).error(function(data) {
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(data.message).then(function(success) {
        },function(error) {
        });
      })
      .finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      }) 
  };

  $scope.go_detail_customer = function(id) {
    console.log("this is job id =", id);
    $rootScope.jobid = id;
    $state.go('job_detail');
    // $location.url("job_detail?id");
    // $scope.job_dataa();
  }

  $scope.go_detail = function() {
    $state.go('job_detail');
  }

  $scope.go_profile = function() {
    $state.go('profile');
  }

  $scope.go_message = function() {
    $state.go('message');
  }


})


.controller('JobDetailCtrl', function($ionicPlatform,IMG_URL,$cordovaToast,$scope, $state, BASE_URL, localStorageService, $rootScope, $ionicHistory, $ionicLoading, $http, $ionicPopup) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
   $ionicHistory.goBack();
  },100);

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  }

  $scope.img_url = IMG_URL;

  $scope.go_job_applicants = function() {
    $state.go('job_applicants');
  }

  $scope.job_dataa = function() {
    $userdata = localStorageService.get('customer_data');
    console.log($rootScope.jobid);
    $scope.submitted = true;
    $scope.user_token = $userdata.user_token;
    console.log($scope.user_token);
    var params = {
      'user_token': $userdata.user_token,
      'user_id': $userdata.id,
      'job_id': $rootScope.jobid,
      'user_type':'sp'
    }
    console.log(params)
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    var Url = BASE_URL + 'get_job_detail/';
    var config = {
      headers: { 'Content-Type': 'application/json;' }
    };
    $http({
      method: 'POST',
      url: Url,
      data: params,
      transformRequest: function(obj) {
        var str = [];
        for (var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $ionicLoading.hide();
      console.log(data);
      if(data.status == true){
        $ionicLoading.hide();
        $scope.status = data;
        $scope.creater = data.job_creater;
        console.log($scope.creater);
        $scope.jobdata = data.data;                                                         
        // $rootScope.jobtype = $scope.jobdata.price_type;
        // console.log($rootScope.jobtype);
      } else {
        $ionicLoading.hide();
        console.log("hello");
      }
    }).error(function(data) {
      $ionicLoading.hide();
      console.log(data);
        $cordovaToast.showLongBottom(data.message).then(function(success) {
          console.log(success);
          },function(error) {
            console.log(error);
          });
      });
  }
  $scope.job_dataa();


  $scope.applyJob = function(id,user_id){
    console.log(id);
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id+ '&job_id=' + id + '&user_type=' +'sp',
      url: BASE_URL+'/apply_for_job',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      console.log(response);
      $ionicLoading.hide();
      if(response.status == false){
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        }, function(error) {
        });
      }else{
        $ionicLoading.hide();
        $scope.job_dataa();
        $cordovaToast.showLongBottom("Successfully Applied").then(function(success) {
        },function(error) {
        });
        $scope.datU = response.job_creator_details;
      }
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }


  $scope.job_type = function() {
    console.log("job type by clicking the radio");
    if ($rootScope.jobtype == 'F') {
      $scope.pricetype = 'Fixed';
    } else {
      $scope.pricetype = 'Hourly';
    }
  }
  $scope.job_type();


  $scope.startJob = function(job_id){
    swal({
      title: "Are you sure?",
      text: "You want to start this job!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, start it!",
      cancelButtonText: "No, cancel please!",
      closeOnConfirm: false,
      closeOnCancel: false
    },
    function(isConfirm){
      if (isConfirm) {
        swal("Start!", "Successfully started.", "success");
        $userdata = localStorageService.get('customer_data');
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
        $http({
          method: 'POST',
          data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id+ '&job_id=' + job_id,
          url: BASE_URL+'start_job/',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(response) {
          $ionicLoading.hide();
          console.log(response);
          if(response.status == false){
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
          } else {
            $ionicLoading.hide();
            $state.go('tab.myjobs');
            $cordovaToast.showLongBottom("Successfully").then(function(success) {
            },function(error) {
            });
            //$scope.dataStart = response;
          }
        }).error(function(error){
          $ionicLoading.hide();
          console.log(error.Message);
        });
      } else {
        swal("Cancelled", "", "error");
      }
    })
  }

  $scope.canceljob = function(job_id){
    swal({
      title: "Are you sure?",
      text: "You want to Cancel this job!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, start it!",
      cancelButtonText: "No, cancel please!",
      closeOnConfirm: false,
      closeOnCancel: false
    },               
    function(isConfirm){
      if (isConfirm) {
        swal("Cancel!", "Successfully Cancelled.", "success");
        $userdata = localStorageService.get('customer_data');
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
        $http({
          method: 'POST',
          data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id+ '&job_id=' + job_id,
          url: BASE_URL+'reject_job/',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(response) {
          $ionicLoading.hide();
          console.log(response);
          if(response.status == false){
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
          } else {
            $ionicLoading.hide();
            $state.go('tab.home');
            $cordovaToast.showLongBottom("Successfully").then(function(success) {
            },function(error) {
            });
          }
        }).error(function(error){
          $ionicLoading.hide();
          console.log(error.Message);
        });
      } else {
        swal("Cancelled", "", "error");
      }
    })
  }

  $scope.messageG = function(id){
    $rootScope.ch_id_cus = id;
    console.log($rootScope.ch_id_cus);
    $state.go('conversations');
  }


})


.controller('MyjobsCtrl', function($ionicPlatform,$cordovaToast,$scope,$state,BASE_URL,localStorageService,$rootScope,$ionicHistory,$ionicLoading,$http,$ionicPopup) {
    
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.myJob = "My Jobs";

  $scope.myJobsIn = function(){
    console.log("My jobs Inprogress");
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id,
      url: BASE_URL+'getJobstatus/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      $ionicLoading.hide();
      console.log(response);
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        }, function(error) {
        });
      } else {
        $ionicLoading.hide();
        $scope.allJobSt = response.data;
        console.log($scope.allJobSt);
      }
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }


  $scope.doRefresh = function() {
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id,
      url: BASE_URL+'/getJobstatus',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      $ionicLoading.hide();
      console.log(response);
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        }, function(error) {
        });
      } else {
        $ionicLoading.hide();
        $scope.allJobSt = response.data;
        console.log($scope.allJobSt);
      }
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    }) 
  }

  $scope.jobDetailsUpcoming = function(id) {
    $rootScope.job_i = id;
    $state.go('job_detail_applied');
  }

  $scope.jobDetailWaiting = function(id) {
    $rootScope.job_i = id;
    $state.go('job_detail_applied');
  }

  $scope.jobDetailInprogress = function(id) {
    $rootScope.job_i = id;
    $state.go('job_detail_applied');
  }

  $scope.go_profile = function() {
    $state.go('profile');
  }

  $scope.go_message = function() {
    $state.go('message');
  }

})


.controller('CompletedjobsCtrl', function($ionicPlatform,$cordovaToast,$scope,$state,BASE_URL,localStorageService,$rootScope,$ionicHistory,$ionicLoading,$http,$ionicPopup) {

  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);


  $scope.compJob = function(){
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id,
      url: BASE_URL+'getJobstatus',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      $ionicLoading.hide();
      console.log(response);
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        },function(error) {
        });
      }else{
        $ionicLoading.hide();
        $scope.completeJ = response.data;
        console.log($scope.completeJ);
      }
      $ionicLoading.hide();
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }

  $scope.doRefresh = function(){
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id,
      url: BASE_URL+'/getJobstatus',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      console.log(response);
      if(response.status == false){
        $cordovaToast.showLongBottom(response.message).then(function(success) {
        },function(error) {
        });
      }else{
        $scope.completeJ = response.data;
        console.log($scope.completeJ);
      }
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    })
  } 

  $scope.job_detail_completed = function(id) {
    $rootScope.jo_id = id;
    $state.go('job_detail_completed');
  }

  $scope.go_profile = function() {
    $state.go('profile');
  }

  $scope.go_message = function() {
    $state.go('message');
  }

})


.controller('JobDetailCompletedCtrl', function($ionicPlatform,IMG_URL,$cordovaToast,$scope,$state, BASE_URL,localStorageService,$rootScope,$ionicHistory,$ionicLoading,$http,$ionicPopup) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.img_url = IMG_URL;
  $scope.com = "completed Job Detail";

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.jDetailsCom = function(){
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&job_id=' + $rootScope.jo_id + '&user_type=' + 'sp',
      url: BASE_URL+'/get_job_detail',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      $ionicLoading.hide();
      console.log(response);
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
          console.log(success);
        }, function(error) {
          console.log(error);
        });
      } else {
        $ionicLoading.hide();
        $scope.allJobDetailsComplet = response.data;
        console.log($scope.allJobDetailsComplet);
        $scope.jobCreatrCompleteJo = response.job_creater;
        console.log($scope.jobCreatrCompleteJo);
      }
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }  

  $scope.compJmessage = function(id){
    $rootScope.ch_id_cus = id
    $state.go('conversations');
  }

  $scope.viewServRec = function(id,user_id){
    $rootScope.viSerRe = id;
    $rootScope.rateOtherUser = user_id;
    $state.go("receipt");
  }


})
   

.controller('JobDetailApplied', function($ionicPlatform,IMG_URL,localStorageService,$rootScope,$ionicHistory,$ionicLoading,$http,$ionicPopup,$cordovaToast,$scope,$state,BASE_URL) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.img_url = IMG_URL;
  $scope.jobDetails = "Job Detail";

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.Alljodetail = function(){
    console.log($rootScope.job_i);
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&job_id=' + $rootScope.job_i + '&user_type=' + 'sp',
      url: BASE_URL+'get_job_detail/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      $ionicLoading.hide();
      console.log(response);
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
          console.log(success);
        }, function(error) {
          console.log(error);
        });
      } else {
        $ionicLoading.hide();
        $scope.allJobDetails = response.data;
        $scope.jobCreatr = response.job_creater;
        console.log($scope.allJobDetails);
      }
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }


  $scope.startJobDe = function(job_id_de){
    swal({
      title: "Are you sure?",
      text: "You want to start this job!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, start it!",
      cancelButtonText: "No, cancel plx!",
      closeOnConfirm: false,
      closeOnCancel: false
    },
    function(isConfirm){
      if(isConfirm) {
        swal("Start!", "Successfully started.", "success");
        $userdata = localStorageService.get('customer_data');
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
        $http({
          method: 'POST',
          data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id+ '&job_id=' + job_id_de,
          url: BASE_URL+'start_job/',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(response) {
          $ionicLoading.hide();
          console.log(response);
          if(response.status == false){
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
          } else {
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
            $state.go('tab.myjobs');
          }
        }).error(function(error){
          $ionicLoading.hide();
          console.log(error.Message);
        });
      }else{
        swal("Cancelled", " :)", "error");
      }
    })
  }

  $scope.canceljobA = function(job_id){
    console.log(job_id);
    swal({
      title: "Are you sure?",
      text: "You want to cancel this job!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, end it!",
      cancelButtonText: "No, cancel plx!",
      closeOnConfirm: false,
      closeOnCancel: false
    },
    function(isConfirm){
      if(isConfirm){
        swal("Cancel!", "Successfully Cancelled.", "success");
        $userdata = localStorageService.get('customer_data');
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
        $http({
          method: 'POST',
          data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id+ '&job_id=' + job_id,
          url: BASE_URL+'reject_job/',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(response) {
          $ionicLoading.hide();
          console.log(response);
          if(response.status == false){
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
          } else {
            $ionicLoading.hide();
            $state.go('tab.home');
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
          }
        }).error(function(error){
          $ionicLoading.hide();
        });
      }else{
        swal("Cancelled", ":)", "error");
      }
    })
  }




  $scope.endJob = function(job_id_E){
    swal({
      title: "Are you sure?",
      text: "You want to end this job!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, end it!",
      cancelButtonText: "No, cancel plx!",
      closeOnConfirm: false,
      closeOnCancel: false
    },
    function(isConfirm){
      if (isConfirm) {
        swal("End!", "Successfully Ended.", "success");
        $userdata = localStorageService.get('customer_data');
        $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
        $http({
          method: 'POST',
          data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id+ '&job_id=' + job_id_E,
          url: BASE_URL+'/end_job',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(response) {
          $ionicLoading.hide();
          console.log(response);
          if(response.status == false){
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
          } else {
            $ionicLoading.hide();
            $cordovaToast.showLongBottom(response.message).then(function(success) {
            },function(error) {
            });
            $state.go('tab.completed_jobs');
          }
        }).error(function(error){
          $ionicLoading.hide();
        });
      } else {
        swal("Cancelled", " :)", "error");
      }
    })
  }

    // $ionicPopup.confirm({
    //   title: 'END JOB',
    //   template: 'Are you sure you want to END this job'
    // }).then(function(res) {
    //   if (res) {
    //     $userdata = localStorageService.get('customer_data');
    //     $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    //     $http({
    //       method: 'POST',
    //       data: 'user_token=' + $userdata.user_token + '&sp_id=' + $userdata.id+ '&job_id=' + job_id_E,
    //       url: BASE_URL+'/end_job',
    //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    //     }).success(function(response) {
    //       console.log(response);
    //       if(response.status == false){
    //         $ionicLoading.hide();
    //         $cordovaToast.showLongBottom(response.message).then(function(success) {
    //         console.log(success);
    //         },function(error) {
    //           console.log(error);
    //         });
    //       } else {
    //         $ionicLoading.hide();
    //         $cordovaToast.showLongBottom(response.message).then(function(success) {
    //           console.log(success);
    //           $state.go('tab.completed_jobs');
    //         },function(error) {
    //           console.log(error);
    //         });
    //       }
    //     }).error(function(error){
    //       $ionicLoading.hide();
    //       console.log(error.Message);
    //     });
    //   }
    // })


  $scope.goMessageAp = function(id){
    console.log(id);
    $rootScope.ch_id_cus = id;
    $state.go('conversations');
  }

})


.controller('profileCtrl', function($ionicPopup,$ionicPlatform,IMG_URL,$scope, $state, $window, $ionicHistory, localStorageService) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);


  $scope.img_url = IMG_URL;

  $scope.go_edit_profile = function() {
    $state.go('edit_profile');
  }
        
  $scope.profiledata = function() {
    $scope.userdataa = localStorageService.get('customer_data');
    console.log($scope.userdataa);
  }

  $scope.logout = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Logout',
      cssClass:'logout_popup',
      template: 'Are you sure you want to logout'
    });
    confirmPopup.then(function(res) {
      if(res) {
        localStorageService.remove('customer_data');
        $ionicHistory.clearCache().then(function() { 
        $state.go('login'); })
      }else {
        console.log('You are not sure');
      }
    }) 
  }

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  }

  $scope.changePasswordG = function(){
    $state.go('change_password');
  }

  $scope.hello = function(){
    alert("hello");
  }


})
    

.controller('editprofileCtrl', function($ionicHistory,$ionicPlatform,IMG_URL,$scope,$rootScope,$timeout,$ionicActionSheet,$state,$ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.user = {};

  $scope.img_url = IMG_URL;
  $userdata = localStorageService.get('customer_data');
  $scope.user = $userdata;

    function initialize() {
      var input = document.getElementById('searchTextField');
      var options = {
      types: ['address']};
      var autocomplete = new google.maps.places.Autocomplete(input, options);
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        console.log(place);
        $scope.user.city = place.formatted_address;
        for (var i = 0; i < place.address_components.length; i++) {
          for (var j = 0; j < place.address_components[i].types.length; j++) {
            if (place.address_components[i].types[j] == "country") {
              $scope.country = place.address_components[i].long_name;
              console.log($scope.country);
            }
            if (place.address_components[i].types[j] == "administrative_area_level_2") {
              $scope.city = place.address_components[i].long_name;
              console.log($scope.city);
            }
          }
        }
        // $scope.user.address = place.name;document.getElementById('city2').value = place.name;
        // document.getElementById('cityLat').value = place.geometry.location.lat();
        // document.getElementById('cityLng').value = place.geometry.location.lng();
        // document.getElementById('country').value = $scope.country;
        // document.getElementById('city').value = $scope.city;
        // $scope.user.lat = $scope.country;
        // console.log($scope.user.lat);
      });
    }
    google.maps.event.addDomListener(window, 'load', initialize);initialize();



  $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');
    angular.element(container).on("click", function(){
      document.getElementById('searchTextField').blur();
    })
  }

  $scope.setLatLong = function(lat,long){
    $scope.lat = lat;
    console.log($scope.lat);
    $scope.lng = long;
    console.log($scope.lng);
  }


  $scope.edit_profile = function($dataa, $valid) {
    console.log($dataa.city);
    $scope.submitted = true;
    $userdata = localStorageService.get('customer_data');
    console.log($rootScope.my_profile_image);
    var url = BASE_URL + '/update_profile';
    if ($valid) {
      if ($rootScope.my_profile_image) {
        console.log($rootScope.my_profile_image);
        var targetPath = $rootScope.my_profile_image;
        var filename = targetPath.split("/").pop();
        filename = filename.split('?');
        console.log(filename);
        var options = {
          fileKey: "pic",
          fileName: filename[0],
          chunkedMode: false,
          mimeType: "image/jpg",
        };
        var params = {};
        params.email = $dataa.email;
        params.user_token = $dataa.user_token;
        params.user_id = $dataa.id;
        params.user_type = $dataa.user_type;
        params.city = $dataa.city;
        params.about_me = $dataa.about_me;
        params.experience  = $dataa.experience;
        params.price  = $dataa.price;
        params.job_type = $dataa.job_type;
        params.pic = $rootScope.my_profile_image;
        options.params = params;
        $cordovaFileTransfer.upload(url, targetPath, options).then(function(result) {
          console.log("Hellooo");
          console.log(result);
          var hh = JSON.parse(result.response);
          if (hh.status == true) {
            $ionicLoading.hide();
            localStorageService.set('customer_data', hh.data);
            console.log(hh.data);
            $state.go('profile');
          } else {
            console.log(result);
            $ionicLoading.hide();
            return false;
          }
        },
        function(err) {
          $scope.imgURI = undefined;
          console.log("ERROR: " + JSON.stringify(err));
          $ionicLoading.hide();
        },
        function(progress) {
          $ionicLoading.show({
            template: '<ion-spinner icon="lines"></ion-spinner>'
          });
          $timeout(function() {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
          })
        });
      } else {
        $dataa.user_token = $userdata.user_token;
        $dataa.user_id = $userdata.id;
        var config = {
          headers: { 'Content-Type': 'application/json;' }
        };
        $http({
          method: 'POST',
          url: url,
          data: $dataa,
          transformRequest: function(obj) {
            var str = [];
            for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data) {
          $ionicLoading.hide();
          if (data.status == true){
            $ionicLoading.hide();
            localStorageService.set('customer_data', data.data);
            console.log(data.data);
            $state.go('profile');
          } else {
            $ionicLoading.hide();
            console.log("error");
          }
        }).error(function(data) {
          console.log(data);
          $ionicLoading.hide();
        });
      }
    }
  }

  $scope.chooseImageDemo = function(){
    console.log('Helloimage');
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take Photo' },
        { text: 'Take Photo from albums' }
      ],
      titleText: 'Select photos from',
      cancelText: 'Cancel',
      cancel: function() {
        hideSheet();
      },
      buttonClicked: function(index) {
        if (index == 0) {
          takePictureDemo({
            quality: 100,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            destinationType: Camera.DestinationType.DATA_URL
          });
        }else if (index == 1) {
          takePictureDemo({
            quality: 100,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            destinationType: Camera.DestinationType.DATA_URL,
            MediaType: Camera.MediaType.PICTURE
          });
        } else {
          return true;
        }
        hideSheet();
      }
    })
  }
  var takePictureDemo = function(options) {
    $cordovaCamera.getPicture(options).then(function(imageURI) {
      console.log(imageURI);
    },function(err) {
      console.error(err);
    });
  }

  $scope.chooseimage = function() {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take Photo' },
        { text: 'Take Photo from albums' }
      ],
      titleText: 'Select photos from',
      cancelText: 'Cancel',
      cancel: function() {
        hideSheet();
      },
      buttonClicked: function(index) {
        if (index == 0) {
          takePicture2({
            quality: 100,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            destinationType: Camera.DestinationType.FILE_URI
          });
        }else if (index == 1) {
          takePicture2({
            quality: 100,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            destinationType: Camera.DestinationType.FILE_URI,
            MediaType: Camera.MediaType.PICTURE
          });
        } else {
          return true;
        }
        hideSheet();
      }
    })
  }
  var takePicture2 = function(options) {
    $cordovaCamera.getPicture(options).then(function(imageURI) {
      console.log(imageURI);
      $scope.imageURI = imageURI;
      console.log($rootScope.imageURI);
      $rootScope.my_profile_image = imageURI;
    },function(err) {
      console.error(err);
    });
  }

})

    
.controller('MessageCtrl', function($cordovaToast,$ionicPlatform,$ionicHistory,IMG_URL,$ionicScrollDelegate,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.img_url = IMG_URL;

  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }

  $scope.getLastConver = function(){
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id,
      url: BASE_URL+'getLastChat/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      console.log(response);
      $ionicLoading.hide();
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
          console.log(success);
        }, function(error) {
          console.log(error);
        });
      }else{
        $ionicLoading.hide();
        $scope.allMessages = response.data;
      }
    }).error(function(error){
      $ionicLoading.hide();
    });
  }

  $scope.doRefresh = function() {
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id,
      url: BASE_URL+'getLastChat/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      $ionicLoading.hide();
      if(response.status == false){
        $ionicLoading.hide();
        $cordovaToast.showLongBottom(response.message).then(function(success) {
          console.log(success);
        }, function(error) {
          console.log(error);
        });
      }else{
        $ionicLoading.hide();
        $scope.allMessages = response.data;
        console.log($scope.allMessages);     
      }
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    }).finally(function() {
      console.log('stop_refreshing');
      $scope.$broadcast('scroll.refreshComplete');
    }) 
  }

  $scope.chat_go = function(id) {
    $rootScope.ch_id_cus = id;
    $state.go('conversations');
  }

})

// var interval = null;

.controller('conversationsCtrl', function($ionicHistory,$ionicScrollDelegate,$timeout,$ionicPlatform,$interval,IMG_URL,$ionicScrollDelegate,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {

  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }

  // setInterval(function(){
  //   console.log($rootScope.ch_id_cus);
  //   $scope.othr_id = $rootScope.ch_id_cus;
  //   $userdata = localStorageService.get('customer_data');
  //   $scope.my_id = $userdata.id;
  //   $http({
  //     method: 'POST',
  //     data: 'user_token=' + $userdata.user_token + '&reciver_id=' + $rootScope.ch_id_cus+ '&sender_id=' + $userdata.id,
  //     url: BASE_URL+'/getChat',
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  //   }).success(function(response){
  //     $ionicLoading.hide();
  //     console.log(response);
  //     $scope.chatDta = response.data;
  //   }).error(function(error){
  //     $ionicLoading.hide();
  //     console.log(error.Message);
  //   })
  // },6000);

  $rootScope.chatConver = function(){
    $ionicScrollDelegate.scrollBottom(true);
    console.log($rootScope.ch_id_cus);
    $scope.othr_id = $rootScope.ch_id_cus;
    $userdata = localStorageService.get('customer_data');
    $scope.my_id = $userdata.id;
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&reciver_id=' + $rootScope.ch_id_cus+ '&sender_id=' + $userdata.id,
      url: BASE_URL+'getChat',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      $ionicLoading.hide();
      $scope.chatDta = response.data;
      $ionicScrollDelegate.scrollBottom(true);
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    })
  }

  $scope.sendMessage = function(data){
    console.log($rootScope.ch_id_cus);
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&reciver_id=' + $rootScope.ch_id_cus+ '&sender_id=' + $userdata.id+ '&message=' + data,
      url: BASE_URL+'chat',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      $ionicLoading.hide();
      console.log(response);
      $scope.chatDta = response.data;
      $ionicScrollDelegate.scrollBottom(true);
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    })
  }

  $scope.inputUp = function(){
    $timeout(function(){
      $ionicScrollDelegate.scrollBottom(true);
    }, 1000);
  }

  $scope.inputDown = function(){
    $timeout(function(){
      $ionicScrollDelegate.resize();
    }, 1000);
  }


})


.controller('changePassCtrl', function($cordovaToast,$ionicPlatform,$ionicHistory,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {

  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);


  $scope.myGoBack = function(){
    $ionicHistory.goBack();
  }

  $userdata = localStorageService.get('customer_data');
  $scope.changePassword = function(data,valid){
    $scope.submitted = true;
    if(valid){
      $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
      $userdata = localStorageService.get('customer_data');
      $http({
        method: 'POST',
        data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&oldPassword=' + data.oldPassword + '&newPassword=' + data.newPassword,
        url: BASE_URL+'changePassword',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(response){
        console.log(response);
        $ionicLoading.hide();
        if(response.status == false){
          $ionicLoading.hide();
          $cordovaToast.showLongBottom(response.message).then(function(success) {
          }, function(error) {
          });
        }else{
          $ionicLoading.hide();
          $state.go('profile');
        }
      }).error(function(error){
        $ionicLoading.hide();
        console.log(error.Message);
      });
    }else{
      $cordovaToast.showLongBottom("Please fill required fields").then(function(success) {
      }, function(error) {
      });
    }
  }

})

.controller('receiptCtrl', function($filter,IMG_URL,$ionicPlatform,$ionicHistory,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.img_url = IMG_URL;

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.receiptProvide = function(){
    console.log($rootScope.viSerRe);
    $userdata = localStorageService.get('customer_data');
    console.log($userdata);
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token+ '&user_id=' + $userdata.id+ '&job_id=' + $rootScope.viSerRe,
      url: BASE_URL+'/getReceipt',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      $ionicLoading.hide();
      console.log(response);
      $scope.receiptData = response.data;
      $scope.s_job = $scope.receiptData.start_job;
      $scope.e_job = $scope.receiptData.end_job;
      $scope.s_job = $filter('date')(new Date($scope.s_job.split('-').join('/')), "d MMMM yyyy");
      $scope.e_job = $filter('date')(new Date($scope.e_job.split('-').join('/')), "d MMMM yyyy");
      // $cordovaToast.showLongBottom(response.message).then(function(success) {
      //   console.log(success);
      // },function (error) {
      //   console.log(error);
      // });
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    }); 
  }

  $scope.go_paymentCom = function(){
    console.log($rootScope.rateOtherUser);
    $state.go("rating");
  }

})


.controller('RatingCtrl', function($cordovaToast,IMG_URL,$ionicPlatform,$ionicHistory,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

    $scope.img_url = IMG_URL;

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.rattingInit = function(){
    console.log($rootScope.rateOtherUser);
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id+ '&other_user_id=' + $rootScope.rateOtherUser,
      url: BASE_URL+'view_user_detail',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      console.log(response);
      $scope.otherProData = response.data;
      $ionicLoading.hide();
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }

  $scope.ratingArr = [{
    value: 1,
    icon: 'ion-ios-star-outline',
    question: 1
  }, {
    value: 2,
    icon: 'ion-ios-star-outline',
    question: 2
  }, {
    value: 3,
    icon: 'ion-ios-star-outline',
    question: 3
  }, {
    value: 4,
    icon: 'ion-ios-star-outline',
    question: 4
  }, {
    value: 5,
    icon: 'ion-ios-star-outline',
    question: '5'
  }];

  $scope.setRating = function(question,val) {
    var rtgs = $scope.ratingArr;
    for (var i = 0; i < rtgs.length; i++) {
      if (i < val) {
        rtgs[i].icon = 'ion-ios-star';
      } else {
        rtgs[i].icon = 'ion-ios-star-outline';
      }
    };
    $scope.question = question;
  }

  $scope.rateSubmit = function(comment){
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id+ '&receiver_id=' + $rootScope.rateOtherUser +'&rating='+ $scope.question + '&msg='+ comment,
      url: BASE_URL+'add_rating',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      $ionicLoading.hide();
      $cordovaToast.showLongBottom(response.message).then(function(success) {
      }, function(error) {
      });
      $state.go('tab.home');
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }

})


.controller('settingCtrl', function($ionicPlatform,$ionicHistory,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

   $userdata = localStorageService.get('customer_data');
   console.log($userdata);

  if ($userdata.notification == 'n') {
    $scope.pushNotification = {checked: false};
  } else {
    $scope.pushNotification = {checked: true};
  }

  $scope.pushNotificationChange = function(pushNotification) {
    console.log(pushNotification);
    if (pushNotification == true) {
      val = 'y'
    } else {
      val = 'n'
    }
    $userdata = localStorageService.get('customer_data');

    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&notification=' + val,
      url: BASE_URL + 'notification',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response) {
      console.log(response);
      localStorageService.set('customer_data',response.data);
      $ionicLoading.hide();
    }).error(function(error) {
      $ionicLoading.hide();
      console.log(error.Message);
    });
  }


})


.controller('notificationsCtrl', function($ionicHistory,$ionicPlatform,IMG_URL,$cordovaToast,$scope,$state, BASE_URL,localStorageService,$rootScope,$ionicHistory,$ionicLoading,$http,$ionicPopup) {
  
  $ionicPlatform.registerBackButtonAction(function(event) {
    $ionicHistory.goBack();
  },100);

  $scope.img_url = IMG_URL;

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.go_profile = function() {
    $state.go('profile');
  }

  $scope.go_message = function() {
    $state.go('message');
  }

  $scope.GetNotification = function(){
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id,
      url: BASE_URL+'notification_history',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      console.log(response);
      $ionicLoading.hide();
      $scope.notiHis = response.data;
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    })
  }

  $scope.goChat = function(id){
    $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&notification_id=' + id,
      url: BASE_URL+'read_notification',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      console.log(response);
      $ionicLoading.hide();
      $state.go("message");
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    })
  }

  $scope.gohome = function(id){
     $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&notification_id=' + id,
      url: BASE_URL+'read_notification',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      console.log(response);
      $ionicLoading.hide();
      $state.go("tab.home");
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    })
  }

  $scope.goMyJ = function(id){
     $userdata = localStorageService.get('customer_data');
    $http({
      method: 'POST',
      data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id + '&notification_id=' + id,
      url: BASE_URL+'read_notification',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(response){
      console.log(response);
      $ionicLoading.hide();
      $state.go("tab.myjobs");
    }).error(function(error){
      $ionicLoading.hide();
      console.log(error.Message);
    })
  }


})

.controller('purchaseCtrl', function($cordovaToast,IMG_URL,$ionicPlatform,$ionicHistory,$scope, $rootScope, $timeout, $ionicActionSheet, $state, $ionicPopup, $cordovaCamera, $ionicLoading, $http, BASE_URL, localStorageService, $cordovaFileTransfer) {

$ionicPlatform.registerBackButtonAction(function(event) {
    if($state.current.name == "purchase") {
      $ionicPopup.confirm({
        title: 'EXIT',
        template: 'Are you sure you want to Exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      }) 
    }
  },100);

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.buy = function(){
    $userdata = localStorageService.get('customer_data');
    $ionicLoading.show({template: '<ion-spinner icon="lines"></ion-spinner>'});
    
    inAppPurchase
    //.buy('com.halphero.provider.purchase')
    .buy('com.halphero.provider.purchasetesting')
    .then(function (data) {
      console.log(data);
      $http({
        method: 'POST',
        data: 'user_token=' + $userdata.user_token + '&user_id=' + $userdata.id,
        url: BASE_URL+'update_package',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(response){
        console.log(response);
        $ionicLoading.hide();
        if(response.status == false){
          if(response.message == "Session Expired!! Please login again."){
            localStorageService.remove('customer_data');
            $ionicHistory.clearCache().then(function() {
              $state.go('login'); 
            })
          }
        }else{
         localStorageService.set('customer_data', response.data);
          $state.go("tab.home");
        }
      }).error(function(error){
        $ionicLoading.hide();
        console.log(error.Message);
      })
    })
    .catch(function (err) {
      $ionicLoading.hide();
      console.log(err);
    });
  }


})

////////////////////////////////////////////////////////




