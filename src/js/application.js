var serverUrl = "http://localhost/vakdert";
var user;

function tryLogin()
{
    //if($('#username').val().length > 0 && $('#password').val().length > 0)
    //{
        $.ajax({url: serverUrl + '/api.php',
            //data: {action : 'login', formData : $('#loginForm').serialize()},
            data: {action : 'login', formData : "username=root&password=totoro"},
            type: 'post',                   
            async: 'true',
            dataType: 'json',
            success: function (result) {
                if(result.status) {
                    alert("Session created")                         
                } else {
                    alert(result.message); 
                }
            },
            error: function (request,error) {          
                alert('Error de red/servidor. (' + request.statusText + ')');
            }
        });                   
    /*}
    else
    {
        alert('Campos vacíos');
    } */          
    return false; 
}

function renderLoginPage() {
    
}

function loadListView()
{
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
    var baresTemplate = $.templates("#listBares-template");
    app = { entry: barlist };
    var parsedTemplate = baresTemplate.render(app);
    $("#listBares").html(parsedTemplate);
}

function closeSession()
{
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


//$('#detailedView').onload = loadDetailedView();

function loadDetailedView(id)
{

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

$(document).on('pageinit', '#insert', function()
{  
    $(document).on('click', '#submit', function()
    { 
        if($('#name').val().length > 0 && $('#essid').val().length > 0 && $('#wifiPass').val().length > 0 && $('#location').val().length > 0)
        {
                $.ajax({url: serverUrl + '/api.php',
                    data: {action : 'insert', formData : $('#insertForm').serialize()},
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




