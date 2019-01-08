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
