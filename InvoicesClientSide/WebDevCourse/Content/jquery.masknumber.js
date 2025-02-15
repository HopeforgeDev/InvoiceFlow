(function (factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery || Zepto);
    }

}(function($) {

    $.fn.maskNumber = function(options) {

        var settings = $.extend({}, $.fn.maskNumber.defaults, options);
        settings = $.extend(settings, options);
        settings = $.extend(settings, this.data());

        //this.keyup(function() {
        //    format(this, settings);
        //});
        
        return settings;
    };

    $.fn.maskNumber.defaults = {
        thousands: ",",
        decimal: ".",
        integer: false,
    };

    $.fn.format = function(input, settings) {
        //joe warde Ts#:112277 04/12/2017
        //var inputValue = input.value;
        //inputValue = removeNonDigits(inputValue);
        //if (!settings.integer) {
        //    inputValue = addDecimalSeparator(inputValue, settings);
        //}
        //inputValue = addThousandSeparator(inputValue, settings);
        //inputValue = removeLeftZeros(inputValue);
        //joe warde Ts#:112277 04/12/2017
        var inputValue = input.value;
        x = inputValue.split(settings.decimal);
        x1 = x[0];
        x2 = x.length > 1 ? settings.decimal + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + settings.thousands + '$2');
        }
        if (settings.integer) {
            inputValue = x1;
        } else {
            inputValue = x1 + x2;
        }
        applyNewValue(input, inputValue);
    };
    
    function removeNonDigits(value) {
        return value.replace(/\D/g, "");
    }
    
    function addDecimalSeparator(value, settings) {
        value = value.replace(/(\d{2})$/, settings.decimal.concat("$1"));
        value = value.replace(/(\d+)(\d{3}, \d{2})$/g, "$1".concat(settings.thousands).concat("$2"));
        return value;
    }
    
    function addThousandSeparator(value, settings) {
        var totalThousandsPoints = (value.length - 3) / 3;
        var thousandsPointsAdded = 0;
        while (totalThousandsPoints > thousandsPointsAdded) {
            thousandsPointsAdded++;
            value = value.replace(/(\d+)(\d{3}.*)/, "$1".concat(settings.thousands).concat("$2"));
        }
        
        return value;
    }
    
    function removeLeftZeros(value) {
        return value.replace(/^(0)(\d)/g,"$2");
    }
    
    function applyNewValue(input, newValue) {
        if (input.value != newValue) {
            input.value = newValue;
        }
        $(input).trigger('change', input.value);
    }

}));