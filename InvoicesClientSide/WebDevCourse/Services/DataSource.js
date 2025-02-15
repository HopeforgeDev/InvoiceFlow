angular.module('MainApp').factory('DataSourceService', ['$timeout', '$http', 'WebServiceUrl', '$q',  '$compile', '$location', "$window",
    function ($timeout, $http, WebServiceUrl, $q, $compile, $location, $window) {

        // Prepare the filtering, sorting, and records to show of a grid datasource
        var SetInquriyDataSource = function (WebServiceUrl, loadOptions, specificCond, parameters, MainTable,  Fields) {
            var d = new $q.defer();

            if (loadOptions == undefined) {
                filterOptions = ''
            } else {
                var filterOptions = ApplyInquiryFilterParams(loadOptions);
            }
            if (specificCond != null && specificCond != undefined && specificCond != '') {
                if (filterOptions == '') {
                    filterOptions += ' where (' + specificCond + ')';
                } else {
                    filterOptions += ' and (' + specificCond + ')';
                }
            }

            if (loadOptions != undefined) {
                 
                if (loadOptions.take == undefined) { loadOptions.take = 0; };
                if (loadOptions.skip == undefined) { loadOptions.skip = 0; };

            } else {
                loadOptions = {};
                loadOptions.take = 10;
                loadOptions.skip = 0;
            }
            var take = loadOptions.take + loadOptions.skip;
            var skip = loadOptions.skip;

            if (loadOptions.isLoadingAll != undefined) {
                if (loadOptions.isLoadingAll == true) {
                     take = 0;
                     skip = 0;
                }
            }

            var sortcolumn = "";
            if (loadOptions != undefined) { 
                if (loadOptions.sort != undefined) {
                    sortcolumn = loadOptions.sort[0].selector;
                    if (loadOptions.sort[0].desc) {
                        sortcolumn += " desc "
                    }
                }
            }

            var params = [];
            if (parameters != null && parameters != 'undefined') {
                params = $.param(parameters);
            }

            $http.post(WebServiceUrl, {
                filter: filterOptions,
                take: take,
                skip: skip,
                sort: sortcolumn,
                parameters: parameters
            }, null)
                .success(function (data) {
                    if (MainTable != undefined) {
                        //var htmlStr = '';
                        ////for (var i = 0; i < data[SummaryTable].length; i++) {
                        //    for (var j = 0; j < Fields.length; j++) {
                        //        if (j == 0) {
                        //            htmlStr += "<span>" + data[0][i][Fields[j]] + " : ";
                        //        } else {
                        //            htmlStr += data[0][i][Fields[j]] + "</span>"
                        //        }
                        //    }
                        //    $(".inqStats").html(htmlStr);
                        ////}
                      
                        //$(".inqStats").html(htmlStr);
                        d.resolve(data);
                    } else {
                        d.resolve(data);
                    }
                })
                .error(function (data) {
                    //Utils.ShowMessage(data.ExceptionMessage, 'Error');
                });

            return d.promise;
        }

        var ApplyInquiryFilterParams = function (loadOptions) {
                if (loadOptions.filter != null) {
                var wherecondition = " Where (";

                var filter = loadOptions.filter;

               var multiplefilters = 0 // to know if single column search is done or multipe columns/all-grid search
                if (filter[0] instanceof Array) {
                    multiplefilters = 1
                }

                if (multiplefilters == 0) {
                    wherecondition += " " + filter[0] + " " + ApplyInqConditions(filter[1], filter[2]);
                }
                else {
                    var existsandor = false;
                    for (var i = 0; i < filter.length ; i++) {
                        var columnfilter = filter[i];
                        if (columnfilter[0] instanceof Array) {
                            wherecondition += "(" + FilterConditions(columnfilter) + ")";
                            if (existsandor) {
                                wherecondition += ")";
                                existsandor = false;
                            }
                        }
                        else {
                            if (columnfilter == "and" || columnfilter == "or")
                            {
                                existsandor = true;
                                wherecondition += " " + columnfilter + " ("
                            }
                            else {
                                wherecondition += columnfilter[0] + " " + ApplyInqConditions(columnfilter[1], columnfilter[2]);
                                if (existsandor)
                                {
                                    wherecondition += ")";
                                    existsandor = false;
                                }
                            }
                        }
                    }
                }
                wherecondition += ")";
                return wherecondition;
            } else {
                return "";
            }
        }

        // Returns sql understandable multiple (field + operator + value) stmts, separated by "and"/"or" operators
        var FilterConditions = function (filter) {
            var sqlFilterConditions = "";
            for (var i = 0; i < filter.length ; i++) {
                if (filter[i] instanceof Array) {
                    // field + operator + value
                    // if the operator is 'and' then the between is used and needs to be parsed 
                    if (filter[i][1] == "and") {
                        sqlFilterConditions += FilterConditions([filter[i][0]]) + " " + filter[i][1] + " " + FilterConditions([filter[i][2]]);
                    }
                    else {
                        sqlFilterConditions += filter[i][0] + " " + ApplyInqConditions(filter[i][1], filter[i][2]);
                    }
                } else {
                    // "and"/ "or"
                    sqlFilterConditions += " " + filter[i] + " ";
                }
            }
            return sqlFilterConditions;
        }

        // converts the grid operators to their sql equivalent operators and returns: field + operator + value
        var ApplyInqConditions = function (filter, value) {
             
            //Added by Chazel (12-06-2016) for the issue in filtering integer types
            if (typeof value.getDate !== "undefined") {
                // safe to convert to date               
                value = moment(value).format("MM/DD/YYYY");
            }

            //Added to replace the ' by '' in order not to face sql errors for such character
            var returnval = "";
            if (value != null && value != undefined) {
                value = value.toString().split("'").join("''");
            }
            
          
           /* if (moment(value).isValid()) {
             value = moment(value).format("MM/DD/YYYY");
            }*/


            //Added by Tina 2016-11-10
           // var filter_value = value.split(' ');
           

           /* if (moment(value, 'MM/DD/YYYY', true).isValid() ||
                moment(value, 'M/DD/YYYY', true).isValid() ||
                moment(value, 'MM/D/YYYY', true).isValid() ||
                moment(value, 'M/D/YYYY', true).isValid() ||
                moment(value, 'MM-DD-YYYY', true).isValid() ||
                moment(value, 'M-D-YYYY', true).isValid() ||
                moment(value, 'M-DD-YYYY', true).isValid() ||
                moment(value, 'MM-D-YYYY', true).isValid() ||
                moment(value, 'DD-MMM-YYYY', true).isValid() ||
                moment(value, 'DD/MMM/YYYY', true).isValid() ) {
                //($.type(filter_value[0]) === "string" && $.type(filter_value[1]) === "string" && $.isNumeric(filter_value[2]) && $.isNumeric(filter_value[3]) && $.isNumeric(filter_value[4]))) {
                value = moment(value).format("MM/DD/YYYY");
                //console.info('moment : true', moment(value).utc().format("ddd MMM D YYYY hh:mm:ss ZZ"));
            } */

            if (filter == 'contains') {
                returnval = " like '%" + value + "%' ";
            } else if (filter == 'notcontains') {
                returnval = " Not Like '%" + value + "%' ";
            } else if (filter == 'startswith') {
                returnval = " like '" + value + "%' ";
            } else if (filter == 'endswith') {
                returnval = " like '%" + value + "' ";
            } else if (value == null) {
                returnval = " is null";
            } else {
                returnval = filter + " '" + BoolToInteger(value) + "' ";
            }
            return returnval;
        };

        var BoolToInteger = function (val) {

            if (val == true || val == "true") {
                return 1;
            }
            else if (val == false || val == "false" || val == "") {
                return 0;
            }
            return val;
        };

        var GetTotalRowCount = function (dataSource) {
            if (dataSource == undefined || dataSource == null) { return 0; };
            if (dataSource._items == undefined || dataSource == null) { return 0; };
            if (dataSource._items.length == 0) { return 0; };
            $("#totalRowCount").html('');
            if (dataSource._items[0]['totalrowcount'] == undefined) {

                if (dataSource._items[0] == undefined || dataSource._items[0] == null) { return 0; };

                var dt = dataSource._items[0];

                for (var i = 0; i < dataSource._storeLoadOptions.group.length; i++) {
                    //Chakib 27/11/2015
                    if (dt.items != null) {
                        dt = dt.items[0];
                    } else {
                        for (var i = 0; i < dataSource._items.length; i++) {
                            if (dataSource._items[i].items != null) {
                                dt = dataSource._items[i].items[0];
                            }
                        }
                    }
                }
                
                if ($("#totalRowCount").count != 0) {
                    
                    $("#totalRowCount").append("<span># Records:" + dt['totalrowcount'] + "</span>")
                }
                return dt['totalrowcount'];
            } else {
                if ($("#totalRowCount").count != 0) {
                    $("#totalRowCount").append("<span># Records:" + dataSource._items[0]['totalrowcount'] + "</span>")
                }
                return dataSource._items[0]['totalrowcount'];
            }


        };

        var CurrentLoadOptions = {};
        var SetHelpDataSource = function (id, DataKeys, WebServiceUrl, loadOptions, specificCond, parameters,
            mainScope, addurl, Controller, GridData, gridparameters) {
            loadOptions.id = id;
            loadOptions.addurl = addurl;
            if (addurl != undefined) {
               
                    $timeout(function () {
                        mainScope.addurl = addurl;
                        mainScope.Controller = Controller;
                        mainScope.HelpCreateNew = function (e) {
                            var value = $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("valueExpr").toString();
                            var display = $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("displayExpr").toString();
                             
                            if (e.selectedItem == undefined) { return; };
                            if (CurrentLoadOptions.searchValue != '' && CurrentLoadOptions.searchValue != null) {
                                var dataSource = $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("dataSource");
                                var items = dataSource._items;
                                for (var i = 0; i < items.length;i++) {
                                    if (items[i][display].toLowerCase() == CurrentLoadOptions.searchValue.toLowerCase() && items[i][value] != -1) {
                                        $timeout(function () {
                                            $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("value", items[i][value]);
                                        });
                                        
                                        return;
                                    }
                                }

                            }
                            if (e.selectedItem[value] == -1) {
                                $timeout(function () {
                                    $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("value", 0);
                                });
                                var modelData = {}
                                if (e.selectedItem[display] != null && e.selectedItem[display] != undefined) {
                                    modelData[display] = e.selectedItem[display];
                                } else {
                                    modelData[display] = '';
                                }
                                

                                
                            }
                        }
                        //mainScope.HelponOpened = function (e) {
                        //    if ($(".dx-template-wrapper.dx-item-content.dx-list-item-content").length > 0) {
                        //        if ($(b).length > 1) {
                        //            var b = $(".dx-template-wrapper.dx-item-content.dx-list-item-content").first();
                        //            $(b).addClass("btn-blue7");
                        //        }

                        //    }
                        //}
                        if (id != undefined) {
                            
                           // if ($("#" + id).dxSelectBox("instance").option("onSelectionChanged") == null) {
                                $("#" + id).dxSelectBox("instance").option("onSelectionChanged", mainScope.HelpCreateNew);
                            //}
                            //if ($("#" + id).dxSelectBox("instance").option("onContentReady") == null) {
                            //    $("#" + id).dxSelectBox("instance").option("onContentReady", mainScope.HelponOpened);
                            //}
                        }
                        //$(".dx-lookup-popup-wrapper .dx-toolbar-items-container .dx-toolbar-center").
                        //    append($compile("<span ng-click='CreateNew()' data-href='" + addurl + "' class='dx-button-text dx-item-content dx-toolbar-item-content dx-popup-clear dx-button dx-button-normal dx-widget dx-button-has-text customAddNew'>Add new</span>")(mainScope));
                    });
                
            }


            var d = new $q.defer();
            var filterOptions = '';

            if (loadOptions == undefined) {
                filterOptions = ''
            } else {
                // var filterOptions = ApplyInquiryFilterParams(loadOptions);
                var filter = '';
                if (loadOptions.searchValue == null) { loadOptions.searchValue = '' };
                if (loadOptions.searchExpr != undefined) {
                    if (loadOptions.searchExpr.constructor === Array) {
                        for (var i = 0; i < loadOptions.searchExpr.length; i++) {
                            if (filter != '') {
                                filter += " Or "
                            }
                            
                            filter += loadOptions.searchExpr[i] + " Like '%" + loadOptions.searchValue + "%' ";
                        }
                    } else {
                        filter += loadOptions.searchExpr + " Like '%" + loadOptions.searchValue + "%' ";
                    }

                    filterOptions += "Where (" + filter + ")";

                }
            }

            if (specificCond != null && specificCond != undefined && specificCond != '') {
                if (filterOptions == '') {
                    filterOptions += ' where (' + specificCond + ')';
                } else {
                    filterOptions += ' and (' + specificCond + ')';
                }
            }

            if (loadOptions != undefined) {

                if (loadOptions.take == undefined) { loadOptions.take = 10; };
                if (loadOptions.skip == undefined) { loadOptions.skip = 0; };

            } else {
                loadOptions = {};
                loadOptions.take = 10;
                loadOptions.skip = 0;
            }
            var take = loadOptions.take + loadOptions.skip;
            var skip = loadOptions.skip;

            if (loadOptions.isLoadingAll != undefined) {
                if (loadOptions.isLoadingAll == true) {
                    take = 0;
                    skip = 0;
                }
            }

            var sortcolumn = "";
            if (loadOptions != undefined) {
                if (loadOptions.sort != undefined) {
                    sortcolumn = loadOptions.sort[0].selector;
                    if (loadOptions.sort[0].desc) {
                        sortcolumn += " desc "
                    }
                }
            }

            var params = {};
            if (parameters != null && parameters != 'undefined') {

                for (par in parameters)
                {
                    if (mainScope.FormData[parameters[par]] == undefined) {
                        params[par] = null;
                    } else {
                        params[par] = mainScope.FormData[parameters[par]];
                    }
                }
            }
            //added by joe warde 23/11/2016
            if (gridparameters != null && gridparameters != 'undefined' && GridData != undefined) {
                for (par in gridparameters) {
                    if (GridData[gridparameters[par]] == undefined) {
                        params[par] = null;
                    }
                    else {
                        params[par] = GridData[gridparameters[par]];
                    }
                    //params[par] = GridData[gridparameters[par]];
                }
            }

            CurrentLoadOptions = loadOptions;

            $http.post(WebServiceUrl, {
                filter: filterOptions,
                take: take,
                skip: skip,
                sort: sortcolumn,
                parameters: params
            }, null)
                .success(function (data) {
                    if (CurrentLoadOptions.skip == 0 && data.length !=1 && CurrentLoadOptions.addurl != undefined) {
                        var value = $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("valueExpr").toString();
                        var display = $("#" + CurrentLoadOptions.id).dxSelectBox("instance").option("displayExpr").toString();
                        var customAddNew = {};
                        customAddNew[value] = -1;
                        if (CurrentLoadOptions.searchValue == null || CurrentLoadOptions.searchValue == undefined || CurrentLoadOptions.searchValue == '') {
                            customAddNew['addnew'] = '+ Add New';
                        } else {
                            customAddNew['addnew'] = '+ Add New : ';
                        }
                        customAddNew[display] = CurrentLoadOptions.searchValue;
                        
                        data.splice(0, 0, customAddNew);
                    };
                    d.resolve(data);
                })
                .error(function (data) {
                    //Utils.ShowMessage(data.ExceptionMessage, 'Error');
                });

            return d.promise;
        }

        var HelpDataSource = function (id, ServiceFnc, Keys, DataKeys, parentscope, addurl, Controller, GridData,
            Parameters, GridParameters) {
            return new DevExpress.data.DataSource({
                load: function (loadOptions) {
                    return SetHelpDataSource(id, DataKeys, WebServiceUrl + ServiceFnc, loadOptions, null, Parameters, parentscope, addurl, Controller, GridData, GridParameters);
                },
                byKey: function (key, extra) {
                    if( key ==0) {
                        return null;  
                    }
                    var returns = {};
                    for (var i = 0; i < Keys.length; i++) {
                        if (GridData != undefined) {
                            returns[Keys[i]] = [GridData][0][DataKeys[i]];
                        } else {
                            returns[Keys[i]] = parentscope.FormData[DataKeys[i]];
                        }    
                    }
                    return returns;
                }
            });
        }

        var GridEditorDataSource = function (mainScope, formData, DetailData, Keys) {
            var data = new DevExpress.data.CustomStore({
                type: 'array',
                key: Keys,

                load: function (loadOptions) {
                    if (mainScope[formData][DetailData] != undefined) {
                        return mainScope[formData][DetailData];
                    }
                },
                insert: function (values) {
                    values.rowstate = 1;
                    if (mainScope[formData][DetailData] == undefined) {
                        mainScope[formData][DetailData] = [];
                    }
                    mainScope[formData][DetailData].push(values);
                },
                remove: function (key) {
                    mainScope[formData][DetailData].filter(
                        function (detail) {
                            var itemmatch = true;
                            for (var i in key) {
                                if (detail[i] !== key[i]) {
                                    itemmatch = false;
                                }
                            }
                            return itemmatch;
                        })[0].rowstate = 3;
                },
                update: function (key, values) {
                    var items = mainScope[formData][DetailData].filter(
                        function (detail) {
                            var itemmatch = true;
                            for (var i in key) {
                                if (detail[i] !== key[i]) {
                                    itemmatch = false;
                                }
                            }
                            return itemmatch; //detail.tocseq === key;
                        }
                        );

                    var item = items[0];
                    item.rowstate = 2;
                    for (var i in values) {
                        item[i] = values[i];
                    }
                },
                byKey: function (key, extraOptions) {
                    return mainScope[formData][DetailData][key];
                },
                totalCount: function (options) {
                    return 0;
                }
            });
            return data;
        }

        var SetInqSearchHelpDataSource = function (WebServiceUrl, loadOptions, specificCond, parameters) {
            var d = new $q.defer();
            var filterOptions = '';
            if (loadOptions == undefined) {
                filterOptions = ''
            } else {
                // var filterOptions = ApplyInquiryFilterParams(loadOptions);
                var filter = '';
                if (loadOptions.searchExpr != undefined) {
                    if (loadOptions.searchExpr.constructor === Array) {
                        for (var i = 0; i < loadOptions.searchExpr.length; i++) {
                            if (filter != '') {
                                filter += " Or "
                            }
                            filter += loadOptions.searchExpr[i] + " Like '%" + loadOptions.searchValue + "%' ";
                        }
                    } else {
                        filter += loadOptions.searchExpr + " Like '%" + loadOptions.searchValue + "%' ";
                    }

                    filterOptions += "Where (" + filter + ")";

                }
            }

            if (specificCond != null && specificCond != undefined && specificCond != '') {
                if (filterOptions == '') {
                    filterOptions += ' where (' + specificCond + ')';
                } else {
                    filterOptions += ' and (' + specificCond + ')';
                }
            }

            if (loadOptions != undefined) {

                if (loadOptions.take == undefined) { loadOptions.take = 10; };
                if (loadOptions.skip == undefined) { loadOptions.skip = 0; };

            } else {
                loadOptions = {};
                loadOptions.take = 10;
                loadOptions.skip = 0;
            }
            var take = loadOptions.take + loadOptions.skip;
            var skip = loadOptions.skip;

            if (loadOptions.isLoadingAll != undefined) {
                if (loadOptions.isLoadingAll == true) {
                    take = 0;
                    skip = 0;
                }
            }

            var sortcolumn = "";
            if (loadOptions != undefined) {
                if (loadOptions.sort != undefined) {
                    sortcolumn = loadOptions.sort[0].selector;
                    if (loadOptions.sort[0].desc) {
                        sortcolumn += " desc "
                    }
                }
            }

            var params = [];
            if (parameters != null && parameters != 'undefined') {
                params = $.param(parameters);
            }

            $http.post(WebServiceUrl, {
                filter: filterOptions,
                take: take,
                skip: skip,
                sort: sortcolumn,
                params: params
            }, null)
                .success(function (data) {
                    d.resolve(data);
                })
                .error(function (data) {
                    //Utils.ShowMessage(data, 'Error');
                });

            return d.promise;
        };

        return {
            SetInquriyDataSource: SetInquriyDataSource, GetTotalRowCount: GetTotalRowCount, SetHelpDataSource: SetHelpDataSource,
            HelpDataSource: HelpDataSource, GridEditorDataSource: GridEditorDataSource, SetInqSearchHelpDataSource: SetInqSearchHelpDataSource,
            ApplyInquiryFilterParams: ApplyInquiryFilterParams
        }
}]);