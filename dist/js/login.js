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
            xhrFields: { withCredentials: true },
            type: 'post',                   
            async: 'true',
            dataType: 'json',
            success: function (result, status, xhr) {
                if(result.code > 0) {
                    localStorage.clear();
                    sessionStorage.clear();
                    sessionStorage.setItem("user", true);
                    if ($("#persistSessionCheck").prop('checked')) {
                        localStorage.setItem("isSessionAlive", true);
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