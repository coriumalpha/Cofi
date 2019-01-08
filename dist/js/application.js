var user;
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
    var filterValue = $("#filterInput").val();

    $.ajax({
        url: serverUrl + '/api.php',
        data: {
            action : 'showList',
            filters: filterValue,
            },
        type: 'post',                   
        async: 'true',
        dataType: 'json',
        success: function (result) {
            if (filterValue.length > 0 && result == null) {
                var emptyContent = '  <div class="alert bg-light" role="alert"> \
                                            No se ha encontrado ningún bar. \
                                            <span class="close-fa"><i class="fa fa-frown-o" aria-hidden="true"></i></span> \
                                        </div>';

                $("#listBares").html(emptyContent);

            } else if(typeof(result.code) == "undefined") {
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



