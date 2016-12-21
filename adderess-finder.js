import Address from './address.js';
import {filter, map, some, find, isObject, cloneDeep} from 'lodash';
import formatter from './formatter.js';

class AddressFinder {

    constructor () {
        this.currentAddress = new Address();
        this.lastAddresses = [];
    }

    isFull () {

        if (this.currentAddress && this.currentAddress.address && this.currentAddress.address.point) {
            return true;
        }
        return false;
    }

    isEmpty () {
        if (this.currentAddress && !this.currentAddress.address) {
            return true;
        }
    }

    getAddressObjectList (pattern) {
        var self = this;
        return new Promise(function (resolve, reject) {

            var currentAddress = self.currentAddress;

            if (currentAddress && currentAddress.address) {

                let parentId;


                if (Address.hasLocality(currentAddress.address)){
                    parentId = Address.getLocality(currentAddress.address).id;
                }

                if (Address.hasStreet(currentAddress.address)){
                    parentId = Address.getStreet(currentAddress.address).id;
                }


                Address.getPoints(parentId, pattern).then((resp) => {
                    resolve(resp);
                });

            }

            else {
                Address.getAddress(pattern).then((resp) => {
                    resolve(resp);
                });
            }
        })
    }

    formatterCurrentToArray () {
        return formatter.formatToArray(this.currentAddress.address);
    }
    formatterCurrentToString() {
        return formatter.format(this.currentAddress.address);
    }

    //форматируем в массив из двух элементов -  адрес и алиас

    formatterCurrentToSplit() {
        return formatter.formatToSplit(this.currentAddress.address);
    }

    setCurrentAddress  (addressObj) {

        if (this.currentAddress.address) {
            var currentAddress = cloneDeep(this.currentAddress.address);
            this.lastAddresses.push(currentAddress);
        }

        this.currentAddress.setAddress(addressObj);
    }

    setPorchToCurrrent (porch){
        if (this.isFull()){
            this.currentAddress.address.point.porch = porch
        }
    }

    setFlatToCurrrent (flat){
        if (this.isFull()){
            this.currentAddress.address.point.flat = flat
        }
    }

    setPreviousAddress () {

        var lastLength = this.lastAddresses.length;

        if (lastLength){
            var prevAddress = this.lastAddresses.pop();
            this.currentAddress.setAddress(prevAddress);
        } else {
            this.currentAddress.clear();
        }

    }

    formatter (addressObj, type) {

        var str = '';

        // форматирование в списке

        if (type === 'list') {

            //если есть установленаня улица или еще что-то
            if (isObject(this.currentAddress.address)) {
                if (Address.isPoint(addressObj)){
                    str = str + formatter.formatPoint(addressObj, this.currentAddress.address)
                } else {
                    str = str + formatter.format(addressObj);
                }
            }
            // если это первичный поиск
            else {
                str = str + formatter.format(addressObj);
            }
        }

        return str;
    }

}


export default AddressFinder;
