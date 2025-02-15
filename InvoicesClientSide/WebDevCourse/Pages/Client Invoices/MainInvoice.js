angular.module('MainApp')

 //Header
.controller(
        'clientinvoiceheadercontroller',
        ['$scope', '$http', '$uibModal', '$window',
            function ($scope, $http, $uibModal, $window) {
                //GetAllHeaders
                $scope.Headers = [];
                $scope.getAllInvoiceHeaders = function () {
                    $http.post("https://localhost:44346/api/invoices/GetAll")
                        .then(function (response) {
                            $scope.Headers = response.data;
                        }, function (error) {
                            console.error("Error fetching invoice headers:", error);
                        });
                };

                $scope.init = function () {
                    $scope.getAllInvoiceHeaders();
                };


                $scope.init();


                $scope.gridinvoiceheader = {
                    bindingOptions: {
                        dataSource: 'Headers'
                    },
                    selection: {
                        allowSelectAll: false,
                        mode: 'single'
                    },
                    filterRow: {
                        visible: true
                    },
                    allowColumnResizing: true,
                    paging: {
                        enabled: true,
                        pageSize: 10
                    },
                    pager: {
                        visible: true,
                        showNavigationButtons: true,
                        infoText: 'Total Pages : {1}',
                        showInfo: true
                    },
                    showBorders: true,
                    width: '90%',

                    onCellPrepared: function (e) {
                        e.cellElement.css({
                            "text-align": "center",
                            "vertical-align": "middle"
                        });
                        if (e.rowType == "header") {
                            e.cellElement.css("backgroundColor", "#F0FFFF");
                            e.cellElement.css("color", "#6495ED");
                            e.cellElement.css("font-weight", "bold");
                        }
                    },
                    columns: [
                        { dataField: 'IhSeq', caption: 'Seq', dataType: 'number', width: 100 },
                        { dataField: 'IhNumber', caption: 'Number', dataType: 'number', width: 100 },
                        { dataField: 'IhClientName', caption: 'Client', dataType: 'string', width: 100 },
                        { dataField: 'IhTotal', caption: 'Total', dataType: 'number', width: 130 },
                        { dataField: 'IhAddDate', caption: 'Date', dataType: 'date', width: 130 },
                        {
                            //AddDetails
                            width: 170,
                            caption: 'Add',
                            cellTemplate: function (container, options) {
                                $("<div/>").dxButton({
                                    onClick: function () {
                                        var seq = options.data.IhSeq;
                                        $window.location.href = "#/InvoiceDetails/" + seq;
                                    },
                                    type: 'success',
                                    text: 'Details'
                                }).appendTo(container);
                            }
                        },

                        {
                            width: 170,
                            caption: 'Update',
                            cellTemplate: function (container, options) {
                                $("<div/>").dxButton({
                                    onClick: function () {
                                        var selectedSequence = options.data.IdSeq;
                                        var ClientName = options.data.IhClientName;
                                        var modalInstance = $uibModal.open({
                                            templateUrl: '../../../Pages/Client Invoices/UpdateClient.html',
                                            controller: 'updateclientinvoiceheadercontroller',
                                            size: 'lg',
                                            resolve: {
                                                ngmodel: function () {
                                                    return {
                                                        client: ClientName,
                                                        seq: selectedSequence
                                                    };
                                                }
                                            }
                                        });

                                        modalInstance.result.then(function () {
                                            $scope.getAllInvoiceDetails();
                                        });
                                    },
                                    type: 'success',
                                    text: 'Update'
                                }).appendTo(container);
                            }
                        },

                        {
                            //DeleteHeader
                            width: 170,
                            caption: 'Remove',
                            cellTemplate: function (container, options) {
                                $("<div/>").dxButton({
                                    onClick: function () {
                                        var selectedSequence = options.data.IhSeq;
                                        $http.post("https://localhost:44346/api/invoices/Delete/" + selectedSequence)
                                            .then(function (response) {
                                                $scope.getAllInvoiceHeaders();
                                            }, function (error) {
                                                console.error("Error deleting invoice:", error);
                                            });
                                    },
                                    type: 'danger',
                                    text: 'Delete'
                                }).appendTo(container);
                            }
                        }
                    ]
                };

                //InsertHeader
                $scope.AddIH = function () {
                    var modalInstance = $uibModal.open({
                        templateUrl: '../../../Pages/Client Invoices/AddInvoiceModal.html',
                        controller: 'insertclientinvoiceheadercontroller',
                        size: 'lg'
                    });

                    modalInstance.result.then(function () {
                        $scope.getAllInvoiceHeaders();
                    });
                };

            }
        ]
    )

 //Details
