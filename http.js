import logger from './logger.js'

var http = {
    context: '',
    globalUrl: '',
    setGlobalUrl (globalUrl) {
        this.globalUrl = globalUrl;
    },
    setContext (context) {
        this.context = context;
    },
    send (url, params = {}) {
        var self = this;
        return new Promise(function(resolve, reject) {

            var xhr = createRequest(self.globalUrl + url, params.method , params.headers == false ? false : params.headers);

            xhr.setRequestHeader('Hive-Context', self.context);

            xhr.onload = function(resp) {
                if(this.status == 200) {
                    try{
                        if(this.responseText) {
                            resolve(JSON.parse(this.responseText))
                        } else {
                            resolve({})
                        }
                    }catch(e) {
                        logger.error(e);
                        reject(e)
                    }
                }  else {
                    logger.error(resp);
                    reject(resp);
                }
            };

            xhr.onerror = function(e) {
                logger.error(e);
                reject(e);
            };

            params.data = JSON.stringify(params.data);

            xhr.send(params.data);
        })
    }
};


function createRequest(url, method = 'GET' , header = {}) {
    let xhr = new XMLHttpRequest();

    xhr.open(method || "GET", url, true);

    if(header) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        for(var i = 0, keys = Object.keys(header); i < keys.length; i++) {
            xhr.setRequestHeader(keys[i], header[keys[i]]);
        }
    }

    return xhr;
}

export default http;