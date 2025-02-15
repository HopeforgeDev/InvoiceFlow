angular.module('MainApp').factory('FlowService', ['$http', 'WebServiceUrl', '$q', 
    function ($http, WebServiceUrl, $q) {
    
    var executecustomaction = function(formdata){
        var d = $q.defer();

        $http.post(WebServiceUrl + 'customaction/executecustomaction', formdata, null).success(function (data) {
            d.resolve(data);
        }).error(function (data) {
        });

        return d.promise;
    }

    var sendemail = function (flowemailparam, redefineFlowEmailParam) {
        var d = $q.defer();

        flowemailparam.fromoutsider = 1;
      
        if (redefineFlowEmailParam && angular.isDefined(redefineFlowEmailParam)) {
            redefineFlowEmailParam(flowemailparam).then(function (res) {
                if (res) {
                    flowemailparam = res;
                }
                    //The api includes the checking of the fields that tell whether to send the email or not. The user parameter is also considered. 
                 $http.post(WebServiceUrl + 'flow/sendflowstepemail', flowemailparam, null).success(function (data) {
                        if (data.emailsenderror != null) {
                            DevExpress.ui.notify({ message: data.emailsenderror, position: "top" }, "error", 3000);
                            d.reject();
                        }
                        d.resolve(true);
                 });
               
            });
        }
        else {
            //The api includes the checking of the fields that tell whether to send the email or not. The user parameter is also considered. 
            $http.post(WebServiceUrl + 'flow/sendflowstepemail', flowemailparam, null).success(function (data) {
                if (data.emailsenderror != null) {
                    DevExpress.ui.notify({ message: data.emailsenderror, position: "top" }, "error", 3000);
                    d.reject();
                }
                d.resolve(true);
            });
        }

        return d.promise;
    }

    var mainmoveflow = function (moveflowapi, formdata, customactionparam, flowemailparam, mainscope, nextflowseqfieldname, nextflowuserfieldname, nextflowuserauxid, closefunc) {
        var d = $q.defer();
       
        $http.post(WebServiceUrl + moveflowapi, formdata, null).success(function (resdata) {
            
                if (formdata.fkactaid != null && formdata.fkactaid != undefined && formdata.fkactaid != 0) {
                    customactionparam.actaid = formdata.fkactaid;
                    executecustomaction(customactionparam).then(function (data) {
                            //If user and step were changed in the customaction, the new user and step should be returned inorder to update the email to be sent
                            if (data.flstepseq) mainscope.FormData[nextflowseqfieldname] = data.flstepseq;
                            if (data.flowstepuser) mainscope.FormData[nextflowuserfieldname] = data.flowstepuser;
                            if (data.flowstepauxid) mainscope.FormData[nextflowuserauxid] = data.flowstepauxid;

                           d.resolve(resdata);
                       
                    });
                } else {                   
                   d.resolve(resdata);
                }
          
        }).error(function () {
            DevExpress.ui.notify({ message: "Workflow update failed.", position: "top" }, "error", 3000);
            if (closefunc) {
                closefunc();
            }
            d.reject();
        });

        return d.promise;
    }

    var moveflow = function (mainscope, customactionparam, flowemailparam, moveflowapi, nextflowseqfieldname, nextflowuserfieldname, nextflowuserauxid, redefineFlowEmailParam, closefunc) {
        var d = $q.defer();
        var mainmoveflow = this.mainmoveflow;
        var sendemail = this.sendemail;
        var executecustomaction = this.executecustomaction;

        customactionparam.fromoutsider = 1;
        customactionparam.formdata = mainscope.FormData;

        if (mainscope.FormData.fkactaidbeforeaction) {
            customactionparam.actaid = mainscope.FormData.fkactaidbeforeaction;
            this.executecustomaction(customactionparam).then(function (data) {
                if (data.cannotupdateflowstatus == 1) {
                    if (data.actareturnmessag) {
                        DevExpress.ui.notify({ message: data.actareturnmessag, position: "top" }, "error", 3000);
                    }

                    if (closefunc) {
                        closefunc();
                    }
                    d.reject();
                }
                else {
                    if (data.flstepseq) mainscope.FormData[nextflowseqfieldname] = data.flstepseq;
                    if (data.flowstepuser) mainscope.FormData[nextflowuserfieldname] = data.flowstepuser;
                    if (data.flowstepauxid) mainscope.FormData[nextflowuserauxid] = data.flowstepauxid;

                    if (data.actareturnmessag) {
                        DevExpress.ui.notify({ message: data.actareturnmessag, position: "top" }, "success", 3000);
                    }

                    mainmoveflow(moveflowapi, mainscope.FormData, customactionparam, flowemailparam, mainscope, nextflowseqfieldname, nextflowuserfieldname, nextflowuserauxid, closefunc).then(function (resdata) {
                        sendemail(flowemailparam, redefineFlowEmailParam).then(function () {
                            d.resolve(resdata);
                        });
                    });
                }
            });
        }
        else {
            mainmoveflow(moveflowapi, mainscope.FormData, customactionparam, flowemailparam, mainscope, nextflowseqfieldname, nextflowuserfieldname, nextflowuserauxid, closefunc).then(function (resdata) {
                sendemail(flowemailparam, redefineFlowEmailParam).then(function () {
                    d.resolve(resdata);
                });
            });
        }

        return d.promise;
    }

    var getflownavigationsteps = function(params){
        var d = $q.defer();

        $http.post(WebServiceUrl + 'flow/getflownavigationsteps', params, null).success(function (resdata) {
            d.resolve(resdata);
        });

        return d.promise;
    }


    

    return {
        executecustomaction: executecustomaction, sendemail: sendemail, moveflow: moveflow, mainmoveflow: mainmoveflow, getflownavigationsteps: getflownavigationsteps
    }
    
 }]);