.controller('clientinvoicedetailscontroller',
        ['$scope', '$http', '$window', '$routeParams', '$uibModal',
        function ($scope, $http, $window, $routeParams, $uibModal) {

            var ihSequence = $routeParams.seq;

            $scope.FormData = {
                InvoiceHeaderSeq: ihSequence,
                seq : 0
            };

            $scope.invoiceDetails = [];


            $scope.getAllInvoiceDetails = function () {
                $http.post("https://localhost:44346/api/invoicedetails/GetDetails/" + ihSequence)
                    .then(function (response) {
                        $scope.invoiceDetails = response.data;
                        console.log(response);
                    }, function (error) {
                        console.error("Error fetching invoice details:", error);
                    });
            };


            $scope.init = function () {
                $scope.getAllInvoiceDetails();
            };


            $scope.init();


            $scope.gridinvoicedetails = {
                bindingOptions: {
                    dataSource: 'invoiceDetails'
                },
                selection: {
                    allowSelectAll: false,
                    mode: 'single'
                },
                filterRow: {
                    visible: true
                },
                allowColumnResizing: true,
                paging: {
                    enabled: true,
                    pageSize: 10
                },
                pager: {
                    visible: true,
                    showNavigationButtons: true,
                    infoText: 'Total Pages : {1}',
                    showInfo: true
                },
                showBorders: true,
                width: '80%',

                onCellPrepared: function (e) {
                    e.cellElement.css({
                        "text-align": "center",
                        "vertical-align": "middle"
                    });
                    if (e.rowType == "header") {
                        e.cellElement.css("backgroundColor", "#F0FFFF");
                        e.cellElement.css("color", "#6495ED");
                        e.cellElement.css("font-weight", "bold");
                    }
                },
                onSelectionChanged: function (e) {
                    var selectedRows = e.selectedRowsData;
                    if (selectedRows.length > 0) {
                        $scope.FormData.seq = selectedRows[0].IdSeq;
                        $scope.$apply();
                    }
                },

                columns: [
                    { dataField: 'IdSeq', caption: 'ID', dataType: 'number', width: 90 },
                    { dataField: 'IdItemName', caption: 'Item Name', dataType: 'string', width: 170 },
                    { dataField: 'IdQty', caption: 'Quantity', dataType: 'number', width: 110 },
                    { dataField: 'IdPrice', caption: 'Price', dataType: 'number', width: 110 },
                    {
                        caption: 'Total',
                        width: 110,
                        cellTemplate: function (container, options) {
                            var total = options.data.IdQty * options.data.IdPrice;
                            $("<div/>").text(total).appendTo(container);
                        }
                    },
                    {
                        width: 230,
                        caption: 'Remove',
                        cellTemplate: function (container, options) {
                            $("<div/>").dxButton({
                                onClick: function () {
                                    var selectedSequence = options.data.IdSeq;
                                    $http.post("https://localhost:44346/api/invoicedetails/DeleteDetail/" + selectedSequence)
                                        .then(function (response) {
                                            $scope.getAllInvoiceDetails();
                                        }, function (error) {
                                            console.error("Error deleting invoice detail:", error);
                                        });
                                },
                                type: 'danger',
                                text: 'Delete'
                            }).appendTo(container);
                        }
                    },
                    {
                        width: 230,
                        caption: 'Update',
                        cellTemplate: function (container, options) {
                            $("<div/>").dxButton({
                                onClick: function () {
                                    var selectedSequence = options.data.IdSeq;
                                    var modalInstance = $uibModal.open({
                                        templateUrl: '../../../Pages/Client Invoices/AddDetailModal.html',
                                        controller: 'insertclientinvoicedetailscontroller',
                                        size: 'lg',
                                        resolve: {
                                            ngmodel: function () {
                                                return {
                                                    InvoiceHeaderSeq: ihSequence,
                                                    seq: selectedSequence
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        $scope.getAllInvoiceDetails();
                                    });
                                },
                                type: 'success',
                                text: 'Update'
                            }).appendTo(container);
                        }
                    }
                ]
            }


            $scope.AddNewID = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: '../../../Pages/Client Invoices/AddDetailModal.html',
                    controller: 'insertclientinvoicedetailscontroller',
                    size: 'lg',
                    resolve: {
                        ngmodel: function () {
                            return {
                                InvoiceHeaderSeq: ihSequence,
                                seq: 0
                            };
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.getAllInvoiceDetails();  
                });
            };


        }
    ])

//Add details Modal
.controller(
        'insertclientinvoicedetailscontroller',
        ['$scope', '$http', '$window', '$uibModalInstance', 'ngmodel',
            function ($scope, $http, $window, $uibModalInstance, ngmodel) {

                var invoiceHeaderSeq = ngmodel.InvoiceHeaderSeq;
                var Seq = ngmodel.seq;


                $scope.FormData = {
                    ItemName: null,
                    Quantity: null,
                    Price: null,
                    InvoiceHeaderSeq: invoiceHeaderSeq,
                    Seq: Seq
                };


                if (Seq > 0) {
                    $http.post("https://localhost:44346/api/invoicedetails/GetDetailsBySeq/" + Seq)
                        .then(function (response) {
                            var result = response.data;
                            if (result) {
                                $scope.FormData.ItemName = result.IdItemName;
                                $scope.FormData.Quantity = result.IdQty;
                                $scope.FormData.Price = result.IdPrice;
                            }
                            alert(result.IdItemName);
                        })
                        .catch(function (error) {
                            console.error("Error fetching details:", error);
                        });
                }

                $scope.clickSaveDetails = function () {
                    if ($scope.FormData.ItemName !=null && $scope.FormData.Quantity > 0 && $scope.FormData.Price > 0) {
                        if (Seq > 0)

                        {
                            $http.post("https://localhost:44346/api/invoicedetails/UpdateDetail", {
                                IdSeq: $scope.FormData.Seq,
                                ItemName: $scope.FormData.ItemName,
                                Qty: $scope.FormData.Quantity,
                                Price: $scope.FormData.Price
                            })
                                .then(function (response) {
                                    alert("Item has been updated");
                                    $uibModalInstance.close();
                                    $window.location.href = "#/InvoiceDetails/" + Seq;
                                })
                                .catch(function (error) {
                                    console.error("Error updating item:", error);
                                    alert("Not Updated");
                                });
                        } else
                        {

                            $http.post("https://localhost:44346/api/invoicedetails/InsertDetail", {
                                FkIhSeq: $scope.FormData.InvoiceHeaderSeq,
                                IdItemName: $scope.FormData.ItemName,
                                IdQty: $scope.FormData.Quantity,
                                IdPrice: $scope.FormData.Price
                            })
                                .then(function (response) {
                                    alert("New item has been added");
                                    $uibModalInstance.close();
                                    $window.location.href = "#/InvoiceDetails/" + Seq;
                                })
                                .catch(function (error) {
                                    console.error("Error adding new item:", error);
                                    alert("Not added");
                                });
                        }
                    } else {
                        alert("Please provide all required fields.");
                    }
                };

                $scope.CloseModalDetails = function () {
                    $uibModalInstance.dismiss();
                };

            }
        ]
    )

//Add header Modal
.controller(
        'insertclientinvoiceheadercontroller',
        ['$scope', '$http', '$window', '$uibModalInstance',
            function ($scope, $http, $window, $uibModalInstance) {
                $scope.FormData = {
                    clientName: null
                };
                $scope.clickAddRecord = function () {
                    // Ensure clientName and total are set
                    if ($scope.FormData.clientName) {
                        $http({
                            method: 'POST',
                            url: 'https://localhost:44346/api/invoices/AddInvoiceHeader',
                            data: {
                                ClientName: $scope.FormData.clientName
                            },
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(function (response) {
                                alert("New Invoice has been added");
                                $uibModalInstance.close();
                                $window.location.href = "#/IHeaderClient";
                                $window.location.reload();
                            }, function (error) {
                                console.error("Error adding new invoice:", error);
                            });
                    } else {
                        alert("Please provide valid Client Name and Total.");
                    }
                };

                $scope.CloseModal = function () {
                    $uibModalInstance.dismiss();
                };
            }
        ]
)

//Update Client Name
.controller(
    'updateclientinvoiceheadercontroller',
    ['$scope', '$http', '$window', '$uibModalInstance', "ngmodel" ,
        function ($scope, $http, $window, $uibModalInstance, ngmodel) {
            var ihseq = ngmodel.seq
            var clientName = ngmodel.client

            $scope.FormData = {
                clientName: clientName,
                ihseq:ihseq
            };

            $scope.clickUpRecord = function () {
                // Ensure clientName and total are set
                if ($scope.FormData.clientName) {
                    $http.post("https://localhost:44346/api/invoices/UpdateClientName", {
                        NewClientName: $scope.FormData.clientName,
                        IhSeq: $scope.FormData.ihseq
                    })
                        .then(function (response) {
                            alert("New Invoice has been added");
                            $uibModalInstance.close();
                            $window.location.href = "#/IHeaderClient";
                            $window.location.reload();
                        }, function (error) {
                            console.error("Error adding new invoice:", error);
                        });
                } else {
                    alert("Please provide valid Client Name and Total.");
                }
            };

            $scope.CloseModal = function () {
                $uibModalInstance.dismiss();
            };
        }
    ]
);
