import http from './http.js';
import {filter, map, cloneDeep} from 'lodash';
import Order from './order-model.js';

var Options = {
    _tariffOptions: {},
    /**
     * Возвращаем опции тарифа с выделенными в заказе опциями
     * @return {arraн} - массив опций
     * */
    getTariffOptions(){
        if (this._tariffOptions[http.context]) {
            let selectedOptions = this.checkedTariffOptions(this._tariffOptions[http.context]);
            return selectedOptions;
        }
    },

    /**
     * Проверяем есть ли опция в заказе и если есть - отмечаем её
     * @return {array} - массив опций
     * */
    checkedTariffOptions: function(tariffOptions){
        return  map(tariffOptions, (option) => {
            var myOption =  cloneDeep(option);
            if (Order.hasOption(option.id)) {
                myOption.checked = true;
            }

            return myOption;
        });
    },
    
    /**
     * Возвращаем опции тарифа с выделенными в заказе опциями
     * @return {Promise} - промис внутри котогорого возвращается массив
     * */
    getSelectedOptions: function () {
        return new Promise((resolve, reject) => {
            var self = this;
            if (this._tariffOptions[http.context].length) {

                let selectedOptions = this.checkedTariffOptions(self._tariffOptions[http.context]);
                resolve(selectedOptions);
                return;
            }
            this.initTariffOptions().then(function() {
                let selectedOptions = this.checkedTariffOptions(self._tariffOptions[http.context]);

                resolve(selectedOptions);
            }).catch(function() {
                resolve([]);
            });

        });

    },
    /**
     * Получаем опции тарифа привязанные к этому контексту и мемоизируем их
     * @return {array} - массив опций
     * */
    initTariffOptions: function () {
        var self = this;

        if (this._tariffOptions[http.context]) {
            return new Promise(function (resolve){
                resolve(self._tariffOptions[http.context]);
            })
        }

        return http.send('/api/client/web/1.0/tariff/options').then(function (resp) {
            self._tariffOptions[http.context] = resp;
            return resp
        })
    }
}

export default Options;
