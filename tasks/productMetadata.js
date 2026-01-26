(function (module) {

    module.data = [];
    var productFamilyName = "";

    module.createNewItem = function (controlName, groupName, friendlyName) {
        controlName = controlName || [];
        groupName = groupName || [];
        friendlyName = friendlyName || [];

        return { 
            ControlName: controlName,
            GroupName: groupName,
            FriendlyName: friendlyName,
            ProductFamilyName: productFamilyName
        };
    };

    module.get = function (config, success, fail) {

        var customerGuidanceRepository = require('./customerGuidanceRepository.js');

        customerGuidanceRepository.getControlInfo(config, function (response) {
            module.data = response;
            module.culture = config.culture.replace("en", "").toUpperCase();
            if (module.data.length) {
                // grab the first result's product
                productFamilyName = module.data[0].ProductFamilyName;
            }
            success();
        }, fail);
    };

    module.find = function(controls){
        var returnValue = module.createNewItem(controls);

        for (var i = 0; i < returnValue.ControlName.length; i++) {
            var guidanceControlInfo = module.getControlByName(returnValue.ControlName[i].trim());
            if(guidanceControlInfo){
                returnValue.FriendlyName.push(guidanceControlInfo["FriendlyName" + module.culture]);
                if (returnValue.GroupName.indexOf(guidanceControlInfo["GroupName" + module.culture]) == -1) {
                    returnValue.GroupName.push(guidanceControlInfo["GroupName" + module.culture]);
                }
            }
        }
        return returnValue;
    };

    module.getControlByName = function (controlName) {

        controlName = controlName.toLowerCase();

        for (var i = 0, len = module.data.length; i < len; i++) {
            if (module.data[i].ControlName.toLowerCase() === controlName
                || module.data[i].FriendlyName.toLowerCase() === controlName) {
                return module.data[i];
            }
        }
        return false;
    };

    return module;

}(module.exports));