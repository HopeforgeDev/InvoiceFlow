var myApp = angular.module('MainApp', ['dx', 'myApp.config', 'readMore', 'ngRoute', 'angular.filter', 'ui.bootstrap', 'ui.grid',
    'ui.grid.selection', 'ui.grid.autoFitColumns', 'ui.grid.resizeColumns', 'ngCookies', 'ngNotificationsBar', 'textAngular']);

myApp.config(['$routeProvider', '$httpProvider', '$compileProvider', '$locationProvider','WebServiceUrl',
function ($routeProvider, $httpProvider, $compileProvider, $locationProvider, WebServiceUrl) {

    $routeProvider
        .when('/Report/:database/:strwherecond/:fkcmpseq',
            {
                templateUrl: 'Report/Report.html',
                controller: 'reportcontroller'
            })
        .when('/MainFormIntro/:id',
            {
                templateUrl: 'Intro/MainFormIntro.html',
                controller: 'mainformintrocontroller'
            })

            //Client Invoice
        .when('/Invoiceheader',
            {
                templateUrl: 'Client Invoices/IHeaderClient.html',
                controller: 'clientinvoiceheadercontroller'
            })
        .when('/InvoiceDetails/:seq',
            {
                templateUrl: 'Client Invoices/IDetailClient.html',
                controller: 'clientinvoicedetailscontroller'
            })
        .when('/InsertInvoiceHeader',
            {
                templateUrl: 'Client Invoices/AddInvoiceModal.html',
                controller: 'insertclientinvoiceheadercontroller'
            })
        .when('/InsertInvoiceDetails',
            {
                templateUrl: 'Client Invoices/AddDetailModal.html',
                controller: 'insertclientinvoicedetailscontroller'
            })
        .when('/UpdateClient',
            {
                templateUrl: 'Client Invoices/UpdateClient.html',
                controller: 'updateclientinvoiceheadercontroller'
            })

        .otherwise({ templateUrl: 'Invalid.html' });

    
}]).run(function ($rootScope, $http, $timeout, $location, WebServiceUrl, $routeParams, $window) {
    

});

myApp.controller('MainController', function ($scope, $window, $http, WebServiceUrl, $location, $routeParams) {
    $scope.init = function () {
        $scope.FormData = {};
    }
});

angular.element(document).ready(function () {
    angular.bootstrap(document.getElementById('page-top'), ['MainApp']);
});



