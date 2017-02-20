var serverUrl = "http://doghunter.ddns.net/vakdert"



$(document).on('pageinit', '#login', function()
{  
    $(document).on('click', '#submit', function()
    { 
        if($('#username').val().length > 0 && $('#password').val().length > 0)
        {
                $.ajax({url: serverUrl + '/api.php',
                    data: {action : 'login', formData : $('#loginForm').serialize()},
                    type: 'post',                   
                    async: 'true',
                    dataType: 'json',
                    success: function (result) {
                        if(result.status) {
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


function loadListView()
{
    $.ajax({url: serverUrl + '/api.php',
        data: {action : 'showList',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
                $('#listView').html("");
            for (var i = 0; i < result.length; i++) {

                if(result[i].plugs == 1)
                {
                    plugsData = 'fa fa-plug fa-fw';
                }
                else if(result[i].plugs == 2)
                {
                    plugsData = 'fa fa-clock-o fa-fw';
                }
                else
                {
                    plugsData = 'fa fa-battery-full fa-fw';
                }

                $('#listView').append(
                    '<li><a onclick="loadDetailedView('+result[i].barId+')"><i class="' +plugsData+ '"></i>  '+result[i].nombre+
                    '<p><b>' +result[i].essid+ '</b> : '  +result[i].wifiPass+ 
                    '</p><p>' +result[i].location+ '</p></a>' +
                    '</li>'
                    );
            }
            $('#listView').listview('refresh');              
        },
        error: function (request,error) {          
            alert('Error de red/servidor.');
        }
    });
}


$(document).on('pageinit', '#siteList', function()
{
    loadListView();
});


function closeSession()
{
    $.ajax({url: serverUrl + '/api.php',
        data: {action : 'logout',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            if(result.status)
            {
                //alert("Sesión destruída.");
                $.mobile.changePage("#login");
            }
            else
            {
                alert("Error al destruir sesión.");
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
                        case "plugs":
                            $('#u_' + name).val(value).flipswitch('refresh');
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

