/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/linq/linq.d.ts" />

var getTypes = function ($http, $q) {
	return $q(function (resolve, reject) {
		$http.get("config/types.json").then(function (data) {
			resolve(data);
		}, function (error) {
			reject(error);
		});
	});
};