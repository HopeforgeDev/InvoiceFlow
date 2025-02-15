angular.module("MainApp").directive("sdnotes", function () {
    return {
        templateUrl: '../Directives/Common/SDNotes/SDNotesbtn.html',
        scope: {
            notesopt: '=notesopt',
            nbrofnotes: '=nbrofnotes'
        },

        link: function (scope, element, attrs, $timeout, $uibModal, $rootScope) {
            scope.$on('$destroy', function () {
                angular.element(element).remove();
            });

            if (attrs.nbrofnotes != undefined) {
                scope.$watch('nbrofnotes', function (newData, oldData) {
                    scope.NbrOfRecords = newData;
                })
            }

        },
        controller: function ($scope, $uibModal, $timeout, $http, WebServiceUrl) {
            var params = {};

            //joe warde Vo#:112208 29/11/2017
            //$timeout(function () {
            //    if ($scope.notesopt.MainData.nbrofnotes != undefined) {
            //        $scope.NbrOfRecords = $scope.notesopt.MainData.nbrofnotes;
            //    }
            //    else {
            //        for (var i = 0; i < $scope.notesopt.maindatakeys.length; i++) {
            //            params[$scope.notesopt.maindatakeys[i]] = $scope.notesopt.MainData[$scope.notesopt.maindatakeys[i]];
            //        }

            //        //if on add then don't get data by joe warde 29/03/2017
            //        if (params[$scope.notesopt.maindatakeys[0]] == 0) {
            //            return;
            //        }
            //        $http.post(WebServiceUrl + $scope.notesopt.fillnotes, params, null).success(function (data) {

            //            if (data.nbrofnotes != 0 && data.nbrofnotes != undefined) {
            //                $scope.NbrOfRecords = data.nbrofnotes;
            //            }
            //            else {
            //                $scope.NbrOfRecords = 0;
            //            }
            //        }).error(function (data, status) {
            //            //Utils.ShowErrorMessage(data, status)
            //        })
            //    }
            //});

            //joe warde Vo#:112208 29/11/2017
            //$scope.notesopt.fnFill().then(function (data) {
            //    $scope.NbrOfRecords = $scope.notesopt.MainData.nbrofnotes;
            //});

            $scope.opensdnotes = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: '../Directives/Common/SDNotes/SDNotes.html',
                    controller: 'SDNotectrl',
                    size: 'lg',
                    resolve: {
                        ngmodel: function () {
                            return {
                                MainData: $scope.notesopt.MainData, MainFields: $scope.notesopt.MainFields,
                                notekeys: ['noteid'], linkkeys: ['fknoteid'],
                                modifynote: $scope.notesopt.modifynote,
                                fillnotes: $scope.notesopt.fillnotes,
                                maindatakeys: $scope.notesopt.maindatakeys,
                                linkwithuser: $scope.notesopt.linkwithuser
                            };
                        }
                    }
                });

                modalInstance.result.then(function (ctrlo) {
                    $scope.NbrOfRecords = ctrlo;
                }, function () {
                });
            }
        }
    }
});

