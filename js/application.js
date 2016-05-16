

$(document).on('pageinit', '#login', function()
{  
    $(document).on('click', '#submit', function()
    { 
        if($('#username').val().length > 0 && $('#password').val().length > 0)
        {
                $.ajax({url: 'http://raspi.hol.es/api.php',
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
                $.ajax({url: 'http://raspi.hol.es/api.php',
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
    $.ajax({url: 'http://raspi.hol.es/api.php',
        data: {action : 'showList',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
                $('#listView').html("");
            for (var i = 0; i < result.length; i++) {
                $('#listView').append(
                    '<li><a onclick="loadDetailedView('+result[i].barId+')"><i class="' +result[i].plugs+ '"></i>  '+result[i].nombre+
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
    $.ajax({url: 'http://raspi.hol.es/api.php',
        data: {action : 'logout',},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            if(result.status)
            {
                alert("Sesión destruída.");
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

    $.ajax({url: 'http://raspi.hol.es/api.php',
        data: {action : 'showDetailed', ident : id,},
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
                $('#detailedView').html("");
                $('#detailedView').append(
                        result[0].nombre
                    );
                $('#listView').listview('refresh');              
        },
        error: function (request,error) {          
            alert('Error de red/servidor.');
        }
    });
}

