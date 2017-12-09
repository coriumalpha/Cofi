var serverUrl = "http://doghunter.ddns.net/vakdert";
//var serverUrl = "http://localhost/vakdert";
var apvHash = "SJgO8t9SUmPstxxIgh1NHdSOgVvJC36KcVXP43bShpNerRGzaRttSD9AAJgHpvam";
var user;
var lastBarList;

$(function() {
    if (sessionStorage.getItem("user") !== "true" || document.cookie.length <= 0) {
        if (localStorage.getItem("PHPSESSID") != null) {
            Cookies.set("PHPSESSID", localStorage.getItem("PHPSESSID"));
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

function initNavbar() {
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
}

function initLogin() {
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

function initListBares() {
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
            type: 'post',                   
            async: 'true',
            dataType: 'json',
            success: function (result) {
                if(result.code > 0) {
                    localStorage.clear();
                    sessionStorage.clear();
                    sessionStorage.setItem("user", true);
                    if ($("#persistSessionCheck").prop('checked')) {
                        localStorage.setItem("PHPSESSID", Cookies.get("PHPSESSID"));
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

function closeSession() {
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


function insertOrUpdateBar() {
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