angular.module("MainApp").controller("SDNotectrl", 
    function ($scope, ngmodel, $timeout, $http, $uibModalInstance, WebServiceUrl, $rootScope, uiGridConstants) {
    $scope.rowselected = {};
    $scope.note = '';
    $scope.notehtml = '';
    $scope.noteid = 0;  
    $scope.ctrlopt = ngmodel;
    $scope.textangulardisabled = false;

    //joe warde Vo#:112208 30/11/2017
    $scope.errornote = 0;
    $scope.gridOptions = {};
    $scope.detailNotes = [];

    var params = {};
    var keyparams = {};
    for (var i = 0; i < ngmodel.linkkeys.length; i++) {
        params[ngmodel.notekeys[i]] = ngmodel.MainData[ngmodel.linkkeys[i]];
    }
    for (var i = 0; i < ngmodel.maindatakeys.length; i++) {
        keyparams[ngmodel.maindatakeys[i]] = ngmodel.MainData[ngmodel.maindatakeys[i]];
    }

    $scope.gridOptions = {
        enableRowHeaderSelection: false,
        enableRowSelection: true,
        multiSelect: false,
        noUnselect: true,
        columnDefs: [{ name: ngmodel.MainFields.User, displayName: 'User', width: '20%' },
            { name: ngmodel.MainFields.Note, displayName: 'Note', width: '50%' },
            { name: ngmodel.MainFields.Date, displayName: 'Created On', cellFilter: 'date:"dd/MM/yyyy\"', width: '15%' },
            { name: ngmodel.MainFields.Time, displayName: 'Time', cellFilter: 'date:"HH:mm\"', width: '17%' }]
    };

    $scope.gridOptions.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.gridApi.grid.appScope.lastSelectedRow = row;
            $scope.rowselected = row.entity;
            $scope.rowselected.edittext = $scope.rowselected[ngmodel.MainFields.Note];
        });
    };

    $scope.FillData = function () {
        $http.post(WebServiceUrl + ngmodel.fillnotes, keyparams, null).success(function (data) {
            $scope.FormData = {};
            $scope.FormData.detailNotes = data;
            $scope.detailNotes = data;
            //joe warde Vo#:112208 30/11/2017
            $scope.gridOptions.data = data;

            //$timeout(function () {
            //    if ($scope.gridApi.selection.selectRow) {
            //        $scope.gridApi.selection.selectRow($scope.detailNotes[0]);
            //    }
            //});
        }).error(function (data, status) {
            //Utils.ShowErrorMessage(data, status)
        });
    }

    $timeout(function () {
        $scope.FillData();
    });

    $timeout(function () {
        angular.element("#txtnotes").focus();
    });

    $scope.selectrow = function (ind) {
        var x = $scope.FormData.detailNotes[ind];
        $scope.rowselected = x;
        $scope.rowselected.rownoteindex = ind;
        $scope.errornote = 0;
    }

    $scope.columns = [{ dataField: ngmodel.MainFields.User, caption: 'User', dataType: 'string', width: 70, indx: 0 },
    { dataField: ngmodel.MainFields.Note, caption: 'Note', dataType: 'string', width: 570, indx: 1 },
    { dataField: ngmodel.MainFields.Date, caption: 'Created On', dataType: 'date', format: "dd/MM/yyyy", width: 80, indx: 2 },
    { dataField: ngmodel.MainFields.Date, caption: ' ', dataType: 'date', format: "HH:mm:ss", width: 120, indx: 3 }
    ];

    $timeout(function () {
        if (ngmodel.MainData[ngmodel.linkkeys[0]] == 0) {
            $scope.disableEdit = false 
        } else {
            $scope.disableEdit = false;
        }
    });

    $scope.notesrowclick = function (row) {
        $scope.rowselected = row.data;
        $scope.rowselected.rowstate = 2;
        $scope.noteid = $scope.rowselected[ngmodel.MainFields.NoteID];
        $scope.note = $scope.rowselected[ngmodel.MainFields.Note];
        $scope.notehtml = $scope.rowselected[ngmodel.MainFields.NoteHTML];
        $("#gridnotes").find(".dx-data-row").css("background-color", "transparent");
        $(row.rowElement).css("background-color", "lightgreen");

        if (ngmodel.MainFields.notelock != undefined) {
            if (row.data[ngmodel.MainFields.notelock] == 1) {
                $scope.textangulardisabled = true;
                $scope.disableEdit = true;
            } else {
                $scope.textangulardisabled = false;
                $scope.disableEdit = false;
            }
        }
    }

    $timeout(function () {
        $scope.notesgridConfig = {
            height:'120px', 
            dataSource: $scope.gridNotesCustomSource,
            columns: $scope.columns,
            onRowClick: $scope.notesrowclick
        }
    });

    $scope.modifynote = function () {
        if ($scope.rowselected.edittext == undefined || $scope.rowselected.edittext == null || $scope.rowselected.edittext == "") {
            $scope.errornote = 1;
            return;
        } else {
            $scope.errornote = 0;
        }

        if ($scope.rowselected[ngmodel.MainFields.Seq] == undefined || $scope.rowselected[ngmodel.MainFields.Seq] == null || $scope.rowselected[ngmodel.MainFields.Seq] == 0) {
            var note = {};
            note[ngmodel.MainFields.Note] = $scope.rowselected.edittext;
            note.rowstate = 1;
            //for(prop in keyparams) {
            //    note[prop] = keyparams[prop];
            //}
            if (ngmodel.linkwithuser != undefined && ngmodel.linkwithuser != null) {
                //for(prop in ngmodel.linkwithuser) {
                //    note[ngmodel.linkwithuser.fieldname] = ngmodel.MainData[ngmodel.linkwithuser.value];
                //}
                for (i = 0; i < ngmodel.linkwithuser.length; i++) {
                    note[ngmodel.linkwithuser[i].fieldname] = ngmodel.MainData[ngmodel.linkwithuser[i].value];
                }
                //note[ngmodel.linkwithuser.fieldname] = ngmodel.MainData[ngmodel.linkwithuser.value];
            }

            $scope.detailNotes.push(note);
            $scope.rowselected = {};

            $http.post(WebServiceUrl + ngmodel.modifynote, note, null).success(function (data) {
                $scope.FillData();
            }).error(function (data, status) {
                //Utils.ShowErrorMessage(data, status)
            });
            
        } else {
            $scope.rowselected[ngmodel.MainFields.Note] = $scope.rowselected.edittext;
            $scope.rowselected.rowstate = 2;
            if (ngmodel.linkwithuser != undefined && ngmodel.linkwithuser != null) {
                //$scope.rowselected[ngmodel.linkwithuser.fieldname] = ngmodel.MainData[ngmodel.linkwithuser.value];
                //for (prop in ngmodel.linkwithuser) {
                for (i = 0; i < ngmodel.linkwithuser.length; i ++) {
                    $scope.rowselected[ngmodel.linkwithuser[i].fieldname] = ngmodel.MainData[ngmodel.linkwithuser[i].value];
                }
            }
            $http.post(WebServiceUrl + ngmodel.modifynote, $scope.rowselected, null).success(function (data) {
                $scope.FillData();
                $scope.rowselected = {};
            }).error(function (data, status) {
                //Utils.ShowErrorMessage(data, status)
            });
        }

        //if ($($scope.notehtml).text().trim() == "") {
        //    return;
        //}

        //var data = {};

        //if (Object.keys($scope.rowselected).length == 0 || $scope.rowselected == undefined) {
        //    data.rowstate = 1;
        //    data[ngmodel.MainFields.Seq] = 0;
        //    data[ngmodel.MainFields.Note] = $($scope.notehtml).text().trim();
        //    data[ngmodel.MainFields.NoteHTML] = $scope.notehtml;
        //    data.fkurlid = $rootScope.urlid;
        //} else {
        //    data = $scope.rowselected;
        //    data[ngmodel.MainFields.Note] = $($scope.notehtml).text().trim();
        //    data[ngmodel.MainFields.NoteHTML] = $scope.notehtml;
        //    data.rowstate = 2;
        //}

        //for (var j = 0; j < ngmodel.linkkeys.length; j++) {
        //    data[ngmodel.notekeys[j]] = ngmodel.MainData[ngmodel.linkkeys[j]]
        //}

        //if ($scope.noteid != 0) {
        //    data.noteid = $scope.noteid;
        //    keyparams.fknoteid = $scope.noteid;
        //    params.noteid = $scope.noteid;
        //}

        //$http.post(WebServiceUrl + "note/modifynote", data, null).success(function (data) {
        //    keyparams.fknoteid = data.noteid;
        //    params.noteid = data.noteid;
        //    $scope.noteid = data.noteid;
        //    $http.post(WebServiceUrl + ngmodel.modifynoteid, keyparams, null).success(function (data) {
        //        $scope.Add();
        //        $http.post(WebServiceUrl + "note/getallnotes", params, null).success(function (data) {
        //            $scope.FormData = {};
        //            $scope.FormData.detailNotes = data;

        //            //$scope.gridNotesCustomSource = DataSourceService.GridEditorDataSource($scope, 'FormData', 'detailNotes', [ngmodel.MainFields.Seq]);

        //            angular.element("#gridnotes").dxDataGrid("instance").option("dataSource", $scope.gridNotesCustomSource);

        //            angular.element("#gridnotes").dxDataGrid("instance").refresh();

        //            $scope.ctrlopt.NbrOfRecords = $scope.FormData.detailNotes.length;
        //        }).error(function (data, status) {
        //            //Utils.ShowErrorMessage(data, status)
        //        });
        //    }).error(function (data, status) {
        //        //Utils.ShowErrorMessage(data, status)
        //    });
        //}).error(function (data, status) {
        //    //Utils.ShowErrorMessage(data, status);
        //});


    }

    $scope.Add = function () {
        $scope.note = '';
        $scope.notehtml = '';
        $scope.rowselected = {};
        angular.element("#gridnotes").dxDataGrid("instance").clearSelection();
        $("#gridnotes").find(".dx-data-row").css("background-color", "transparent");
        angular.element("#txtnotes").focus();
    }

    $scope.cancel = function () {
        if (ngmodel.originalgrd != undefined) {
            angular.element("#" + ngmodel.originalgrd).dxDataGrid("instance").refresh();
        } else {
            $scope.ctrlopt.NbrOfRecords = $scope.FormData.detailNotes.length;
            $uibModalInstance.close($scope.ctrlopt.NbrOfRecords);
        }
        $uibModalInstance.dismiss('cancel');
    };
});