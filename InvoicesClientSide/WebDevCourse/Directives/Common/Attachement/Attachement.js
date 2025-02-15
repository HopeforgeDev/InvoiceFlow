// Modified by Bien 05/25/2017 V0#111653
myApp.directive("attachement", function () {
    return {
        templateUrl: '../../../Directives/Common/Attachement/Attachement.html',
        scope: {
            attachopt: '=attachopt',
            nbrofrecords: '=nbrofrecords'
        },
        link: function (scope, element, attrs, $timeout, $uibModal) {
            scope.$on('$destroy', function () {
                angular.element(element).remove();
            });

            if (attrs.nbrofrecords != undefined) {
                scope.$watch('nbrofrecords', function (newData, oldData) {
                    scope.NbrOfRecords = newData;
                })
            }
        },

        controller: function ($scope, $uibModal, $timeout, $http, DataSourceService, Utils, WebServiceUrl, $rootScope, WebServiceHostAttachment) {

            $rootScope.UploadedFiles = [];

            //TW#15736 Chazel 02/07/2018 
            if ($scope.attachopt.nocmpseq === undefined || $scope.attachopt.nocmpseq != 1) {
                $scope.attachopt.nocmpseq = 0;
            }

            if ($scope.attachopt.vbModule === undefined) {
                $scope.attachopt.vbModule = null;
            }


            $scope.outsidercmpseq = $scope.attachopt.fkcmpseq;
            $scope.outsiderdatabase = $scope.attachopt.database;

            var gpattachmentphysicalpath = '', gpattachmentweburl = '', gpattachmentfolder = '';
            //get attachment physical path from db
            $http.post(WebServiceUrl + 'attachement/outsidergetattachmentsadmparams', { fkcmpseq: $scope.outsidercmpseq, outsiderdatabase:  $scope.outsiderdatabase  }, null).success(function (data) {
                if (data != null && data[0] && data[0].gpattachmentphysicalpath) {
                    gpattachmentphysicalpath = data[0].gpattachmentphysicalpath.replace(/\\/g, "/");
                    gpattachmentweburl = data[0].gpattachmentweburl;
                    gpattachmentfolder = data[0].gpattachmentfolder;
                }
            });

            $scope.attach = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: '../../../Directives/Common/Attachement/AttachFile.html',
                    controller: 'attachctrl',
                    size: 'lg',
                    resolve: {
                        ngmodel: function () {
                            return {
                                MnuCtrlname: $scope.attachopt.MnuCtrlname, KeyId: $scope.attachopt.keyId, objnocmpseq: $scope.attachopt.nocmpseq, outsidercmpseq: $scope.outsidercmpseq, vbmodule: $scope.attachopt.vbModule,
                                gpattachmentphysicalpath: gpattachmentphysicalpath,  gpattachmentweburl: gpattachmentweburl, gpattachmentfolder: gpattachmentfolder, database: $scope.outsiderdatabase
                            };
                        }
                    }
                });

                modalInstance.result.then(function (ctrlo) {
                    $scope.NbrOfRecords = ctrlo;

                    $rootScope.NbrOfRecords = ctrlo;
                }, function () {
                });

            }
        }
    }
});

