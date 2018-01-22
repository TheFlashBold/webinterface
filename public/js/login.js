angular.module("mainModule", [])
    .controller("loginController", function ($scope, $http) {
        $scope.Login = function () {
            if(!$scope.username || !$scope.password) {
                return;
            }
        
            $http.post('/api/login', {username: $scope.username, password: $scope.password}).then(function (response) {
                console.log(response);
                if (response.data.success) {
                    window.location.href = "/";
                    $scope.error = "";
                } else {
                    $scope.error = response.data.message;
                }
            }, function (err) {
                console.error(err);
            });
        };
    });
