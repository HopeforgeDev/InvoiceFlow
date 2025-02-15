angular.module('MainApp').factory('Utils', ['$rootScope', '$timeout','$window', 'WebServiceUrl',
    '$compile', '$http', '$q', "$location", "$uibModal", "$filter",
    function ($rootScope, $timeout, $window, WebServiceUrl, $compile, $http, $q, $location, $uibModal, $filter) {
        //set an abject to store the header filter
        var obj = {};
        var screenParams = {};
        var appconfigurls = {};
        var modalLoader;
        //show error message in a dialog
        //"warning", "error", "success" "info", "input"
        var ShowMessage = function (MsgMessage, MsgType, Keepopen) {
            if (MsgMessage == "Session Time Out") {
                $window.location.replace('../Login/Login.html');
                return;
            }
            var d = $q.defer();
            var type = '';
            if (MsgType != null || MsgType != undefined) {
                switch (MsgType) {
                    case 'Error':
                        var ErrorTitle = "Error";
                        var Errortext = MsgMessage;
                        var ErrorType = "error";
                        var ErrorShowCancel = false;
                        break;
                    case 'Warning':
                        var ErrorTitle = "Warning";
                        var Errortext = MsgMessage;
                        var ErrorType = "warning";
                        var ErrorShowCancel = false;
                        break;
                    case 'Success':
                        var ErrorTitle = "Success";
                        var Errortext = MsgMessage;
                        var ErrorType = "success";
                        var ErrorShowCancel = false;
                        break;
                    case 'Info':
                        var ErrorTitle = "Info";
                        var Errortext = MsgMessage;
                        var ErrorType = "success";
                        var ErrorShowCancel = false;
                        break;
                }
            }

            var val_displaytime = 3000;
            if (Keepopen != undefined) {
                val_displaytime = 9000;
            }

            $("#mainToastMsg").dxToast({
                message: MsgMessage,
                animation: {
                    show: { type: "fade", from: 0, to: 1 },
                    hide: { type: "fade", from: 1, to: 0 }
                },
                closeOnClick: true,
                closeOnOutsideClick: true,
                position: { at: 'top center', my: 'top center', offset: '0 8' },
                type: ErrorType,
                width: '600px',
                displayTime: 50000,
                wrapperAttr: { "style": "{z-index:'99999999'}" }
            });

            $("#mainToastMsg").dxToast("instance").show();

            d.resolve();
            return d.promise;
        };

        var ShowQMessage = function (Message) {
            var d = $q.defer();
            $window.swal({
                title: "Confirm",
                text: Message,
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                showCancelButton: true,
                cancelButtonText: "No",
                closeOnConfirm: true,
                closeOnCancel: true,
                allowOutsideClick: false
            }).then(function (resp) {
                if (resp == true) {
                    d.resolve(true);
                }
            }, function (resp) {
                if (resp == 'dismiss' || resp == 'cancel' || resp == 'esc') {
                    d.reject(false);
                }
            });

            return d.promise;
        }

        var ShowErrorMessage = function (Exception, statusCode) {
            var clientSideError = false;
            var errorDialogStyle = 'errorDialog';
            if (statusCode.toString().indexOf('4') == 0) {
                clientSideError = true;
                errorDialogStyle = '';
            }
            var modalInstance = $uibModal.open({
                templateUrl: '../../../Directives/Common/ErrorMessage/ErrorDialog.html',
                controller: 'ErrorDialog',
                size: 'lg',
                windowClass: errorDialogStyle,
                resolve: {
                    ngmodel: function () {
                        return {
                            MainException: Exception, statusCode: statusCode, clientSideError: clientSideError
                        };
                    }
                }
            });
        }

        var ShowFriendlyErrorMessage = function (StackTrace, ExceptionText, statusCode) {
            var d = $q.defer();

            var errtitle = "Error";


            if (StackTrace.toLowerCase().includes("the delete statement conflicted with the reference constraint")) {
                errtitle = "Failed to Delete"
                ExceptionText = "<span style='font-size:20px;'><b>This record is linked to another transaction. <br/>It cannot be deleted.</b></span>";
            }

            if (StackTrace.toLowerCase().includes("cannot insert duplicate key")) {
                errtitle = "Duplicate Value"
                ExceptionText = "Entered values already exist.";
            }

            $window.swal({
                title: errtitle,
                text: ExceptionText,
                type: "error",
                showCancelButton: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            }, function (isConfirm) {
                d.resolve();
            });

            d.resolve();
            return d.promise;
        }

        var BoolToInteger = function (val) {

            if (val == true || val == "true") {
                return 1;
            }
            else if (val == false || val == "false" || val == "") {
                return 0;
            }
            return val;
        };

        var ShowLoader = function () {
            var d = $q.defer();

            modalLoader = $uibModal.open({
                templateUrl: '../../../Directives/Common/LoadIndicator/Loader.html',
                size: 'md',
                backdrop: 'static',
                windowClass: 'sdloader',
                resolve: {
                    ngmodel: function () {
                        return {

                        };
                    }
                }
            });

            _.defer(function () {
                d.resolve();
            });
            return d.promise;
        }

        var closeLoader = function () {
            if (modalLoader != undefined) {
                modalLoader.close();
            }
        }

        var FormatNbr = function (num, dec) {
            num = Number(num);
            num = num.toFixed(dec);
            //return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            return num
        }

        var FormatNbrCurrency = function (num, dec) {
            num = Number(num);
            num = num.toFixed(dec);
            return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }


        return {
            appconfigurls: appconfigurls,
            ShowMessage: ShowMessage,
            ShowErrorMessage: ShowErrorMessage, 
            screenParams: screenParams, 
            ShowQMessage: ShowQMessage,
            ShowFriendlyErrorMessage: ShowFriendlyErrorMessage,
            BoolToInteger: BoolToInteger,
            ShowLoader: ShowLoader,
            closeLoader: closeLoader,
            FormatNbr: FormatNbr,
            FormatNbrCurrency: FormatNbrCurrency
        }

    }]);