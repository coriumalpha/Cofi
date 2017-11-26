//var serverUrl = "http://doghunter.ddns.net/vakdert";
var serverUrl = "http://localhost/vakdert";
var user;

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
            insertBar();
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
                result[i].plugs = plugsData;
            }
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


function insertBar() {
    if(!($("#barEditorForm")[0].checkValidity())) {
        $("#barEditorForm")[0].reportValidity()
    }

    if($('#name').val().length > 0 && $('#essid').val().length > 0 && $('#wifiPass').val().length > 0 && $('#location').val().length > 0)
    {
            $.ajax({url: serverUrl + '/api.php',
                data: { action: 'insert', formData: $('#barEditorForm').serialize() },
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
        alert('Campos vacíos');
    }           
    return false; 
}


$(document).on('pageinit', '#siteDetails', function()
{  
    $(document).on('click', '#u_submit', function()
    { 
        if($('#u_name').val().length > 0 && $('#u_essid').val().length > 0 && $('#u_wifiPass').val().length > 0 && $('#u_location').val().length > 0 && $('#u_barId').val().length > 0)
        {
                $.ajax({url: serverUrl + '/api.php',
                    data: {action : 'insert', formData : $('#updateForm').serialize()},
                    type: 'post',                   
                    async: 'true',
                    dataType: 'json',
                    success: function (result) {
                        if(result.status) {
                            loadListView();
                            $.mobile.changePage("#siteList");
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
        return false; 
    });    
});


$(document).on('pageinit', '#siteDetails', function()
{  
    $(document).on('click', '#u_delete', function()
    { 
        var deleteConfirmation = 'Se va a proceder a eliminar el registro.';

        if(confirm(deleteConfirmation))
        {
            if($('#u_barId').val().length > 0)
            {
                    $.ajax({url: serverUrl + '/api.php',
                        data:   {
                            action : 'deleteLocation', 
                            locationId: $('#u_barId').val()
                            },
                        type: 'post',                   
                        async: 'true',
                        dataType: 'json',
                        success: function (result) {
                            if(result.status) {
                                loadListView();
                                $.mobile.changePage("#siteList");
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
    });    
});




