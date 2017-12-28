//var serverUrl = "http://doghunter.ddns.net/vakdert";
var serverUrl = "http://localhost/vakdert";
var apvHash = "beta-r1.0.3";;var user;
var lastBarList;

$(function() {
    if (sessionStorage.getItem("user") !== "true") {
        if (localStorage.getItem("isSessionAlive") != null) {
            $.when(checkSessionAlive()).done(function(result) {
                sessionStorage.setItem("user", "true");
                initNavbar();
                initListBares();        
            }).fail(function(result) {
                initLogin();
            });
        } else {
            initLogin();
        }
    } else {
        initNavbar();
        initListBares();
    }
});

function showCustomAlert(title, message) {
    var tmpl = $("#modal-template").html();
        $("#modal-template").load("./scripts/modal.tmpl.html", function() {
        var modalTmpl = $.templates("#modal-template");
        app = { 
                entry: {
                    bodyContent: message,
                }
            };
        if (title !== "") {
            app.entry.modalTitle = [title];
        }
        var parsedTemplate = modalTmpl.render(app);
        $("#modalContainer").html(parsedTemplate);
        $("#customModal").modal('show');
    });
}

function loadListView() {
    $.ajax({
        url: serverUrl + '/api.php',
        data: {
            action : 'showList',
            },
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            if(typeof(result.code) == "undefined") {
                for (var i = 0; i < result.length; i++) {
                    if(result[i].plugs == 1) {
                        plugsData = 'fa fa-plug fa-fw';
                    } else if(result[i].plugs == 2) {
                        plugsData = 'fa fa-clock-o fa-fw';
                    } else {
                        plugsData = 'fa fa-battery-full fa-fw';
                    }
                    result[i].plugsClass = plugsData;
                }
               lastBarList = result;
               renderBarList(result);             
            } else if(result.code == -10) {
                sessionStorage.clear();
                initLogin();
                showCustomAlert("Sesión Caducada", "Inice sesión para acceder al contenido.");
            } else {
                showCustomAlert("Error de servidor", result.message);
            }
        },
        error: function (request,error) {          
            alert('Error de red/servidor.');
        }
    });
}

function renderBarList(barlist) {
   $("#listBares-template").load("./scripts/listBares.tmpl.html", function() {
        var baresTemplate = $.templates("#listBares-template");
        app = { entry: barlist };
        var parsedTemplate = baresTemplate.render(app);
        $("#listBares").html(parsedTemplate);
    });
}



;function initLogin() {
    $("#navbarContainer").html('');
    $("#mainContainer").load("./login.html", function(response, status, xhr) {
         if (status == "error") {
            showCustomAlert("Error de cliente", "No se ha podido cargar la página.");
            return;
        }

        $("#loginForm").bind("keypress", function(event) {
            if(event.which == 13) {
                event.preventDefault();
                checkLogin();
            }
        });
        $("#submitLogin").click(function(e) {
            checkLogin(); 
        }); 
    });
}

function checkLogin() {
    if(!($("#loginForm")[0].checkValidity())) {
        $("#loginForm")[0].reportValidity()
    }
    if($('#username').val().length > 0 && $('#password').val().length > 0)
    {
        $.ajax({
            url: serverUrl + '/api.php',
            data: {
                action : 'login',
                formData : $('#loginForm').serialize(),
                apvHash: apvHash
            },
            xhrFields: { withCredentials: true },
            type: 'post',                   
            async: 'true',
            dataType: 'json',
            success: function (result, status, xhr) {
                if(result.code > 0) {
                    localStorage.clear();
                    sessionStorage.clear();
                    sessionStorage.setItem("user", true);
                    if ($("#persistSessionCheck").prop('checked')) {
                        localStorage.setItem("isSessionAlive", true);
                    }
                    initNavbar();
                    initListBares();                        
                } else {
                    switch(result.code) {
                        case (-1):
                            $(".invalid-feedback").removeClass("d-none");
                            $("#loginForm input").addClass("is-invalid");
                            break;
                        case (-2):
                            $("#error-display").text(result.message);
                            $("#error-display").removeClass("d-none");
                            $("#loginForm input").addClass("is-invalid");
                           break;
                        default:
                            showCustomAlert('Error en servidor', result.message);
                            break;
                    }
                }
            },
            error: function (request,error) {  
                showCustomAlert('Error', 'Error de red/servidor. (' + request.statusText + ')');
            }
        });                   
    }       
};function closeSession() {
    $.ajax({
        url: serverUrl + '/api.php',
        data: {action : 'logout',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            localStorage.clear();
            sessionStorage.clear();

            if(result.code == 1) {
                initLogin();
            } else if(result.code == -10) {
                initLogin();
                showCustomAlert("Error en servidor", result.message);
            } else {
                initLogin();
                showCustomAlert('Error en servidor', 'La sesión remota no ha podido ser destruida: ' + result.message);
            }           
        },
        error: function (request,error) {          
            showCustomAlert('Error', 'Error de red/servidor.');
        }
    });
}

