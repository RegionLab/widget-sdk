import Address from './address.js';
import {filter, map, some, find, isObject} from 'lodash';


var formatter = {

    /**
     * Переводит объект тира point в строку
     * @param {point} - объект точки
     * @param {parent} - родителський объект точки
     * @return {string} - строковое представление точки
     * */
    formatPoint (point, parent) {

        let str = '';

        if (parent) {
            str = str + this.format(parent);
        }

        str = str + ', ' + Address.getHouseName(point);

        return str;

    },

    /**
     * Переводит адресный объект в строку адреса
     * @param {obj} addressObj - объект адреса
     * @return {string}  строковое представление адреса
     * */
    format (addressObj) {

        let str = '';

        // если этот адресный объект сразу имеет поинт

        if (Address.hasPoint(addressObj)) {

            if (Address.hasStreet(addressObj)) {
                str = str + Address.getStreetName(addressObj);
                str = str + ', ' + Address.getHouseName(addressObj.point);
            }

            if (Address.hasAlias(addressObj) ) {

                if (Address.hasStreet(addressObj)) {
                    str = str + ' (' + Address.getAlias(addressObj) + ') ';
                } else {
                    str = str + ' ' + Address.getAlias(addressObj);
                }

            }

        }
        // если это адресный объект без поинта
        else {
            if (Address.hasStreet(addressObj)) {
                str = str + Address.getStreetName(addressObj);
            }

            if (Address.hasLocality(addressObj)) {
                str = str + Address.getLocalityName(addressObj);
            }
        }
        return str;
    },

    formatToSplit (addressObj) {
        let str_1 = '',
            str_2 = '',
            arr = [];

        if (Address.hasLocality(addressObj)) {
            str_1 = str_1 + Address.getLocalityName(addressObj);
        }

        if (Address.hasStreet(addressObj)) {
            str_1 = str_1 + Address.getStreetName(addressObj)
        }

        if (Address.hasPoint(addressObj) && (Address.hasStreet(addressObj) || Address.hasLocality(addressObj))) {
            str_1 =  str_1 + ', ' + Address.getHouseName(addressObj.point)
        }

        if (Address.hasAlias(addressObj)) {
            str_2 = Address.getAlias(addressObj)
        }

        if (str_1.length) {
            arr.push(str_1)
        }

        if (str_2.length) {
            arr.push(str_2)
        }

        return arr;
    },

    /**
     * Переводит адресный объект в массив строк
     * @param {obj} addressObj - объект адреса
     * @return {array} arr массив строк
     * */
    formatToArray (addressObj) {

        var arr = [];

        if (Address.hasLocality(addressObj)) {
            arr.push(Address.getLocalityName(addressObj));
        }

        if (Address.hasStreet(addressObj)) {
            arr.push(Address.getStreetName(addressObj));
        }

        if (Address.hasPoint(addressObj)) {
            arr.push(Address.getHouseName(addressObj.point));
        }

        if (Address.hasAlias(addressObj)) {

            arr = [];
            arr.push(this.format(addressObj))
        }


        return arr;
    }

}

export default formatter;