myApp.controller("attachctrl", function ($scope, ngmodel, $timeout, $http, DataSourceService, $uibModalInstance, Utils, WebServiceUrl, $rootScope, $q, WebServiceHostAttachment, $filter) {

    $scope.MnuCtrlname = ngmodel.MnuCtrlname;
    $scope.UploadPageHost = window.location.protocol + "//" + WebServiceHostAttachment;
    $scope.PhysicalPath = ngmodel.gpattachmentphysicalpath;
    $scope.gpattachmentweburl = ngmodel.gpattachmentweburl;
    $scope.gpattachmentfolder = ngmodel.gpattachmentfolder;
    $scope.database = ngmodel.database;
    $scope.Attachements = [];
    $rootScope.UploadedFiles = [];
    $scope.hideDelete = function (e) {
        var result = false;
        if (e == '' || e == undefined) {
            result = true;
        }
        return result;
    }

    $scope.uploadcustomdata = {
        objlogicalname: ngmodel.MnuCtrlname,
        objmodule: 0,
        objobjectcode: ngmodel.KeyId,
        objnocmpseq: ngmodel.objnocmpseq == undefined ? 0 : ngmodel.objnocmpseq,
        fkcmpseq: ngmodel.outsidercmpseq,
        objvbmodule: 0,
        outsiderdatabase: $scope.database
    }

    $scope.setuploadurl = function () {
        if ($scope.PhysicalPath) {
            $scope.uploadurl = WebServiceUrl + 'attachement/uploadattachmentapi?Path=' + $scope.PhysicalPath + "/" + $scope.MnuCtrlname + '&fromoutsider=true';
        }
        else {
            $scope.uploadurl = $scope.UploadPageHost + '/UploadPage.aspx?Mnu=' + $scope.MnuCtrlname + '&Path=' + $scope.PhysicalPath;
        }
    }

    $scope.setuploadurl();

    $scope.grdConfig = {
        filterRow: { visible: true },
        showBorders: true,
        rowAlternationEnabled: true,
        columns: [{
            dataField: 'objfilename', caption: 'File Name', width: 350,
            cellTemplate: function (container, options) {
                //$("<a class='btn-link' href='" + options.data['objfilepath'] + "' target='_blank'>" + options.data['objfilename'] + "</a>").appendTo(container);
                var filepath = '';
                var foldername = "UploadedFiles/"; //default folder name if gpattachmentphysicalpath is not defined
                //get the folder name from the physical path saved in db

                //if ($scope.PhysicalPath != "" && $scope.PhysicalPath != null) {
                //    var strpath = $scope.PhysicalPath.split('/');
                //    foldername = strpath[strpath.length - 2];
                //}

                //get the web url 
                var weburl = options.data.gpattachmentweburl;
                if (!weburl) {
                    weburl = $scope.UploadPageHost + "/" + foldername; //default web url
                }
                if (options.data.objcloudfile == 1) {
                    filepath = options.data['objfilepath'];
                }
                else {
                    filepath = weburl + options.data['objfilepath'];
                }

                $('<a class="btn-link" href="' + filepath + '" target="_blank">' + options.data['objfilename'] + "</a>").appendTo(container);
            }
        },
            { dataField: 'objdescription', caption: 'Description' },
            //{ dataField: 'objtagidnames', caption: 'Tags', width: 250 },
            {
                //visible: $scope.hideDelete(ngmodel.KeyId),
                caption: '',
                width: 100,
                alignment: 'center',
                cellTemplate: function (container, options) {
                    //if (ngmodel.KeyId == '' || ngmodel.KeyId == undefined){
                    var paramdata = options.data;
                    $("<div />").dxButton({
                        icon: 'glyphicon glyphicon-remove',
                        hint: 'Delete File',
                        fontsize: '14px',
                        onClick: function (data) {
                            $scope.DeleteFile(paramdata);
                        }
                    }).appendTo(container);
                    //}
                }
            }
        ]
    };

    $scope.init = function () {
        if (ngmodel.KeyId > 0 && ngmodel.KeyId != undefined) {
            $scope.getattachments();
        } 
    }

    $scope.getattachments = function () {
        $http.post(WebServiceUrl + "cvapp/outsiderattachmentcvapplication", {
            objlogicalname: ngmodel.MnuCtrlname, objmodule: $scope.fkmodid, objobjectcode: ngmodel.KeyId, objnocmpseq: ngmodel.objnocmpseq, fkcmpseq: ngmodel.outsidercmpseq, outsiderdatabase: $scope.database
        }, null)
        .success(function (data) {

            $rootScope.UploadedFiles = data;
            $rootScope.NbrOfRecords = $rootScope.UploadedFiles.length;

            angular.element("#grdAttach").dxDataGrid("instance").option("dataSource", $rootScope.UploadedFiles);

        })
        .error(function (data) {
        });
    }

    $scope.cancel = function () {

        $uibModalInstance.close($rootScope.UploadedFiles.length);

        $uibModalInstance.dismiss('cancel');
    };

    $scope.searchFilename = function (nameKey, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].objfilename === nameKey) {
                return myArray[i];
            }
        }
    }

    //$scope.getTagsDesc = function () {
    //    var tagsValueId = angular.element("#tags").dxTagBox("instance").option("value");
    //    var tagsData = angular.element("#tags").dxTagBox("instance").option("dataSource");
    //    var tagsDesc = "";

    //    for (var x = 0; x < tagsValueId.length ; x++) {

    //        var tagDescFilter = $filter('filter')(tagsData, { tagid: tagsValueId[x] });
    //        if (tagsDesc != "") {
    //            tagsDesc += ', '
    //        }
    //        tagsDesc += tagDescFilter[0].tgdesc;

    //    }
    //    return tagsDesc;
    //}

    $scope.noOfRecords = function () {

        if ($rootScope.UploadedFiles !== undefined || $rootScope.UploadedFiles.length > 0) {
            $scope.NbrOfRecords = $rootScope.NbrOfRecords = $rootScope.UploadedFiles.length;
        } else {
            $scope.NbrOfRecords = $rootScope.NbrOfRecords = 0;
        }
    }

    $scope.uploaded = function (e) {
        $scope.Description = "";
        $("#attachFile").dxFileUploader("instance").reset();
        $scope.getattachments();
    }

    $scope.DeleteFile = function (Params) {
        var path = "";

        if ($scope.PhysicalPath) {
            path = WebServiceUrl + 'attachement/uploadattachmentapi?objid= ' + Params.objid + '&fileName=' + Params.objfilename + "&delete=1&Path=" + $scope.PhysicalPath + "/" + $scope.MnuCtrlname + '&fromoutsider=true&outsiderdatabase='+ $scope.database;
        }
        else {
            path = $scope.UploadPageHost + '/UploadPage.aspx?Mnu=' + $scope.MnuCtrlname + '&Path=' + $scope.PhysicalPath;
        }

        $http.post(path, null, null).success(function () {
            $scope.getattachments();
        }).error(function (data) {
        });
    }

     $scope.UploadStarted = function (e) {
        //if attach param is not defined 
         if (!$scope.PhysicalPath || !$scope.gpattachmentweburl || !$scope.gpattachmentfolder) {
             e.request.abort();
             e.component.reset();
             $("#uploaderrordiv").html("<span style='color:red;'>Upload failed. Attachment folders are not defined.</span>");
         }
    }

    $scope.changedDescription = function (e) {
        $scope.uploadcustomdata.objfiledescription = e.value;
        $("#attachFile").dxFileUploader("instance").option("uploadCustomData", $scope.uploadcustomdata);
    }
});