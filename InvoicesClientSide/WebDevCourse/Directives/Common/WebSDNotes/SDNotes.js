angular.module("MainApp").directive("websdnotes", function () {
    return {
        templateUrl: '../../../Directives/Common/WebSDNotes/SDNotesbtn.html',
        scope: {
            notesopt: '=notesopt'
        },

        link: function (scope, element, attrs, $timeout, $uibModal, $rootScope) {
            scope.$on('$destroy', function () {
                angular.element(element).remove();
            });
        },
        controller: function ($scope, $uibModal, $timeout, $http, DataSourceService, Utils, WebServiceUrl) {
            var params = {};

            if ($scope.notesopt.btnclass === undefined) {
                $scope.btnclass = "btn-default btn-icon";
            } else {
                $scope.btnclass = $scope.notesopt.btnclass;
            }

            if ($scope.notesopt.BtnTitle === undefined) {
                $scope.BtnTitle = "";
            } else {
                $scope.BtnTitle = $scope.notesopt.BtnTitle;
            }

            $timeout(function () {
                if ($scope.notesopt.MainData.nbrofnotes != undefined) {
                    $scope.NbrOfRecords = $scope.notesopt.MainData.nbrofnotes;
                }
                else {

                    for (var i = 0; i < $scope.notesopt.maindatakeys.length; i++) {
                        params[$scope.notesopt.maindatakeys[i]] = $scope.notesopt.MainData[$scope.notesopt.maindatakeys[i]];
                    }

                    //console.log('maindata:', $scope.notesopt.MainData);
                    //console.log('params:', params);
                    //if on add then don't get data by joe warde 29/03/2017
                    if (params[$scope.notesopt.maindatakeys[0]] == 0) {
                        return;
                    }

                    if (params.length > 0) {
                        $http.post(WebServiceUrl + $scope.notesopt.fillnotes, params, null).success(function (data) {
                            //console.log('getticket:', data);
                            if (data != null) {
                                if (data[0].nbrofnotes != 0 && data[0].nbrofnotes != undefined) {
                                    $scope.NbrOfRecords = data[0].nbrofnotes;
                                }
                                else {
                                    $scope.NbrOfRecords = 0;
                                }
                            }
                            else $scope.NbrOfRecords = 0;

                        }).error(function (data, status) {
                            Utils.ShowErrorMessage(data, status)
                        });
                    }
                }
            }, 300);


            $scope.opensdnotes = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: '../../../Directives/Common/WebSDNotes/SDNotes.html',
                    controller: 'WebSDNotectrl',
                    size: 'lg',
                    resolve: {
                        ngmodel: function () {
                            return {
                                MainData: $scope.notesopt.MainData, MainFields: $scope.notesopt.MainFields,
                                notekeys: ['noteid'], linkkeys: ['fknoteid'],
                                modifynoteid: $scope.notesopt.modifynoteid,
                                fillnotes: $scope.notesopt.fillnotes,
                                maindatakeys: $scope.notesopt.maindatakeys,
                                url: $scope.notesopt.Url
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
myApp.controller("WebSDNotectrl", function ($scope, ngmodel, $timeout, $http, DataSourceService, $uibModalInstance, Utils, WebServiceUrl, $rootScope) {
    $scope.rowselected = {};
    $scope.note = '';
    $scope.notehtml = '';
    $scope.noteid = 0;  //TS7020635 roulah 5/6/2017
    $scope.ctrlopt = ngmodel;
    $scope.textangulardisabled = false;

    $scope.usercolwidth = '20%';
    $scope.notescolwidth = '75%';
    $scope.datecolwidth = '15%';
    $scope.timecolwidth = '10%';

    if ($(window).width() < 480) {
        $scope.usercolwidth = '20%';
        $scope.notescolwidth = '30%';
        $scope.datecolwidth = '30%';
        $scope.timecolwidth = '20%';
    }

    var params = {};
    var keyparams = {};
    for (var i = 0; i < ngmodel.maindatakeys.length; i++) {
        keyparams[ngmodel.maindatakeys[i]] = ngmodel.MainData[ngmodel.maindatakeys[i]];
    }
    params.noteadduser = ngmodel.MainData['username']; //for outsider only

    for (var i = 0; i < ngmodel.linkkeys.length; i++) {
        params[ngmodel.notekeys[i]] = ngmodel.MainData[ngmodel.linkkeys[i]];
    }

    //Added by Tina VO#112279 - always check the note id from main table
    $http.post(WebServiceUrl + ngmodel.fillnotes, keyparams, null).success(function (data) {
        $scope.noteid = data.fknoteid;
        for (var i = 0; i < ngmodel.linkkeys.length; i++) {
            angular.forEach(data, function (value, key) {
                if (key == ngmodel.linkkeys[i]) {
                    params[ngmodel.notekeys[i]] = value;
                }
            });
        }

        $http.post(WebServiceUrl + "note/outsidergetallnotes", params, null).success(function (data) {
            $scope.FormData = {};
            $scope.FormData.detailNotes = data;
            $scope.gridNotesCustomSource = DataSourceService.GridEditorDataSource($scope, 'FormData', 'detailNotes', [ngmodel.MainFields.Seq]);

            angular.element("#gridnotes").dxDataGrid("instance").option("dataSource", $scope.gridNotesCustomSource);

            angular.element("#gridnotes").dxDataGrid("instance").refresh();
        }).error(function (data, status) {
            Utils.ShowErrorMessage(data, status)
        });

    }).error(function (data, status) {
        Utils.ShowErrorMessage(data, status)
    });


    $timeout(function () {
        angular.element("#txtnotes").focus();
    });

    $scope.columns = [{ dataField: ngmodel.MainFields.User, caption: 'User', dataType: 'string', width: $scope.usercolwidth },
    { dataField: ngmodel.MainFields.Note, caption: 'Note', dataType: 'string', width: $scope.notescolwidth },
    { dataField: ngmodel.MainFields.NoteHTML, caption: 'NoteHTML', dataType: 'string', width: 590, visible: false },
    { dataField: ngmodel.MainFields.Date, name: 'notedate', caption: 'Created On', dataType: 'date', format: "dd/MM/yyyy", width: $scope.datecolwidth },
    { dataField: ngmodel.MainFields.Date, name: 'notetime', caption: ' ', dataType: 'date', format: "HH:mm:ss", width: $scope.timecolwidth },
    { dataField: ngmodel.MainFields.Seq, visible: false },
    { dataField: ngmodel.MainFields.notelock, visible: false }
    ];

    $timeout(function () {
        if (ngmodel.MainData[ngmodel.linkkeys[0]] == 0) {
            $scope.disableEdit = false //true;
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
                //angular.element("#txtnotes").option("disabled", true);

            } else {
                $scope.textangulardisabled = false;
                $scope.disableEdit = false;
                //angular.element("#txtnotes").option("disabled", false);
            }
        }
    }

    $timeout(function () {
        $scope.notesgridConfig = {
            //joe warde 10/07/2017
            height: '200px',
            dataSource: $scope.gridNotesCustomSource,
            columns: $scope.columns,
            onRowClick: $scope.notesrowclick
        }
    });


    $scope.modifynote = function () {
        if ($($scope.notehtml).text().trim() == "") {
            return;
        }

        //var result = DevExpress.validationEngine.validateGroup($("#NotesValidationGroup").dxValidationGroup("instance"))
        //if (!result.isValid) {
        //    angular.element("#txtnotes").dxTextArea("instance").focus();
        //    return;
        //}

        var data = {};
        if (ngmodel.url)
            data.noteurl = ngmodel.url;

        $scope.disableEdit = true;

        // $http.post(WebServiceUrl + "urls/outsidergeturlid", data, null).success(function (res) {

        if (Object.keys($scope.rowselected).length == 0 || $scope.rowselected == undefined) {
            data.rowstate = 1;
            data[ngmodel.MainFields.Seq] = 0;
            data[ngmodel.MainFields.Note] = $($scope.notehtml).text().trim();
            data[ngmodel.MainFields.NoteHTML] = $scope.notehtml;
            // data.fkurlid = res[0].urlid;
        } else {
            data = $scope.rowselected;
            data[ngmodel.MainFields.Note] = $($scope.notehtml).text().trim();
            data[ngmodel.MainFields.NoteHTML] = $scope.notehtml;
            data.rowstate = 2;
        }

        for (var j = 0; j < ngmodel.linkkeys.length; j++) {
            data[ngmodel.notekeys[j]] = ngmodel.MainData[ngmodel.linkkeys[j]]
        }

        if ($scope.noteid != undefined && $scope.noteid != 0) {
            data.noteid = $scope.noteid;
            keyparams.fknoteid = $scope.noteid;
            params.noteid = $scope.noteid;
        }

        data.noteadduser = ngmodel.MainData['username']; //$rootScope.globals.currentUser.username; //for outsider only

        $http.post(WebServiceUrl + "note/outsidermodnote", data, null).success(function (data) {
            $scope.disableEdit = false;

            keyparams.fknoteid = data[0].noteid;
            params.noteid = data[0].noteid;
            $scope.noteid = data[0].noteid;

            //keyparams.fkcmpseq = $rootScope.globals.currentUser.fkcmpseq;

            $http.post(WebServiceUrl + ngmodel.modifynoteid, keyparams, null).success(function (data) {
                $scope.Add();
                $http.post(WebServiceUrl + "note/outsidergetallnotes", params, null).success(function (data) {
                    $scope.FormData = {};
                    $scope.FormData.detailNotes = data;

                    $scope.gridNotesCustomSource = DataSourceService.GridEditorDataSource($scope, 'FormData', 'detailNotes', [ngmodel.MainFields.Seq]);

                    angular.element("#gridnotes").dxDataGrid("instance").option("dataSource", $scope.gridNotesCustomSource);

                    angular.element("#gridnotes").dxDataGrid("instance").refresh();

                    $scope.ctrlopt.NbrOfRecords = $scope.FormData.detailNotes.length;
                }).error(function (data, status) {
                    Utils.ShowErrorMessage(data, status)
                });
            }).error(function (data, status) {
                Utils.ShowErrorMessage(data, status)
            });
        }).error(function (data, status) {
            Utils.ShowErrorMessage(data, status);
        });
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