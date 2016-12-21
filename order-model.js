import http from './http.js';
import {filter, map, each, findIndex} from 'lodash';
import EventStore from './event_store';
import moment from 'moment';
import AddressFinder from './adderess-finder.js';

/**
 * Модель заказа
 * */
var Order = {
    _tariffOptions: [],
    _selectedOptions: [],
    _estimate: {},
    _addresses_list: [],
    comment: '',
    options: [],
    route: [],
    orderId: null,
    status: {
        state: null
    },
    timeObj: {time: null, day: null},
    getTimeString: function () {

        if (this.timeObj && this.timeObj.day) {
            let fullTime = moment(this.timeObj.day);

            if (this.timeObj.time) {
                let timeArr = this.timeObj.time.split(':');
                fullTime.set('hour', timeArr[0]);
                fullTime.set('minute', timeArr[1]);
            }

            return fullTime.format('DD MMMM HH:mm');
        }
    },
    events: new EventStore,

    onUpdate(cb) {
          this.events.on('update', cb);
    },
    onOptionUpdate: function (cb) {
        this.events.on('optionsUpdate', cb);
    },
    removeOptionUpdate (cb) {
        this.events.remove('optionsUpdate', cb);
    },
    onEstimateUpdate: function (cb) {
        this.events.on('estimateUpdate', cb);
    },
    onDriverUpdate(cb) {
        this.events.on('driverUpdate', cb);
    },
    onStatusUpdate: function (cb) {
        this.events.on('statusUpdate', cb);
    },
    onRejectOrder: function (cb) {
        this.events.on('rejectOrder', cb);
    },

    addOption (optionId) {
        this.options.push(optionId);
        this.events.resolve('optionsUpdate', this.options);
        this.events.resolve('update', this);
        if (this.getRoute().length > 1) {
            this.estimate();
        }
    },

    hasOption(optionId) {
        return this.options.indexOf(optionId) >= 0;
    },

    clearOrder(){
        this.orderId = null;
        this._estimate = {};
        this._addresses_list= [];
        this.comment= '';
        this.options = [];
        this.route = [];
        this.orderId =  null;
        this.timeObj = {time: null, day: null};
        this.status = {};
        this.removeStatusLoop();
        this.initFinders();
        this.events.resolve('rejectOrder', this);
    },

    removeOption (optionId) {
        let optionIndex = findIndex(this.options, (item) => {
            return item === optionId;
        });

        this.options.splice(optionIndex, 1);
        this.events.resolve('optionsUpdate', this.options);
        this.events.resolve('update', this);

        if (this.getRoute().length > 1) {
            this.estimate();
        }
    },

    getRoute: function () {
        var route = this._addresses_list
            .filter((item) => { if( item.isFull() ) { return true }})
            .map((item) => {return item.currentAddress.address.point});

        return route;
    },

    getFullRoute() {
        return this._addresses_list
            .filter((item) => { if( item.isFull() ) { return true }})
            .map((item) => {return item.currentAddress.address});
    },


    /**
     *  Предварительная оценка заказа
     *  @return {Promise}
     *  https://github.com/HIVETAXI/client-web-api/wiki/Предварительная-оценка-заказа
     * */
    estimate: function () {
        var params = {
                method: 'POST',
                data: {
                    options: this.options,
                    route: this.getRoute()
                }
            };

        return http.send('/api/client/web/1.0/order/estimate', params).then((resp)=> {
            this._estimate = resp;
            this.events.resolve('estimateUpdate', resp);
            this.events.resolve('update', this);
        });
    },

    getOrderTime () {
        if (this.timeObj && this.timeObj.day) {
            var orderFullTime = moment(this.timeObj.day);

            if (this.timeObj.time) {
                let timeArray = this.timeObj.time.split(':');
                orderFullTime.set('hour', timeArray[0]);
                orderFullTime.set('minute', timeArray[1]);
                orderFullTime.set('second', 0);
            }
            return orderFullTime.format();

        }
        return null;
    },


    /**
     *  Создание заказа
     *  @return {Promise}
     *  https://github.com/HIVETAXI/client-web-api/wiki/Создание-закза
     * */
    submit: function (phone) {
        var params = {
                method: 'POST',
                data: {
                    options: this.options,
                    route: this.getRoute(),
                    comment: this.comment,
                    phone: phone,
                    time: this.getOrderTime()
                }
            },
            self = this;

        return http.send('/api/client/web/1.0/order/submit', params).then((resp)=> {
            this.orderId = resp.id;
            return { status: 'success', data: resp }
        }, (resp)=> {
            if(resp && resp.target && resp.target.response) {
                return {status: 'error', data: JSON.parse(resp.target.response)};
            }
        });
    },

    /**
     *  Запрос на повтороне получение кода подтверждения (звонок клиенту)
     *  @param {string} confirmationType, доступные значения: 'voice'
     *  @return {Promise}
     * */
    resubmit: function (confirmationType) {
        return http.send('/api/client/web/1.0/order/resubmit?id=' + this.orderId + '&confirmationType=' + confirmationType).then((resp)=> {
            return { status: 'success'}
        }, ()=>{
            return { status: 'error' }
        })
    },

    /**
     *  Подтверждение-заказа
     *  @param {string} codeFromPhone Код подтверждения
     *  @return {Promise}
     *  https://github.com/HIVETAXI/client-web-api/wiki/Подтверждение-заказа
     * */
    confirm (codeFromPhone) {
        return http.send('/api/client/web/1.0/order/confirm?id=' + this.orderId + '&code=' + codeFromPhone).then((resp)=> {
            this.orderId = resp.id;
            return { status: 'success', data: resp }
        }, (resp)=>{
            if (resp && resp.target && resp.target.response) {

                return {status: 'error', data: JSON.parse(resp.target.response)};
            }
        });
    },

    /**
     * Получение статуса заказа
     *  @return {Promise} - объект статуса {state: {state}, assignee: {assignee}
     *  https://github.com/HIVETAXI/client-web-api/wiki/Получение-статуса-заказа
     * */
    getStatus () {
        return new Promise((resolve, reject) => {
            if (this.orderId) {

                http.send('/api/client/web/1.0/order/status?id=' + this.orderId).then((resp)=> {
                    if(resp) {

                        if (resp.assignee) {
                            this.status.assignee = resp.assignee;
                            this.events.resolve('driverUpdate', resp);
                        }

                        if (this.status.state != resp.state) {
                            this.status.state = resp.state;

                            this.events.resolve('statusUpdate', resp);
                            this.events.resolve('update', this);
                        }

                    }

                    resolve(this.status);
                }, (resp) => {
                    reject(resp);
                });
            } else {
                reject({});
            }
        })

    },

    /**
     * Обновляем статус заказа
     *  @param {integer} sec - секунды
     *
     * */
    createStatusLoop(sec) {
        var self = this;
        this.timer = setInterval(
            function () {
                self.getStatus()
            },
            1000*sec
        )
    },

    removeStatusLoop ()  {
        clearInterval(this.timer);
    },

    /**
     * Отмена заказа
     * https://github.com/HIVETAXI/client-web-api/wiki/Отмена-заказа
     * */
    cancel () {
        var self = this;
        return http.send('/api/client/web/1.0/order/cancel?id=' + this.orderId).then(()=> {
            self.clearOrder();
            return {success: true};
        }, () => {
            return {error: true}
        });
    },

    addFinder() {
        this._addresses_list.push(new AddressFinder())
    },

    //добавляем два AddressFinder - для откуда и куда
    initFinders() {
        this.addFinder();
        this.addFinder();
    },

    serialize() {
        return {
            orderId: this.orderId,
            route: this.getFullRoute(),
            timeObj: this.timeObj,
            comment: this.comment,
            options: this.options,
            status: this.status
        }
    },

    setOrder(order) {
        if(order.orderId) {
            this.orderId = order.orderId;
            this.getStatus().then(() => {
                this.comment = order.comment;
                this.timeObj = order.timeObj;
                each(order.options, (id) => {
                    this.addOption(id);
                });
                this._addresses_list.length = 0;
                each(order.route, (address) => {
                    var finder = new AddressFinder();
                    finder.setCurrentAddress(address);
                    this._addresses_list.push(finder);
                });

                this.estimate();
                this.createStatusLoop(10);
            }).catch((e) => {
                this.orderId = null;
            })

        }
    }
};

Order.events
    .createStore('optionsUpdate')
    .createStore('estimateUpdate')
    .createStore('statusUpdate')
    .createStore('driverUpdate')
    .createStore('update')
    .createStore('rejectOrder');


Order.initFinders();

export default Order;