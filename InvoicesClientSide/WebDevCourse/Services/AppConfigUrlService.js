angular.module('MainApp').factory('AppConfigUrlService', ['$http', '$q', 'Utils','WebServiceUrl',
            function ($http, $q, Utils, WebServiceUrl) {

                var WebHelpUrl = 'https://remoteapp.softwaredesign.ae:8087/api/';

                var getappconfigurls = function () {
                    var d = $q.defer();

                    //Added by Chazel TW#21142 10/10/2018
                    //get appconfig urls
                    //saved the data in Utils.appconfigurls so that it can be used all over the app
                    if (!Utils.appconfigurls.WebHelpUrl) {
                        $http.post(WebServiceUrl + 'wvdappconfig/getappconfig', null, null).success(function (data) {
                            if (data != null) {
                                Utils.appconfigurls = data;

                                //get the accessible web help url
                                if (Utils.appconfigurls.acwebhelpurl1) {
                                    $http.post(Utils.appconfigurls.acwebhelpurl1 + 'Help/checkhelpapiaccess', null, { timeout: 5000 } ).success(function () {
                                        Utils.appconfigurls.WebHelpUrl = Utils.appconfigurls.acwebhelpurl1;
                                        d.resolve(true);
                                    }).error(function (data, status) {
                                        if (Utils.appconfigurls.acwebhelpurl2) {
                                            $http.post(Utils.appconfigurls.acwebhelpurl2 + 'Help/checkhelpapiaccess', null, { timeout: 5000 }).success(function () {
                                                Utils.appconfigurls.WebHelpUrl = Utils.appconfigurls.acwebhelpurl2;
                                                d.resolve(true);
                                            }).error(function (data, status) {
                                                Utils.appconfigurls.WebHelpUrl = WebHelpUrl;
                                                d.resolve(true);
                                            });
                                        }
                                        else {
                                            Utils.appconfigurls.WebHelpUrl = WebHelpUrl;
                                            d.resolve(true);
                                        }
                                    });
                                }
                                else {
                                    if (Utils.appconfigurls.acwebhelpurl2) {
                                        $http.post(Utils.appconfigurls.acwebhelpurl2 + 'Help/checkhelpapiaccess', null, { timeout: 5000 }).success(function () {
                                            Utils.appconfigurls.WebHelpUrl = Utils.appconfigurls.acwebhelpurl2;
                                            d.resolve(true);
                                        }).error(function (data, status) {
                                            Utils.appconfigurls.WebHelpUrl = WebHelpUrl;
                                            d.resolve(true);
                                        });
                                    }
                                    else {
                                        Utils.appconfigurls.WebHelpUrl = WebHelpUrl;
                                        d.resolve(true);
                                    }
                                }
                            }
                            else {
                                Utils.appconfigurls.WebHelpUrl = WebHelpUrl;
                                d.resolve(true);
                            }
                        }).error(function (data, status, headers, config) {
                            this.ShowErrorMessage(data, status);
                            d.reject();
                        });
                    }
                    else {
                        d.resolve(true);
                    }

                    return d.promise;
                }

                return { getappconfigurls: getappconfigurls }

            }]);
 
