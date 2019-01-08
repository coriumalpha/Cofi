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