function checkSessionAlive() {
    var dfd = jQuery.Deferred();

    $.ajax({
        url: serverUrl + '/api.php',
        data: {
            action : 'isSessionAlive',
        },
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            if(result.code == 1) {
                dfd.resolve();
            } else {
                dfd.reject(result);
            }           
        },
        error: function (request,error) {          
            dfd.reject();
        }
    });

    return dfd.promise();
}
;function initListBares() {
    $("#mainContainer").html('');
    $("#mainContainer").load("./listBares.html", function(response, status, xhr) {
        if (status == "error") {
            showCustomAlert("Error de cliente", "No se ha podido cargar la página.");
            return;
        }
        loadListView();
    });
}

function initInsertBar() {
    $("#mainContainer").html('');
    $("#mainContainer").load("./editorBares.html", function(response, status, xhr) {
         if (status == "error") {
            showCustomAlert("Error de cliente", "No se ha podido cargar la página.");
            return;
        }

        $("#barEditorTitle").text("Nuevo Cofi");
        $("#submitBar").click(function () {
            insertOrUpdateBar();
        });
    });
}

function initBarEditorForId(id) {
    $("#mainContainer").html('');
    $("#mainContainer").load("./editorBares.html", function(response, status, xhr) {
         if (status == "error") {
            showCustomAlert("Error de cliente", "No se ha podido cargar la página.");
            return;
        }

        $("#barEditorTitle").text("Editar Cofi");
        $("#submitBarName").text("Actualizar");

        var barData = $.grep(lastBarList, function(bar, idx) {
            return bar.barId == id;
        });
        
        if (barData.length <= 0) {
            initListBares();
            showCustomAlert("Error en cliente", "El identificador del bar que está intentando editar es incorrecto.");
            return;
        }

        var bar = barData[0];
        $("#name").val(bar.nombre);
        $("#essid").val(bar.essid);
        $("#wifiPass").val(bar.wifiPass);
        $("#location").val(bar.location);
        $("#barIdContainer").html('<input type="hidden" name="barId" id="barId" value="' + bar.barId + '">');

        if(bar.plugs == 1) {
            $("#plugs-true").parent().addClass("active");
            $("#plugs-true").prop('checked', true);
        } else {        
            $("#plugs-false").parent().addClass("active");
            $("#plugs-false").prop('checked', true);                
        }
        

        //Sequence needs to be in order
        $("#submitContainer").html($("#updateStrip").html());
        $("#deleteBar").click(function () {
            deleteBar();
        });
        $("#submitBar").click(function () {
            insertOrUpdateBar();
        });

    });    
};function initNavbar() {
    $("#navbarContainer").load("./navbar.html", function() {
        $("#navbar-logout").click(function() {
            closeSession();
        });     
        $("#navbar-home").click(function() {
            initListBares();
            changeNavbarActive("navbar-home");
        });  
        $("#navbar-insert").click(function() {
            initInsertBar();
            changeNavbarActive("navbar-insert");
        });
        $("#navbar-imagelink").click(function() {
            initListBares();
            changeNavbarActive("navbar-home");
        });
        $("#navbar-home").addClass("active");
    });
}

