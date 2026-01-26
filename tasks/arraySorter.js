(function(module){

    //var sortByPropertyName = 'orderBy';

    module.sortArray = function(array, propertyName){
        array.sort(function(a,b){
            var returnValue = 0;
            if(a[propertyName] < b[propertyName]){
                returnValue = -1;    
            } else if(a[propertyName] > b[propertyName]){
                returnValue = 1;
            }
            return returnValue;
        });
    };

    module.sort = function(array, propertyName){
        module.sortArray(array, propertyName);
        array.forEach(function(item){
            if(item.children.length > 0){
                module.sort(item.children, propertyName);
            }
        });
    };
    
}(module.exports));