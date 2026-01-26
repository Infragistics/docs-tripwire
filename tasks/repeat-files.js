module = module.exports;

var _ = require('lodash');
var q = require('q');
var path = require('path');
var walk = require('walk');

module.check = function(rootPathToCheck){
	
	var files = [];
	var repeats = [];
	var errors = [];
	var deferred = q.defer();
	var walker = walk.walk(rootPathToCheck, {followLinks: false})

	walker.on('file', function(root, nodeStatsArray, next){
		var name, exists, filePath, file, fileName, repeatIndex;
		
		name = nodeStatsArray.name;
		
		exists = false;
		for(var i=0; i< files.length; i++){
			fileName = files[i].name.toLowerCase();
			if(fileName !== 'thumbs.db'){
				if(fileName === name.toLowerCase()){
					exists = true;
					repeatIndex = i;
					break;
				}
			}
		}
		
		filePath = path.join(root, name);
		file = {
			name: name,
			root: root,
			path: filePath
		};
		
		if(exists){
			repeats.push(files[repeatIndex]);
			repeats.push(file);
		} else {
			files.push(file);
		}
		
		next();
	});
	
	walker.on('errors', function(root, nodeStatsArray, next){
		errors = errors.concat(nodeStatsArray);
	});
	
	walker.on('end', function(){
		var results;
		
		if(errors.length > 0){
			deferred.reject(errors);
		} else {		
			results = {};
			results.repeatedFiles = {};
			results.hasRepeats = repeats.length > 0;
			
			repeats.forEach(function(file){
				if(_.isUndefined(results.repeatedFiles[file.name])){
					results.repeatedFiles[file.name] = [];
				}
				results.repeatedFiles[file.name].push(file);
			});
			
			deferred.resolve(results);
		}
	});
	
	return deferred.promise;

};