function changeNavbarActive(activeId) {
    $("#top-navbar .active").removeClass("active");
    $("#" + activeId).addClass("active");
};function insertOrUpdateBar() {
    if(!($("#barEditorForm")[0].checkValidity())) {
        $("#barEditorForm")[0].reportValidity()
    }

    if($('#name').val().length > 0 && $('#essid').val().length > 0 && $('#wifiPass').val().length > 0 && $('#location').val().length > 0)
    {
        if(typeof($('#plugs-radios input:radio:checked').val()) !== "undefined") {
            $.ajax({url: serverUrl + '/api.php',
                data: { action: 'insertOrUpdate', formData: $('#barEditorForm').serialize() },
                type: 'post',                   
                async: 'true',
                dataType: 'json',
                success: function (result) {
                    if(result.code == 1) {
                        initListBares();
                    } else if(result.code == -10) {
                        sessionStorage.clear();
                        initLogin();
                        showCustomAlert("Error en servidor", result.message);
                    } else {
                        showCustomAlert("Error en servidor", result.message);
                    }
                },
                error: function (request,error) {
                    showCustomAlert("Error", "Error de red/servidor.");
                }
            });                   
        } else {
            $('#plugs-false').parent().addClass("active");
            $('#plugs-true').parent().addClass("active");
            setTimeout(function() {
                $('#plugs-false').parent().removeClass("active");
                $('#plugs-true').parent().removeClass("active");
            }, 300);
            console.log("enchufes sin seleccionar");
        }

    } else {
        alert('Campos vacíos');
    }           
    return false; 
}

