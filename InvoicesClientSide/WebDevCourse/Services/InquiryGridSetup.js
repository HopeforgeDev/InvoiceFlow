angular.module('MainApp').factory('InquiryGridSetup', ['$timeout', 'Utils', '$q', '$compile', '$window', 'FormManagement',
    function ($timeout, Utils, $q, $compile, $window, FormManagement) {
        var SetUpGridButtons = function (DeleteFunction, GridName, ScreenKeys, ScreenHref, BeforeDelete, colScreens) {
            var grd = angular.element("#" + GridName).dxDataGrid("instance");
            this.grdName = GridName;
            angular.element("#" + GridName).dxDataGrid("instance").deleteColumn("colAction");
            if (FormManagement.FormProperties.inquiryToolbar.enableEdit == undefined || FormManagement.FormProperties.inquiryToolbar.enableEdit == true) {
                if (grd.columnOption("colAction") == undefined) {
                    angular.element("#" + GridName).dxDataGrid("instance").deleteColumn("colAction");
                    var Col = {};
                    Col.caption = "";
                    Col.visibleIndex = 0;
                    Col.width = "45"
                    Col.name = "colAction"
                    Col.cssClass = "grdBtnContainer";
                    Col.allowHiding = false;
                    Col.allowFiltering = false;
                    Col.allowReordering = false;
                    Col.fixed = true;
                    Col.cellTemplate = function (container, options) {
                        var params = '';
                        for (var i = 0; i < ScreenKeys.length; i++) {
                            if (options.data[ScreenKeys[i]] != undefined) {
                                params += '/' + options.data[ScreenKeys[i]]
                            }
                        }
                        $("<div />").dxButton({
                            icon: 'edit',
                            hint: 'Edit Current Record',
                            fontsize: '15px',
                            elementAttr: { "class": 'btn-sm btn-flat nopadding' },
                            onClick: function () {
                                if (FormManagement.FormProperties.inquiryToolbar.fnbeforeedit == undefined) {
                                    $window.location.href = "#/" + FormManagement.FormProperties.inquiryToolbar.screenhref + params.toString();
                                } else {
                                    FormManagement.FormProperties.inquiryToolbar.fnbeforeedit(options.data).then(function (data) {
                                        if (data) {
                                            $timeout(function () {
                                                $window.location.href = "#/" + FormManagement.FormProperties.inquiryToolbar.screenhref + params.toString();
                                            });

                                        }
                                    });
                                }

                            }
                        }).appendTo(container);
                    };
                    Col.showInColumnChooser = false;

                    angular.element("#" + GridName).dxDataGrid("instance").addColumn(Col);
                }
            }



            //    $("<a />").dxButton({
            //        icon: 'remove',
            //        hint: 'Delete Current Recod',
            //        height: '20px',
            //        fontsize: '14px',
            //        onClick: function (e) {
            //            var delparams = {};
            //            for (var i = 0; i < ScreenKeys.length; i++) {
            //                delparams[ScreenKeys[i]] = options.data[ScreenKeys[i]];
            //            }
            //            delparams.rowstate = 2;

            //            if (BeforeDelete != undefined) {
            //                BeforeDelete(options.data).then(function (data) {
            //                    if (data) {
            //                        Utils.ShowQMessage("Are You Sure You Want To Delete?").then(function (data) {
            //                            if (data) {
            //                                DeleteFunction(delparams);
            //                            } else {
            //                                return;
            //                            }
            //                        });
            //                    }
            //                }, function (data) {
            //                    Utils.ShowMessage(data, 'Error');
            //                })
            //            } else {
            //                Utils.ShowQMessage("Are You Sure You Want To Delete?").then(function (data) {
            //                    if (data) {
            //                        DeleteFunction(delparams);
            //                    } else {
            //                        return;
            //                    }
            //                });
            //            }
            //        }
            //    }).   (container);
            //};



            //if colScreens is not filled don't continue
            if (colScreens == null || colScreens == undefined) { return; }
            for (var i = 0; i < colScreens.length; i++) {

                var cellTemplate = function (container, options) {
                    for (var k = 0; k < colScreens.length; k++) {
                        if (colScreens[k].dataField == options.column.dataField) {
                            var mainIndex = k;
                            break;
                        }
                    }
                    var params = '';
                    for (var j = 0; j < colScreens[mainIndex].keys.length; j++) {
                        params += '/' + options.data[colScreens[mainIndex].keys[j]];
                    }
                    if (options.data[colScreens[mainIndex].dataField] != null && options.data[colScreens[mainIndex].dataField] != '') {
                        $("<a class='InqGrd'; ' href='#/" + colScreens[mainIndex].screenhref + params.toString() + "'>" + options.data[colScreens[mainIndex].dataField] + "</a>").appendTo(container);
                    }
                }
                angular.element("#" + GridName).dxDataGrid("instance").columnOption(colScreens[i].dataField, 'cellTemplate', cellTemplate);
            }

            //var grd = angular.element("#" + GridName).dxDataGrid("instance");
            //grd.on("cellClick", function (e) {
            //    var d = e.columnIndex;
            //    alert('test');
            //});
        }

        // Here we set the standard inquiry grid options to be used in all inquiries
        // gridconfiguration is the $scope object that sets the grid configuration (dx-data-grid in html) 
        // colSearchVisible is a boolean that shows or hides the columns search 
        var SetInquiryStdOptions = function (gridconfiguration, colSearchVisible, scrollvirtual, pageSize,
            showColumnFilter, showColumnChooser, showColumnLines) {
            gridconfiguration.paging = {};

            //joe warde Vo#:112825 11/05/2018
            //gridconfiguration.paging.pageSize = 10;
            gridconfiguration.paging.pageSize = ((pageSize == null || pageSize == undefined || pageSize == 0) ? 10 : pageSize);

            gridconfiguration.allowColumnResizing = true;
            //                gridconfiguration.showRowLines = true;

            //joe warde Vo#:112841 25/05/2018
            //gridconfiguration.showColumnLines = true;
            gridconfiguration.showColumnLines = ((showColumnLines == null || showColumnLines == undefined) ? true : showColumnLines);

            gridconfiguration.showBorders = false;
            gridconfiguration.showRowLines = false;
            //if main screen hide pager and apply virtual mode scrolling
            if (scrollvirtual == false || scrollvirtual == undefined || scrollvirtual == null) {
                gridconfiguration.pager = {};
                gridconfiguration.pager.visible = true;
                gridconfiguration.pager.showNavigationButtons = true;
                gridconfiguration.pager.showInfo = true;
                gridconfiguration.pager.infoText = 'Total Pages : {1}'

                //in main screen inquiry we need not the pagin at the bottom of the grid so we send it false
                gridconfiguration.scrolling = {};
                gridconfiguration.scrolling.mode = 'standard';// : 'virtual');

            } else {
                gridconfiguration.pager = {};
                gridconfiguration.pager.visible = false;
                gridconfiguration.scrolling = {};
                gridconfiguration.scrolling.mode = 'virtual';
            }
            //gridconfiguration.pager = {};
            //gridconfiguration.pager.visible = true;
            //gridconfiguration.pager.showNavigationButtons = true;
            //gridconfiguration.pager.showInfo = true;
            //gridconfiguration.pager.infoText = 'Total Pages : {1}'
            //gridconfiguration.scrolling = {};
            //gridconfiguration.scrolling.mode = "virtual";
            gridconfiguration.searchPanel = {};
            gridconfiguration.searchPanel.visible = colSearchVisible;
            //gridconfiguration.searchPanel.width = 550;
            ////gridconfiguration.selection = {};
            ////gridconfiguration.selection.mode = "single";
            gridconfiguration.filterRow = {};

            //joe warde Vo#:112825 11/05/2018
            //gridconfiguration.filterRow.visible = colSearchVisible;
            gridconfiguration.filterRow.visible = ((showColumnFilter == null || showColumnFilter == undefined) ? colSearchVisible : showColumnFilter);

            gridconfiguration.allowColumnReordering = true;
            gridconfiguration.columnFixing = {};
            gridconfiguration.columnFixing.enabled = true;

            gridconfiguration.columnChooser = {};
            //joe warde Vo#:112825 11/05/2018
            //gridconfiguration.columnChooser.enabled = colSearchVisible;
            gridconfiguration.columnChooser.enabled = ((showColumnChooser == null || showColumnChooser == undefined) ? colSearchVisible : showColumnChooser);
            gridconfiguration.columnChooser.mode = "select"

            gridconfiguration.sorting = {};
            gridconfiguration.sorting.mode = "multiple";

            gridconfiguration.remoteOperations = {};
            gridconfiguration.remoteOperations.filtering = true;
            gridconfiguration.remoteOperations.sorting = true;
            gridconfiguration.remoteOperations.paging = true;

            //properties related to saving the grid state
            //gridconfiguration.stateStoring = {};
            //gridconfiguration.stateStoring.enabled = true;
            //gridconfiguration.storageKey = grdName;
            //gridconfiguration.stateStoring.type = 'sessionStorage';

            gridconfiguration.elementAttr = { "class": 'inquiryGrids' }

            //gridconfiguration.stateStoring.customLoad = loadGridState;
            //gridconfiguration.stateStoring.customSave = saveGridState;
        }

        //var grdState = {};
        //savefirst = false;
        //var loadGridState = function (gridState) {
        //    if (savefirst ) {
        //        $("#" + FormManagement.FormProperties.inquiryToolbar.grd).dxDataGrid("instance").state(grdState);
        //    }
        //}

        //var saveGridState = function (gridState) {
        //    savefirst = true;
        //    grdState = $("#" + FormManagement.FormProperties.inquiryToolbar.grd).dxDataGrid("instance").state();
        //    //loadGridState();
        //}

        var grdName;
        var SetUpPager = function (scope, grd, totalCount) {
            //scope.ChangePage = this.PagerChange;
            //grdName = grd.toString();
            //var Pager = "<uib-pagination   ng-change='ChangePage(bigCurrentPage)' next-text='>' previous-text='<' total-items='" + totalCount + "' ng-model='bigCurrentPage' max-size='5' class='pagination-sm grdPager' boundary-link-numbers='true' rotate='false'></uib-pagination>"
            //$(".grdPager").remove();
            //$(".dx-toolbar-after").append($compile(Pager)(scope));
            //////$(".dx-datagrid-search-panel").addClass("col-md-8");
            //$timeout(function () {
            //    $(".dx-datagrid-pager").appendTo(".dx-toolbar-after");
            //});

            //// $(".dx-pages").remove();dx-datagrid-pager
            //$(".dx-datagrid-pager").append($compile(Pager)(scope));
        }

        var PagerChange = function (page) {
            //$("#" + grdName).dxDataGrid("instance").pageIndex(page-1)
        }
        return { SetUpGridButtons: SetUpGridButtons, SetInquiryStdOptions: SetInquiryStdOptions, SetUpPager: SetUpPager, PagerChange: PagerChange }
    }]);