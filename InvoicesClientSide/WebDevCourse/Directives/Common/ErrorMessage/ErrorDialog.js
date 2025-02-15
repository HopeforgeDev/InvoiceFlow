myApp.controller("ErrorDialog", function ($scope, ngmodel, $timeout, $http, DataSourceService, $uibModalInstance, Utils, WebServiceUrl) {

    $scope.ShowStackTrace = false;
    $scope.statuscode = ngmodel.statusCode;
    $timeout(function () {
        if (!ngmodel.clientSideError) {
            if (ngmodel.MainException.ExceptionMessage != undefined) {
                $scope.errormsg = ngmodel.MainException.ExceptionMessage;
                $scope.stack = ngmodel.MainException.StackTrace;
            } else {
                $scope.errormsg = ngmodel.MainException.Message;
            }
            
        } else {
            $(".errorMessage").append(ngmodel.MainException);
            $scope.stack = "Error Occured on Client Side"
        }
        $timeout(function () {
            $("#details-left").remove();
            $("#details-right").css("width", "auto");
        });
    });
    
    $scope.btnOk = function () {
        $uibModalInstance.dismiss('cancel');
    }
    
    $scope.ShowStack = function () {
        $scope.ShowStackTrace = !$scope.ShowStackTrace;
    }
});