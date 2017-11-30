//var serverUrl = "http://doghunter.ddns.net/vakdert";
var serverUrl = "http://localhost/vakdert";
var user;
var lastBarList;

$(function() {
    if (sessionStorage.getItem("user") !== "true") {
        initLogin();
    } else {
        initNavbar();
        initListBares();
    }
});

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
    $("#mainContainer").load("./login.html", function() {
        $("#submitLogin").click(function(e) {
            checkLogin(); 
        }); 
    });
}

function initListBares() {
    $("#mainContainer").load("./listBares.html", function() {
        loadListView();
    });
}

function initInsertBar() {
    $("#mainContainer").load("./editorBares.html", function() {
        $("#submitBar").click(function () {
            insertOrUpdateBar();
        });
    });
}

function initBarEditorForId(id) {
    $("#mainContainer").load("./editorBares.html", function() {
        $("#submitBarName").text("Actualizar");

        var barData = $.grep(lastBarList, function(bar, idx) {
            return bar.barId == id;
        });
        
        if (barData.length <= 0) { //TODO: Handle error
            initListBares(); //Miedo me da esto...
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

function checkLogin() {
    if(!($("#loginForm")[0].checkValidity())) {
        $("#loginForm")[0].reportValidity()
    }
    if($('#username').val().length > 0 && $('#password').val().length > 0)
    {
        $.ajax({url: serverUrl + '/api.php',
            data: {action : 'login', formData : $('#loginForm').serialize()},
            type: 'post',                   
            async: 'true',
            dataType: 'json',
            success: function (result) {
                if(result.status) {
                    sessionStorage.setItem("user", true);
                    initNavbar();
                    initListBares();                        
                } else {
                    $(".invalid-feedback").removeClass("d-none");
                    $("#loginForm input").addClass("is-invalid");
                }
            },
            error: function (request,error) {          
                console.log('Error de red/servidor. (' + request.statusText + ')');
            }
        });                   
    }       
}

function loadListView() {
    $.ajax({url: serverUrl + '/api.php',
        data: {action : 'showList',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
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
    $.ajax({url: serverUrl + '/api.php',
        data: {action : 'logout',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            if(result.status) {
                sessionStorage.clear();
                initLogin()
            } else {
                console.log("Cannot logout");
            }           
        },
        error: function (request,error) {          
            alert('Error de red/servidor.');
        }
    });
}


function loadDetailedView(id) {

    $.mobile.changePage( "#siteDetails", { transition: "slidefade"});

    $.ajax({url: serverUrl + '/api.php',
        data: {action : 'showDetailed', ident : id,},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            $('#tableDetailsContent').html("");
            /*$.each(result[0], function(key, result))
            {*/
                $.each(result[0], function(name, value)
                {
                    switch(name)
                    {
                        case "nombre":
                            $('#u_name').val(value);
                            return;
                        case "plugs":
                            $('#u_' + name).val(value).flipswitch('refresh');
                            return;
                        case "idHost":
                            return;
                    }
                    $('#u_' + name).val(value);
                });
            //}
            //$('#listView').listview('refresh');              
        },
        error: function (request,error) {          
            alert('Error de red/servidor.');
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
                    if(result.status) {
                        initListBares();
                    } else {
                        console.log(result.message); 
                    }
                },
                error: function (request,error) {          
                    console.log('Error de red/servidor.');
                }
            });                   
        } else {
            //TODO: Sustituir por outline de error de validación consitente con el resto de elementos
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
                        if(result.status) {
                            initListBares();
                        } else {
                            alert(result.message); 
                        }
                    },
                    error: function (request,error) {          
                        alert('Error de red/servidor.');
                    }
                });                   
        } else {
            alert('Campos vacíos');
        }
    }           
    return false; 
}



