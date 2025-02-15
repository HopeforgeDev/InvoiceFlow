myApp.directive("drHelpLabel", function () {
            return {
                templateUrl: '../../../Directives/Common/HelpLabel/drHelpLabel.html',
                scope: {
                    helplabeloptions: ' =helplabeloptions'
                },
                link: function (scope, element, attrs) {

                    scope.$on('$destroy', function() {
                        element.off('$destroy'); 
                        angular.element(element).remove();
                        element = null;
                    });

                },
                controller: function ($scope, $http, $uibModal, Utils, $sce, AppConfigUrlService) {
                  
                    $scope.onHelpLabelClick = function (e) {
                       // var helpurl = (Utils.appconfigurls.WebHelpUrl) ? Utils.appconfigurls.WebHelpUrl : WebHelpUrl;
                        AppConfigUrlService.getappconfigurls().then(function () { 

                            $http.post(Utils.appconfigurls.WebHelpUrl + 'Label/getLabelHint', { 'lhlabelkey': $scope.helplabeloptions.labelkey }, null).success(function (data) {
                                $scope.FormData = data;

                                if ($scope.FormData.length == 0) { return; }
                                if ($scope.FormData[0].lhlabeltype == 1) {

                                    // to get the last index of modal
                                    var latestZIndex = function () {
                                        var highest_z_index = 0;
                                        var current_z_index = 0;
                                        var modal = $('body').find('.modal.in');
                                        //// Loop through each div and get the highest z-index
                                        modal.each(function () {

                                            current_z_index = parseInt($(this).css("z-index"));
                                            if (current_z_index > highest_z_index) {
                                                highest_z_index = current_z_index + 1;
                                            }
                                        })
                                        return highest_z_index;
                                    }

                                    $scope.classzindex = '';
                                    // find 1st modal open 
                                    if ($('body').find('.modal.in').first().css("z-index") != undefined) {
                                        // go to head element and check element style if contains existing .z-index-*
                                        if ($("head").find("style:contains('.z-index-" + (latestZIndex() + 1) + "')").text() == '') {
                                            // if not existing, appent to the head element a new style element containts z-index-* class
                                            $('head').append("<style> .z-index-" + (latestZIndex() + 1) + " { z-index: " + (latestZIndex() + 1) + " !important; }</style>");
                                        }
                                        // set the new z-index-* class
                                        $scope.classzindex = " z-index-" + (latestZIndex() + 1) + " ";
                                    }


                                    var modalInstance = $uibModal.open({
                                        templateUrl: '../../../Directives/Common/HelpLabel/drHelpLabelForm.html',
                                        controller: 'labelhintcontroller',
                                        size: 'md',
                                        backdrop: 'static',
                                        windowClass: 'modal' + $scope.classzindex,
                                        resolve: {
                                            ngmodel: function () {
                                                return {
                                                    FormData: $scope.FormData
                                                };
                                            }
                                        }
                                    });
                                } else {

                                    var width = "200px";
                                    var placement = "right";
                                    if ($scope.helplabeloptions.width != undefined) {
                                        width = $scope.helplabeloptions.width;
                                    }
                                    if($scope.helplabeloptions.placement!=undefined)
                                    {
                                        placement = $scope.helplabeloptions.placement;

                                    }

                                    $("#labelhintContainer").dxPopover({
                                        target: "#" + $scope.helplabeloptions.labelkey,
                                        width: width,
                                        position: placement,
                                        contentTemplate: function () {
                                            return $("<p />").html($scope.FormData[0].lhlabelhint);
                                        }
                                    });

                                    $("#labelhintContainer").dxPopover("show");
                                
                                    //e.element.popover({ html: true, content: $scope.FormData[0].lhlabelhint, animation: true, placement: placement }).on("show.bs.popover", function () {
                                    //    $(this).data("bs.popover").tip().css("width", width);
                                    //    e.element.attr("popoverAttr", "1");
                                    //});
                                    //if (e.element.attr("popoverAttr") == undefined) {
                                    //    e.element.popover("show");
                                    //}
                                }
                            }).error(function (data, status, headers, config) {
                                Utils.ShowErrorMessage(data, status);
                            });
                        });


                    }

                }

            }



        });

        
myApp.controller("labelhintcontroller", function ($scope, ngmodel, $uibModalInstance, $sce) {
            $scope.FormData = {};
            $scope.FormData.lhlabelhint = $sce.trustAsHtml(ngmodel.FormData[0].lhlabelhint);
            $scope.leavehelplabel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        });
    
