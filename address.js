import http from './http.js';
import {filter, map, some, find, isObject} from 'lodash';

class Address {
    constructor () {
        this.address = false;
    }

    /**
     * Поиск адреса по заданамо шаблону
     * @param {string} text - шаблон для поиска
     * @return {Address array}  массив объектв типа Address
     * https://github.com/HIVETAXI/client-web-api/wiki/Поиск-адреса
     * */
    static getAddress (text) {
        return http.send('/api/client/web/1.0/address/address?pattern=' + encodeURIComponent(text));
    }

    /**
     * Поиск точки по заданамо шаблону
     * @param {string} pattern - шаблон для поиска
     * @param {string} parent - родительский объект, например город.
     * @return {Point array}  массив объектв типа Point
     * https://github.com/HIVETAXI/client-web-api/wiki/Поиск-адресной-точки
     * */
    static getPoints(parent, pattern) {
        return http.send('/api/client/web/1.0/address/point?pattern=' + encodeURIComponent(pattern) + '&parent=' + parent);
    }

    /**
     * Установить адресный объект (либо адрес, либо поинт)
     * @param {object} addressObj - адресный объект
     * @return false
     * */
    setAddress (addressObj) {
        if (Address.isPoint(addressObj)) {
            this.address.point = addressObj
        } else {
            this.address = addressObj;
        }
    }

    /**
     * Очисить адрес
     * */
    clear () {
        this.address = false;
    }

    /**
     * Проверить имеет ли адрес alias
     *  @param {Address object} address - адресc
     * */
    static hasAlias(address) {
        return Boolean(address.point && address.point.info && address.point.info.alias)
    }

    thisHasAlias(){
	    return Address.hasAlias(this.address)
    }

    static getAlias (address) {
        if (Address.hasAlias(address)) {
            return address.point.info.alias;
        }
    }

    static hasPoint (address) {
        return Boolean(address && address.point && address.point.coordinates)
    }

    static getPoint(address) {
        if (Address.hasPoint(address)){
            return address.point;
        }
    }

    hasLevels() {
        if (this.address.levels && this.address.levels.length) {
            return true
        }
        return false
    }

    static isPoint (point) {
        if(point && point.coordinates) {
            return true
        }
    }

    static hasStreet (address) {
        if (some(address.levels, ['type', 7])) {
            return true;
        }
    }

    static hasLocality (address) {
        return some(address.levels, ['type', 6])
    }

    static getLocality (address) {
        return find(address.levels, ['type', 6]);
    }

    static getLocalityName (address) {
        if(Address.hasLocality(address)) {
            return Address.getLocality(address).prefix + ' ' + Address.getLocality(address).name;
        }
    }

    static getStreet (address) {
        var streetLevel = find(address.levels, ['type', 7]);
        return streetLevel;
    }

    static getStreetName (address) {
        if(Address.hasStreet(address)) {
            return Address.getStreet(address).prefix + ' ' + Address.getStreet(address).name;
        }
    }

    static getHouseName (point) {
        var house = '';

        if (point && point.info) {
            var info = point.info;

            if (info.house) {
                house = house +  info.house;
            }

            if (info.housing) {
                house = house +  ' кор. ' + info.housing;
            }

            if (info.building) {
                house = house +  ' cт. '  + info.building;
            }

            if (info.lit) {
                house = house +  ' лит. '  + info.lit;
            }

        }

        return house;
    }


}

export default Address;