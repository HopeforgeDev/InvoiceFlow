$.fn.FormatPhone = function (field, data, component) {
    if (component.option("text") == undefined) {

    } else {
        var phone = new libphonenumber.AsYouType().input(component.option("text"));
    }
}