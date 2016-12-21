import {each, remove} from 'lodash';

export default class EventStore {
    constructor() {
        this.store = new Map();
        this.onceStore = new Map();
    }

    /**
     * Создает хранитель события
     * @param {string} name - имя события
     * @return {EventStore} cbs - колбеки которые будут вызваны при резолве события
     * */
    createStore(name, cbs = []) {
        if(!this.store.has(name)) {
            this.store.set(name, cbs.slice());
        }
        if(!this.onceStore.has(name)) {
            this.onceStore.set(name, cbs.slice());
        }
        return this;
    }

    once(name, cb) {
        if(name) {
            var cbs = [];
            if(!this.onceStore.has(name)) {
                this.onceStore.set(name, cbs);
            } else {
                cbs = this.onceStore.get(name);
            }
            cbs.push(cb);
        }
        return this;
    }

    on(name, cb) {
        this.addEvent(name,cb);
    }
    /**
     * Добавляем событие в массив реакции на событие
     * P.S Важно помнить что функции буду вызваны без контекста,
     *  так что нельзя использовать this внутри контекста обработчика события
     * @param {string} name - имя события
     * @param {Function} cb - функция вызываемая при возникновени события
     * @return {EventStore}  текущий контекст
     * */
    addEvent(name, cb) {
        if(name) {
            var cbs = [];
            if(!this.store.has(name)) {
                this.store.set(name, cbs);
            } else {
                cbs = this.store.get(name);
            }
            cbs.push(cb);
        }
        return this;
    }

    /**
     * Вызывает событие при наступление события
     * @param {string} name - имя события
     * @param {*} args - аргументы с которыми будут вызваны фунции
     * @return {EventStore}  текущий контекст
     * */
    resolve(name, ...args) {
        if(name ) {
            if(this.store.has(name)) {
                _.each(this.store.get(name), function(cb) {
                    cb.apply(null, args);
                });
            }
            if(this.onceStore.has(name)) {
                _.each(this.onceStore.get(name), function(cb) {
                    cb.apply(null, args);
                });
                this.onceStore.set(name, []);
            }
        }
        return this;
    }


    remove(name, cb) {
        if(this.store.has(name)) {
            remove(this.store.get(name), (cbEvent) => {
                return cbEvent === cb;
            })
        }
        if(this.onceStore.has(name)) {
            remove(this.onceStore.get(name), (cbEvent) => {
                return cbEvent === cb;
            })
        }
    }

    /**
     * Удаляет все события и события
     * @return {undefined}
     * */
    destroy() {
        this.store.clear();
    }
}