import http from './http';

var Logger = {
    error(msg, url, line) {

            var data = {
                time: new Date().toString(),
                msg: encodeURIComponent(msg),
                url: encodeURIComponent(url),
                line: encodeURIComponent(line)
            };

            new Image().src = http.globalUrl+'/widget.error/'+http.context+'/?data='+JSON.stringify(data);
        }
}

window.onerror = function() {
    Logger.error.apply(Logger, Array.from(arguments));
};

export default Logger;