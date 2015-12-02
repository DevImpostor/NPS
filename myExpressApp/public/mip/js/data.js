/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/linq/linq.d.ts" />

var record_cache = []

var getRecords = function ($http, $q, typeName, filters) {
	return $q(function (resolve, reject) {

		var listToReturn = undefined;

		var recordCache = Enumerable.From(record_cache).Where(function (x) {
			return x.typeName == typeName;
		}).ToArray();

		if (recordCache.length > 0) {
			listToReturn = recordCache[0].records;
			listToReturn = applyFilters(listToReturn, filters);
			resolve(listToReturn);
			
		}
		else {

			$http.get("mocks/" + typeName + ".json").then(function (records) {
				listToReturn = records.data;
				record_cache.push({"typeName": typeName, "records": listToReturn});
				applyFilters(listToReturn, filters);
				resolve(listToReturn);
			}, function (error) {
				listToReturn = [];
				record_cache.push({"typeName": typeName, "records": listToReturn});
				reject(error, listToReturn);
			});

		}

	});

};

var applyFilters = function (records, filters) {
	if (filters != []) {
		filters.forEach(function (filter) {
			records = Enumerable.From(records).Where(function (x) {
				return x[filter.field_name] == filter.value_condition;
			}).ToArray();
		}, this);
	}
	return records;
}