function deleteBar() {
    var deleteConfirmation = 'Se va a proceder a eliminar el registro.';

    if(confirm(deleteConfirmation))
    {
        if($('#barId').val().length > 0)
        {
                $.ajax({url: serverUrl + '/api.php',
                    data:   {
                        action : 'deleteLocation', 
                        locationId: $('#barId').val()
                        },
                    type: 'post',                   
                    async: 'true',
                    dataType: 'json',
                    success: function (result) {
                        if(result.code == 1) {
                            initListBares();
                        } else if(result.code == -10) {
                            sessionStorage.clear();
                            initLogin();
                            showCustomAlert("Error en servidor", result.message);
                        } else {
                            showCustomAlert('Error en servidor', result.message);
                        }
                    },
                    error: function (request,error) {          
                        showCustomAlert('Error', 'Error de red/servidor.');
                    }
                });                   
        } else {
            showCustomAlert('Error', 'El identificador del bar que desea eliminar no ha podido ser determinado.');
        }
    }           
    return false; 
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyIsImFwcGxpY2F0aW9uLmpzIiwibG9naW4uanMiLCJzZXNzaW9uLWdlc3Rvci5qcyIsImluaXRpYWxpemVycy5qcyIsIm5hdmJhci5qcyIsImNydWQtb3BlcmF0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0EsNkJDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vdmFyIHNlcnZlclVybCA9IFwiaHR0cDovL2RvZ2h1bnRlci5kZG5zLm5ldC92YWtkZXJ0XCI7XG52YXIgc2VydmVyVXJsID0gXCJodHRwOi8vbG9jYWxob3N0L3Zha2RlcnRcIjtcbnZhciBhcHZIYXNoID0gXCJiZXRhLXIxLjAuM1wiOyIsInZhciB1c2VyO1xudmFyIGxhc3RCYXJMaXN0O1xuXG4kKGZ1bmN0aW9uKCkge1xuICAgIGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlclwiKSAhPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaXNTZXNzaW9uQWxpdmVcIikgIT0gbnVsbCkge1xuICAgICAgICAgICAgJC53aGVuKGNoZWNrU2Vzc2lvbkFsaXZlKCkpLmRvbmUoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcInVzZXJcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgICAgIGluaXROYXZiYXIoKTtcbiAgICAgICAgICAgICAgICBpbml0TGlzdEJhcmVzKCk7ICAgICAgICBcbiAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaW5pdExvZ2luKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluaXRMb2dpbigpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdE5hdmJhcigpO1xuICAgICAgICBpbml0TGlzdEJhcmVzKCk7XG4gICAgfVxufSk7XG5cbmZ1bmN0aW9uIHNob3dDdXN0b21BbGVydCh0aXRsZSwgbWVzc2FnZSkge1xuICAgIHZhciB0bXBsID0gJChcIiNtb2RhbC10ZW1wbGF0ZVwiKS5odG1sKCk7XG4gICAgICAgICQoXCIjbW9kYWwtdGVtcGxhdGVcIikubG9hZChcIi4vc2NyaXB0cy9tb2RhbC50bXBsLmh0bWxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtb2RhbFRtcGwgPSAkLnRlbXBsYXRlcyhcIiNtb2RhbC10ZW1wbGF0ZVwiKTtcbiAgICAgICAgYXBwID0geyBcbiAgICAgICAgICAgICAgICBlbnRyeToge1xuICAgICAgICAgICAgICAgICAgICBib2R5Q29udGVudDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBpZiAodGl0bGUgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGFwcC5lbnRyeS5tb2RhbFRpdGxlID0gW3RpdGxlXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyc2VkVGVtcGxhdGUgPSBtb2RhbFRtcGwucmVuZGVyKGFwcCk7XG4gICAgICAgICQoXCIjbW9kYWxDb250YWluZXJcIikuaHRtbChwYXJzZWRUZW1wbGF0ZSk7XG4gICAgICAgICQoXCIjY3VzdG9tTW9kYWxcIikubW9kYWwoJ3Nob3cnKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZExpc3RWaWV3KCkge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogc2VydmVyVXJsICsgJy9hcGkucGhwJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYWN0aW9uIDogJ3Nob3dMaXN0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdwb3N0JywgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmKHR5cGVvZihyZXN1bHQuY29kZSkgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdFtpXS5wbHVncyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVnc0RhdGEgPSAnZmEgZmEtcGx1ZyBmYS1mdyc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZihyZXN1bHRbaV0ucGx1Z3MgPT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGx1Z3NEYXRhID0gJ2ZhIGZhLWNsb2NrLW8gZmEtZncnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGx1Z3NEYXRhID0gJ2ZhIGZhLWJhdHRlcnktZnVsbCBmYS1mdyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLnBsdWdzQ2xhc3MgPSBwbHVnc0RhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgbGFzdEJhckxpc3QgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICByZW5kZXJCYXJMaXN0KHJlc3VsdCk7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmKHJlc3VsdC5jb2RlID09IC0xMCkge1xuICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgaW5pdExvZ2luKCk7XG4gICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiU2VzacOzbiBDYWR1Y2FkYVwiLCBcIkluaWNlIHNlc2nDs24gcGFyYSBhY2NlZGVyIGFsIGNvbnRlbmlkby5cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dDdXN0b21BbGVydChcIkVycm9yIGRlIHNlcnZpZG9yXCIsIHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXF1ZXN0LGVycm9yKSB7ICAgICAgICAgIFxuICAgICAgICAgICAgYWxlcnQoJ0Vycm9yIGRlIHJlZC9zZXJ2aWRvci4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJCYXJMaXN0KGJhcmxpc3QpIHtcbiAgICQoXCIjbGlzdEJhcmVzLXRlbXBsYXRlXCIpLmxvYWQoXCIuL3NjcmlwdHMvbGlzdEJhcmVzLnRtcGwuaHRtbFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJhcmVzVGVtcGxhdGUgPSAkLnRlbXBsYXRlcyhcIiNsaXN0QmFyZXMtdGVtcGxhdGVcIik7XG4gICAgICAgIGFwcCA9IHsgZW50cnk6IGJhcmxpc3QgfTtcbiAgICAgICAgdmFyIHBhcnNlZFRlbXBsYXRlID0gYmFyZXNUZW1wbGF0ZS5yZW5kZXIoYXBwKTtcbiAgICAgICAgJChcIiNsaXN0QmFyZXNcIikuaHRtbChwYXJzZWRUZW1wbGF0ZSk7XG4gICAgfSk7XG59XG5cblxuXG4iLCJmdW5jdGlvbiBpbml0TG9naW4oKSB7XG4gICAgJChcIiNuYXZiYXJDb250YWluZXJcIikuaHRtbCgnJyk7XG4gICAgJChcIiNtYWluQ29udGFpbmVyXCIpLmxvYWQoXCIuL2xvZ2luLmh0bWxcIiwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cywgeGhyKSB7XG4gICAgICAgICBpZiAoc3RhdHVzID09IFwiZXJyb3JcIikge1xuICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiRXJyb3IgZGUgY2xpZW50ZVwiLCBcIk5vIHNlIGhhIHBvZGlkbyBjYXJnYXIgbGEgcMOhZ2luYS5cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKFwiI2xvZ2luRm9ybVwiKS5iaW5kKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09IDEzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjaGVja0xvZ2luKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkKFwiI3N1Ym1pdExvZ2luXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNoZWNrTG9naW4oKTsgXG4gICAgICAgIH0pOyBcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tMb2dpbigpIHtcbiAgICBpZighKCQoXCIjbG9naW5Gb3JtXCIpWzBdLmNoZWNrVmFsaWRpdHkoKSkpIHtcbiAgICAgICAgJChcIiNsb2dpbkZvcm1cIilbMF0ucmVwb3J0VmFsaWRpdHkoKVxuICAgIH1cbiAgICBpZigkKCcjdXNlcm5hbWUnKS52YWwoKS5sZW5ndGggPiAwICYmICQoJyNwYXNzd29yZCcpLnZhbCgpLmxlbmd0aCA+IDApXG4gICAge1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBzZXJ2ZXJVcmwgKyAnL2FwaS5waHAnLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGFjdGlvbiA6ICdsb2dpbicsXG4gICAgICAgICAgICAgICAgZm9ybURhdGEgOiAkKCcjbG9naW5Gb3JtJykuc2VyaWFsaXplKCksXG4gICAgICAgICAgICAgICAgYXB2SGFzaDogYXB2SGFzaFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHhockZpZWxkczogeyB3aXRoQ3JlZGVudGlhbHM6IHRydWUgfSxcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JywgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhc3luYzogJ3RydWUnLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXN1bHQsIHN0YXR1cywgeGhyKSB7XG4gICAgICAgICAgICAgICAgaWYocmVzdWx0LmNvZGUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQoXCIjcGVyc2lzdFNlc3Npb25DaGVja1wiKS5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaXNTZXNzaW9uQWxpdmVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaW5pdE5hdmJhcigpO1xuICAgICAgICAgICAgICAgICAgICBpbml0TGlzdEJhcmVzKCk7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHJlc3VsdC5jb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICgtMSk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5pbnZhbGlkLWZlZWRiYWNrXCIpLnJlbW92ZUNsYXNzKFwiZC1ub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbG9naW5Gb3JtIGlucHV0XCIpLmFkZENsYXNzKFwiaXMtaW52YWxpZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgKC0yKTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI2Vycm9yLWRpc3BsYXlcIikudGV4dChyZXN1bHQubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNlcnJvci1kaXNwbGF5XCIpLnJlbW92ZUNsYXNzKFwiZC1ub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbG9naW5Gb3JtIGlucHV0XCIpLmFkZENsYXNzKFwiaXMtaW52YWxpZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93Q3VzdG9tQWxlcnQoJ0Vycm9yIGVuIHNlcnZpZG9yJywgcmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAocmVxdWVzdCxlcnJvcikgeyAgXG4gICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KCdFcnJvcicsICdFcnJvciBkZSByZWQvc2Vydmlkb3IuICgnICsgcmVxdWVzdC5zdGF0dXNUZXh0ICsgJyknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgIFxuICAgIH0gICAgICAgXG59IiwiZnVuY3Rpb24gY2xvc2VTZXNzaW9uKCkge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogc2VydmVyVXJsICsgJy9hcGkucGhwJyxcbiAgICAgICAgZGF0YToge2FjdGlvbiA6ICdsb2dvdXQnLH0sXG4gICAgICAgIHR5cGU6ICdwb3N0JywgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKTtcblxuICAgICAgICAgICAgaWYocmVzdWx0LmNvZGUgPT0gMSkge1xuICAgICAgICAgICAgICAgIGluaXRMb2dpbigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHJlc3VsdC5jb2RlID09IC0xMCkge1xuICAgICAgICAgICAgICAgIGluaXRMb2dpbigpO1xuICAgICAgICAgICAgICAgIHNob3dDdXN0b21BbGVydChcIkVycm9yIGVuIHNlcnZpZG9yXCIsIHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5pdExvZ2luKCk7XG4gICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KCdFcnJvciBlbiBzZXJ2aWRvcicsICdMYSBzZXNpw7NuIHJlbW90YSBubyBoYSBwb2RpZG8gc2VyIGRlc3RydWlkYTogJyArIHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0gICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHJlcXVlc3QsZXJyb3IpIHsgICAgICAgICAgXG4gICAgICAgICAgICBzaG93Q3VzdG9tQWxlcnQoJ0Vycm9yJywgJ0Vycm9yIGRlIHJlZC9zZXJ2aWRvci4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja1Nlc3Npb25BbGl2ZSgpIHtcbiAgICB2YXIgZGZkID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHNlcnZlclVybCArICcvYXBpLnBocCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGFjdGlvbiA6ICdpc1Nlc3Npb25BbGl2ZScsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdwb3N0JywgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmKHJlc3VsdC5jb2RlID09IDEpIHtcbiAgICAgICAgICAgICAgICBkZmQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZmQucmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICB9ICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXF1ZXN0LGVycm9yKSB7ICAgICAgICAgIFxuICAgICAgICAgICAgZGZkLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGZkLnByb21pc2UoKTtcbn1cbiIsImZ1bmN0aW9uIGluaXRMaXN0QmFyZXMoKSB7XG4gICAgJChcIiNtYWluQ29udGFpbmVyXCIpLmh0bWwoJycpO1xuICAgICQoXCIjbWFpbkNvbnRhaW5lclwiKS5sb2FkKFwiLi9saXN0QmFyZXMuaHRtbFwiLCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzLCB4aHIpIHtcbiAgICAgICAgaWYgKHN0YXR1cyA9PSBcImVycm9yXCIpIHtcbiAgICAgICAgICAgIHNob3dDdXN0b21BbGVydChcIkVycm9yIGRlIGNsaWVudGVcIiwgXCJObyBzZSBoYSBwb2RpZG8gY2FyZ2FyIGxhIHDDoWdpbmEuXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRMaXN0VmlldygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0SW5zZXJ0QmFyKCkge1xuICAgICQoXCIjbWFpbkNvbnRhaW5lclwiKS5odG1sKCcnKTtcbiAgICAkKFwiI21haW5Db250YWluZXJcIikubG9hZChcIi4vZWRpdG9yQmFyZXMuaHRtbFwiLCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzLCB4aHIpIHtcbiAgICAgICAgIGlmIChzdGF0dXMgPT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgICBzaG93Q3VzdG9tQWxlcnQoXCJFcnJvciBkZSBjbGllbnRlXCIsIFwiTm8gc2UgaGEgcG9kaWRvIGNhcmdhciBsYSBww6FnaW5hLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoXCIjYmFyRWRpdG9yVGl0bGVcIikudGV4dChcIk51ZXZvIENvZmlcIik7XG4gICAgICAgICQoXCIjc3VibWl0QmFyXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGluc2VydE9yVXBkYXRlQmFyKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0QmFyRWRpdG9yRm9ySWQoaWQpIHtcbiAgICAkKFwiI21haW5Db250YWluZXJcIikuaHRtbCgnJyk7XG4gICAgJChcIiNtYWluQ29udGFpbmVyXCIpLmxvYWQoXCIuL2VkaXRvckJhcmVzLmh0bWxcIiwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cywgeGhyKSB7XG4gICAgICAgICBpZiAoc3RhdHVzID09IFwiZXJyb3JcIikge1xuICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiRXJyb3IgZGUgY2xpZW50ZVwiLCBcIk5vIHNlIGhhIHBvZGlkbyBjYXJnYXIgbGEgcMOhZ2luYS5cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKFwiI2JhckVkaXRvclRpdGxlXCIpLnRleHQoXCJFZGl0YXIgQ29maVwiKTtcbiAgICAgICAgJChcIiNzdWJtaXRCYXJOYW1lXCIpLnRleHQoXCJBY3R1YWxpemFyXCIpO1xuXG4gICAgICAgIHZhciBiYXJEYXRhID0gJC5ncmVwKGxhc3RCYXJMaXN0LCBmdW5jdGlvbihiYXIsIGlkeCkge1xuICAgICAgICAgICAgcmV0dXJuIGJhci5iYXJJZCA9PSBpZDtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYmFyRGF0YS5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgaW5pdExpc3RCYXJlcygpO1xuICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiRXJyb3IgZW4gY2xpZW50ZVwiLCBcIkVsIGlkZW50aWZpY2Fkb3IgZGVsIGJhciBxdWUgZXN0w6EgaW50ZW50YW5kbyBlZGl0YXIgZXMgaW5jb3JyZWN0by5cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmFyID0gYmFyRGF0YVswXTtcbiAgICAgICAgJChcIiNuYW1lXCIpLnZhbChiYXIubm9tYnJlKTtcbiAgICAgICAgJChcIiNlc3NpZFwiKS52YWwoYmFyLmVzc2lkKTtcbiAgICAgICAgJChcIiN3aWZpUGFzc1wiKS52YWwoYmFyLndpZmlQYXNzKTtcbiAgICAgICAgJChcIiNsb2NhdGlvblwiKS52YWwoYmFyLmxvY2F0aW9uKTtcbiAgICAgICAgJChcIiNiYXJJZENvbnRhaW5lclwiKS5odG1sKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJiYXJJZFwiIGlkPVwiYmFySWRcIiB2YWx1ZT1cIicgKyBiYXIuYmFySWQgKyAnXCI+Jyk7XG5cbiAgICAgICAgaWYoYmFyLnBsdWdzID09IDEpIHtcbiAgICAgICAgICAgICQoXCIjcGx1Z3MtdHJ1ZVwiKS5wYXJlbnQoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICQoXCIjcGx1Z3MtdHJ1ZVwiKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7ICAgICAgICBcbiAgICAgICAgICAgICQoXCIjcGx1Z3MtZmFsc2VcIikucGFyZW50KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAkKFwiI3BsdWdzLWZhbHNlXCIpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTsgICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICAgICAgLy9TZXF1ZW5jZSBuZWVkcyB0byBiZSBpbiBvcmRlclxuICAgICAgICAkKFwiI3N1Ym1pdENvbnRhaW5lclwiKS5odG1sKCQoXCIjdXBkYXRlU3RyaXBcIikuaHRtbCgpKTtcbiAgICAgICAgJChcIiNkZWxldGVCYXJcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVsZXRlQmFyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKFwiI3N1Ym1pdEJhclwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpbnNlcnRPclVwZGF0ZUJhcigpO1xuICAgICAgICB9KTtcblxuICAgIH0pOyAgICBcbn0iLCJmdW5jdGlvbiBpbml0TmF2YmFyKCkge1xuICAgICQoXCIjbmF2YmFyQ29udGFpbmVyXCIpLmxvYWQoXCIuL25hdmJhci5odG1sXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI25hdmJhci1sb2dvdXRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjbG9zZVNlc3Npb24oKTtcbiAgICAgICAgfSk7ICAgICBcbiAgICAgICAgJChcIiNuYXZiYXItaG9tZVwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGluaXRMaXN0QmFyZXMoKTtcbiAgICAgICAgICAgIGNoYW5nZU5hdmJhckFjdGl2ZShcIm5hdmJhci1ob21lXCIpO1xuICAgICAgICB9KTsgIFxuICAgICAgICAkKFwiI25hdmJhci1pbnNlcnRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbml0SW5zZXJ0QmFyKCk7XG4gICAgICAgICAgICBjaGFuZ2VOYXZiYXJBY3RpdmUoXCJuYXZiYXItaW5zZXJ0XCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgJChcIiNuYXZiYXItaW1hZ2VsaW5rXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5pdExpc3RCYXJlcygpO1xuICAgICAgICAgICAgY2hhbmdlTmF2YmFyQWN0aXZlKFwibmF2YmFyLWhvbWVcIik7XG4gICAgICAgIH0pO1xuICAgICAgICAkKFwiI25hdmJhci1ob21lXCIpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VOYXZiYXJBY3RpdmUoYWN0aXZlSWQpIHtcbiAgICAkKFwiI3RvcC1uYXZiYXIgLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAkKFwiI1wiICsgYWN0aXZlSWQpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xufSIsImZ1bmN0aW9uIGluc2VydE9yVXBkYXRlQmFyKCkge1xuICAgIGlmKCEoJChcIiNiYXJFZGl0b3JGb3JtXCIpWzBdLmNoZWNrVmFsaWRpdHkoKSkpIHtcbiAgICAgICAgJChcIiNiYXJFZGl0b3JGb3JtXCIpWzBdLnJlcG9ydFZhbGlkaXR5KClcbiAgICB9XG5cbiAgICBpZigkKCcjbmFtZScpLnZhbCgpLmxlbmd0aCA+IDAgJiYgJCgnI2Vzc2lkJykudmFsKCkubGVuZ3RoID4gMCAmJiAkKCcjd2lmaVBhc3MnKS52YWwoKS5sZW5ndGggPiAwICYmICQoJyNsb2NhdGlvbicpLnZhbCgpLmxlbmd0aCA+IDApXG4gICAge1xuICAgICAgICBpZih0eXBlb2YoJCgnI3BsdWdzLXJhZGlvcyBpbnB1dDpyYWRpbzpjaGVja2VkJykudmFsKCkpICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAkLmFqYXgoe3VybDogc2VydmVyVXJsICsgJy9hcGkucGhwJyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7IGFjdGlvbjogJ2luc2VydE9yVXBkYXRlJywgZm9ybURhdGE6ICQoJyNiYXJFZGl0b3JGb3JtJykuc2VyaWFsaXplKCkgfSxcbiAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGFzeW5jOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5jb2RlID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMaXN0QmFyZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKHJlc3VsdC5jb2RlID09IC0xMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMb2dpbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiRXJyb3IgZW4gc2Vydmlkb3JcIiwgcmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiRXJyb3IgZW4gc2Vydmlkb3JcIiwgcmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHJlcXVlc3QsZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KFwiRXJyb3JcIiwgXCJFcnJvciBkZSByZWQvc2Vydmlkb3IuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJyNwbHVncy1mYWxzZScpLnBhcmVudCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgJCgnI3BsdWdzLXRydWUnKS5wYXJlbnQoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCgnI3BsdWdzLWZhbHNlJykucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgJCgnI3BsdWdzLXRydWUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVuY2h1ZmVzIHNpbiBzZWxlY2Npb25hclwiKTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ0NhbXBvcyB2YWPDrW9zJyk7XG4gICAgfSAgICAgICAgICAgXG4gICAgcmV0dXJuIGZhbHNlOyBcbn1cblxuZnVuY3Rpb24gZGVsZXRlQmFyKCkge1xuICAgIHZhciBkZWxldGVDb25maXJtYXRpb24gPSAnU2UgdmEgYSBwcm9jZWRlciBhIGVsaW1pbmFyIGVsIHJlZ2lzdHJvLic7XG5cbiAgICBpZihjb25maXJtKGRlbGV0ZUNvbmZpcm1hdGlvbikpXG4gICAge1xuICAgICAgICBpZigkKCcjYmFySWQnKS52YWwoKS5sZW5ndGggPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHt1cmw6IHNlcnZlclVybCArICcvYXBpLnBocCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uIDogJ2RlbGV0ZUxvY2F0aW9uJywgXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbklkOiAkKCcjYmFySWQnKS52YWwoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLCAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYXN5bmM6ICd0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzdWx0LmNvZGUgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMaXN0QmFyZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZihyZXN1bHQuY29kZSA9PSAtMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRMb2dpbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dDdXN0b21BbGVydChcIkVycm9yIGVuIHNlcnZpZG9yXCIsIHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KCdFcnJvciBlbiBzZXJ2aWRvcicsIHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXF1ZXN0LGVycm9yKSB7ICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0N1c3RvbUFsZXJ0KCdFcnJvcicsICdFcnJvciBkZSByZWQvc2Vydmlkb3IuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaG93Q3VzdG9tQWxlcnQoJ0Vycm9yJywgJ0VsIGlkZW50aWZpY2Fkb3IgZGVsIGJhciBxdWUgZGVzZWEgZWxpbWluYXIgbm8gaGEgcG9kaWRvIHNlciBkZXRlcm1pbmFkby4nKTtcbiAgICAgICAgfVxuICAgIH0gICAgICAgICAgIFxuICAgIHJldHVybiBmYWxzZTsgXG59Il19
