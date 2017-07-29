
// http://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
function getParam(val) {
    var result = undefined,
        tmp = [];
    location.search
        //.replace ( "?", "" )
        // this is better, there might be a question mark inside
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
        });
    return result;
}
function getAuthToken() { return getParam('s') === undefined ? localStorage.getItem('s') : getParam('s'); }

if (getParam('s') !== undefined) { localStorage.setItem('s', getParam('s')); }


function flux_api(path){
    path = 'api/v0/' + path;
    if (!getParam('prod') && (getParam('debug') || window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1')){
        return "http://localhost:5000/" + path;
    }
    if(window.location.hostname == "flux-api-dev.herokuapp.com" && !getParam('prod')) {
        return "http://flux-api-dev.herokuapp.com/" + path;
    }
    return "https://api.voteflux.org/" + path;
};


function handle_output_model_decorator(host_obj, field_name){
    var r = function(data){
        host_obj[field_name] = JSON.stringify(data);
        console.log('Got some data!', data);
    }
    return r;
}

function jsonDumps(obj){
    return JSON.stringify(obj);
}