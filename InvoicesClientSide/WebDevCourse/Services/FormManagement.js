angular.module('MainApp').factory('FormManagement', ['$rootScope', '$timeout', '$cookieStore', '$window', 'WebServiceUrl',
    '$window', '$compile', '$http','$q',
    function ($rootScope, $timeout, $cookieStore, WebServiceUrl, WebReportUrl, $window, $compile, $http, $q) {
        var SetUpFormStandards = function () {
            var d = $q.defer();
            if ($window.localStorage.getItem("FromHelpData") != undefined) {
                var FormData = {};
                FormData = JSON.parse($window.localStorage.getItem("FromHelpData"));
                $window.localStorage.removeItem("FromHelpData");
                d.resolve(FormData);
            }
            d.reject();
            return d.promise;
        }

        var FormProperties = {};

        //var SetScreenOptions = function (toolbarOptions, inqSearch) {
        //    if (toolbarOptions != undefined || toolbarOptions != null) {
        //        FormProperties.toolbarOptions = toolbarOptions;
        //    }
        //    if (inqSearch != undefined || inqSearch != null) {
        //        FormProperties.inqSearch = inqSearch;
        //    }
        //}

        //var GetScreenOptions = function() {
        //    return FormProperties;
        //}

        //var ResetScreenOptions = function () {
        //    FormProperties = {};
        //}


        return {
            SetUpFormStandards: SetUpFormStandards, FormProperties: FormProperties 
            }
    }]);