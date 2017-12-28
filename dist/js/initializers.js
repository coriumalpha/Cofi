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