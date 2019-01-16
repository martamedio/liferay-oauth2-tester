var TOKEN = "";
var REFRESH_TOKEN = "";

/*
 * Step 1: Obtain Authorization Code from Liferay Configured Application with ClientID (Callback URL must be this application)
 */
function getAuthorizationCode() {
    if ($('#authForm').valid()) {
        var clientId = $('#clientId').val();
        var liferayUrl = $('#liferayUrl').val();
        var redirectUri = encodeURIComponent(window.location.href + "?url=" + liferayUrl + "&client_id=" + clientId);
        window.location.href = $('#liferayUrl').val() + $('#authorizeUrl').val() + ("?client_id={0}&response_type=code&redirect_uri={1}".replace("{0}", clientId)).replace("{1}", redirectUri);
    }
}

$(document).ready(function() {

    $("#callbackURI").text(location.origin + location.pathname);

    /*
     * Recover Auth Code from URL and Obtain Token 
     */
    var urlParams = function getCodeParameter(parameterName) {
        var pageUrl = window.location.search.substring(1);
        var variablesUrl = pageUrl.split('&');
        for (var i = 0; i < variablesUrl.length; i++) {
            var parameter = variablesUrl[i].split('=');
            if (parameter[0] == parameterName) {
                return parameter[1];
            }
        }
    }

    if (urlParams('code')) {
        $('#collapseOne').hide();
        $('#auth > h2 > button').css('color', 'green');
        $('#collapseTwo').show();

        $('#code').val(urlParams('code'));
        $('#tokenLiferayUrl').val(unescape(urlParams('url')));
        $('#tokenClientId').val(urlParams('client_id'));
    }


    /*
     * Function to generate parameter fields dynamically
     */
    var parameterCount = 1;
    $("#addParameter").click(function(e) {
        e.preventDefault();
        var addName = "paramName" + parameterCount;
        var addValue = "paramValue" + parameterCount;

        var newName = $('<div class="col"><input type="text" id="' + addName + '" placeholder="Name" class="form-control form-control-sm" /></div>');
        var newValue = $('<div class="col"><input type="text" id="' + addValue + '" placeholder="Value" class="form-control form-control-sm" /></div>');

        var newSection = $('<div class="row" id="param' + parameterCount + '">');
        newSection.append(newName);
        newSection.append(newValue);
        $('#parametersList').append(newSection);

        parameterCount++;
    });
});

/*
 * Step 2: Obtain OAuth2 Token
 */
function getToken() {
    if ($('#tokenForm').valid()) {
        var locationUrl = location.protocol + '//' + location.host + location.pathname;
        $.ajax({
            url: $('#tokenLiferayUrl').val() + $('#tokenUrl').val(),
            method: 'POST',
            data: {
                client_id: $('#tokenClientId').val(),
                client_secret: $('#clientSecretId').val(),
                grant_type: 'authorization_code',
                code: $('#code').val(),
                redirect_uri: locationUrl + "?url=" + $('#tokenLiferayUrl').val() + "&client_id=" + $('#tokenClientId').val()
            },
            contentType: 'application/x-www-form-urlencoded',
            headers: {
                Accept: "application/json"
            },
            dataType: 'json',
            success: function(data) {
                TOKEN = data.access_token;
                REFRESH_TOKEN = data.refresh_token;
                $('#token').val(TOKEN);
                $('#refreshToken').val(REFRESH_TOKEN);
                $('#collapseTwo').hide();
                $('#tokenTab > h2 > button').css('color', 'green');
                $('#collapseThree').show();
            },
            error: function(data) {
                alert("There's a problem with your authorization access");
                console.log(data);
            }

        });
    }
}

/*
 * Introspect Token
 */
function introspectAccessToken(e) {
    e.preventDefault();
    $.ajax({
        url: $('#tokenLiferayUrl').val() + "/o/oauth2/introspect",
        method: 'POST',
        data: {
            client_id: $('#tokenClientId').val(),
            client_secret: $('#clientSecretId').val(),
            token: $('#token').val(),
            token_type_hint: 'access_token'
        },
        crossDomain: true,
        contentType: 'application/x-www-form-urlencoded',
        headers: {
            Accept: "application/json"
        },
        dataType: 'json',
        success: function(data) {
            $('#result').html(JSON.stringify(data));
        },
        error: function(data) {
            alert("There's a problem with your authorization access");
            console.log(data);
        }

    });
}

function introspectRefreshToken(e) {
    e.preventDefault();
    $.ajax({
        url: $('#tokenLiferayUrl').val() + "/o/oauth2/introspect",
        method: 'POST',
        data: {
            client_id: $('#tokenClientId').val(),
            client_secret: $('#clientSecretId').val(),
            token: $('#refreshToken').val(),
            token_type_hint: 'refresh_token'
        },
        crossDomain: true,
        contentType: 'application/x-www-form-urlencoded',
        headers: {
            Accept: "application/json"
        },
        dataType: 'json',
        success: function(data) {
            $('#result').html(JSON.stringify(data));
        },
        error: function(data) {
            alert("There's a problem with your authorization access");
            console.log(data);
        }

    });
}


/*
 * Refresh Token
 */
function refreshAccessToken(e) {
    e.preventDefault();
    $.ajax({
        url: $('#tokenLiferayUrl').val() + $('#tokenUrl').val(),
        method: 'POST',
        data: {
            client_id: $('#tokenClientId').val(),
            client_secret: $('#clientSecretId').val(),
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token',
        },
        crossDomain: true,
        contentType: 'application/x-www-form-urlencoded',
        headers: {
            Accept: "application/json"
        },
        dataType: 'json',
        success: function(data) {
            TOKEN = data.access_token;
            REFRESH_TOKEN = data.refresh_token;
            $('#token').val(TOKEN);
            $('#refreshToken').val(REFRESH_TOKEN);
        },
        error: function(data) {
            alert("There's a problem with your authorization access");
            console.log(data);
        }

    });
}
/*
 * Step 3: Make Request
 */
function request(e) {
    e.preventDefault();
    $('#result').html('');
    var paramsData = getParamsData();
    $.ajax({
        url: $('#url').val(),
        method: $('#methodType').val(),
        headers: {
            Authorization: 'Bearer ' + TOKEN
        },
        contentType: $('#contentType').val(),
        crossDomain: true,
        data: JSON.stringify(paramsData),
        dataType: 'json',
        error: function(jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 403) {
                msg = "403 - Unauthorized!";
            } else if (jqXHR.status == 404) {
                msg = '404 - Not Found';
            } else if (jqXHR.status == 405) {
                msg = '405 - Not Allowed';
            } else if (jqXHR.status == 415) {
                msg = '415 - Unsupported Media Type';
            } else {
                msg = 'Error: ' + jqXHR.responseText;
            }
            alert(msg);
        },
        success: function(data) {
            $('#result').html(JSON.stringify(data));
        }
    });
}

/*
 * Check method type request to print parameters list
 */
function checkMethod(e) {
    e.preventDefault();
    var method = $('#methodType').val();
    if (method != 'GET') {
        $('#parametersList').show()
        $('#addParameter').show()
    } else {
        $('#parametersList').hide();
        $('#addParameter').hide();
    }
}

/*
 * Generate JSON for send parameters data
 */
function getParamsData() {
    var data;
    if ($('#parametersList').is(':visible')) {
        data = {};
        var numParams = $("#parametersList").find($("input")).length / 2;
        for (var i = 0; i < numParams; i++) {
            var name = $('#paramName' + i).val();
            var value = $('#paramValue' + i).val()
            if (name != '' && value != '') {
                data[name] = value;
            }
        }
    }
    return data;
}
