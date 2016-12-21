import http from './http.js';

var context = {
    context: null,
    address: {},
    skin: 'default',
    setContext(context){
        this.context = parseInt(context, 10);
    },
    getContext(){
        return http.send('/api/client/web/1.0/context').then((resp)=> {
            this.address = resp.address;
        });
    },
    getCenter(){
        if(this.address && this.address.center && this.address.center.coordinates) {
            return this.address.center.coordinates;
        }
    },
    setSkin(skin){
        if(skin) {
            this.skin = skin;
        }
    }
}

export default context;