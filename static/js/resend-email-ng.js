
var app = angular.module('fluxMembersApp', []);

app.controller('FluxController', function($scope, $log, $rootScope, $http, $window){
    //
    // Variables needed
    //

    $rootScope._ = _;

    var flux = this;
    flux.errorMsg = '';
    flux.msg = '';
    flux.debug = false;
    flux.valid_regions = [];
    flux.set_password = false;
    flux.showMemberSubmit = true;
    flux.showLoading = true;
    flux.email = '';

    flux.detailsValid = false;
    flux.needsValidating = true;

    flux.memberSecret = getParam('s');

    if (document.location.hostname == 'localhost'){
        flux.debug = true;
    }

    //
    // Functions: api
    //

    flux.api = function(path){
        path = 'api/v0/' + path;
        if (flux.debug){
            return "http://localhost:5000/" + path;
        }
        if(window.location.hostname == "flux-api-dev.herokuapp.com") {
            return "http://flux-api-dev.herokuapp.com/" + path;
        }
        return "https://api.voteflux.org/" + path;
    };

    //
    // functions utils
    //

    flux.handleError = function(error){
        flux._showError(error);
        $log.log(error);
        flux.showLoading = false;
    };
    flux._showError = function(error){
        flux.msg = '';
        console.log('Got error ---V');
        console.log(error);
        if(typeof error === 'object'){
            if (error.status == 403){
                flux.errorMsg = 'Forbidden Error - Are Authentication Details Correct?';
            } else {
                if (error.data.error_args) {
                    flux.errorMsg = JSON.stringify(error.data.error_args);
                }
            }
        } else {
            flux.errorMsg = error;
        }
    };

    // login

    flux.resendEmail = function(){
        flux.msg = 'Sending email...';
        flux.errorMsg = '';
        flux.submitEmail(flux.email);
    }

    flux.submitEmail = function(e){
        console.log('Submitting ' + e);
        $http.post(flux.api('send_user_details'), {email: e}).then(flux.finish, flux.handleError);
    }

    flux.finish = function(data){
        flux.msg = data.data['status'];
    }

    flux.batchEmails = function(emails){
        emails.forEach(flux.submitEmail);
    }
    emailsFunction = flux.batchEmails;

    //
    // call these functions when script loads
//    //
//
//    $window.onload = function(e) {
//        flux.showLoading = false;
//        $scope.$digest();
//    }
});
