angular.module("mainModule", [])
    .controller("editfileController", function ($scope, $http) {
        $scope.loadData = function (data, config) {
            $scope.settings = data;
            $scope.config = config;
            console.log(data);
        };

        $scope.save = function () {
            $http.post('/api/saveFile/' + $scope.config.id + "/" + $scope.config.file, {config: $scope.settings}).then(function (response) {
                console.log(response);
            }, function (err) {
                console.error(err);
            });
        };

        $scope.Logout = function () {
            $http.post('/api/logout', ).then(function (response) {
                console.log(response);
                window.location.href = "/";
            }, function (err) {
                console.error(err);
            });
        };

        $scope.NewValue = function (proto) {
            let val = {};
            Object.keys(proto).forEach(function(key) {
                val[key] = proto[key].default;
            });
            return val;
        };

        $scope.addVal = function (arr, proto) {
            arr.push($scope.NewValue(proto));
        };
    });