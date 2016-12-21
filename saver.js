import Order from './order-model.js';

var Storage = window.localStorage;

Order.onUpdate(() => {
    if(Order.orderId ) {
        var order = Order.serialize();
        if(order.route && order.route.length) {
            Storage.setItem('hive_order', JSON.stringify(order));
        }
    }
});

setTimeout(function() {
    var order = Storage.getItem('hive_order');
    if(order) {
        try {
            Order.setOrder(JSON.parse(order));
        } catch(e) {
            console.log(e);
        }
        Storage.removeItem('hive_order');
        //Order.setOrder(order);
    }
}, 100);

export default {
    save(name, value) {

    },
    deleteOrder() {
        Storage.removeItem('hive_order');
    }
}