angular.module('MainApp')
    .controller('reportcontroller',
        ['$scope', '$http', 'WebServiceUrl', '$location', '$routeParams', '$window', '$q', '$timeout', 'LoginService', 'Utils',
            function ($scope, $http, WebServiceUrl, $location, $routeParams, $window, $q, $timeout, LoginService, Utils) {

                $scope.init = function () {
                    $scope.FormData = {};
                    $scope.FormData.salesdata = {};
                    $scope.FormData.database = atob($routeParams.database);
                    $scope.FormData.strwherecond = atob($routeParams.strwherecond);
                    $scope.FormData.fkcmpseq = atob($routeParams.fkcmpseq);


                    $scope.getaluminumsalesreport = function () {
                        var d = $q.defer();
                        $http.post(WebServiceUrl + 'alureport/getaluminumsalesreport', $scope.FormData, null).success(function (res) {
                            $scope.FormData.salesdata = res;
                            d.resolve(true);
                        })
                        return d.promise;
                    }

                    $q.all($scope.getaluminumsalesreport()).then(function () {
                        $scope.gridConfig = {
                            bindingOptions: { dataSource: 'FormData.salesdata' },
                            columns: [
                                {
                                    dataField: 'service', caption: 'Service Type', dataType: 'string'
                                },
                                {
                                    dataField: 'estimatedweight', caption: 'Est. Weight', dataType: 'number', cellTemplate: function (container, options) {
                                        $("<div>" + Utils.FormatNbrCurrency(options.data.estimatedweight, 0) + "</div>").appendTo(container);
                                    }
                                },
                                {
                                    dataField: 'actualweight', caption: 'Act. Weight', dataType: 'number', cellTemplate: function (container, options) {
                                        $("<div>" + Utils.FormatNbrCurrency(options.data.actualweight, 0) + "</div>").appendTo(container);
                                    }
                                },
                                {
                                    dataField: 'invamount', caption: 'Inv. Amount', dataType: 'number', cellTemplate: function (container, options) {
                                        $("<div>" + Utils.FormatNbrCurrency(options.data.invamount, 0) + "</div>").appendTo(container);
                                    }
                                },
                                {
                                    dataField: 'netamount', caption: 'Net Amount', dataType: 'number', cellTemplate: function (container, options) {
                                        $("<div>" + Utils.FormatNbrCurrency(options.data.netamount, 0) + "</div>").appendTo(container);
                                    }
                                },
                            ]
                        };
                    })

                }
            }])
