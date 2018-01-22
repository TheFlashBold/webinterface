angular.module("mainModule", [])
    .controller("indexController", function ($scope, $http) {
        $scope.loadData = function (data) {
            console.log(data);
            $scope.data = data;
            if(data.user){
                $scope.user = data.user;
            }
        };

        $scope.checkRights = function (user, right) {
            if(!user){
                return false;
            }

            let valid = false;

            for(let i = 0;i < user.rights.length;i++){

                let uRights = user.rights[i].split(".");
                let rRights = right.split(".");

                let k = true;

                for (let j = 0; j < uRights.length; j++) {
                    if(j < rRights.length && k){
                        if(uRights[j] === rRights[j]){
                            k = true;
                        } else if(uRights[j] === "*"){
                            k = true;
                        } else {
                            k = false;
                        }
                    }
                }
                if(k){
                    valid = true;
                }
            }
            return valid;
        };

        $scope.checkId = function (input) {
            if ($scope.data.ids.indexOf(input) !== -1) {
                $scope.server_valid = false;
            }
            else {
                $scope.server_valid = true;
            }
        };

        $scope.setup = function (game, version, id) {

            $http.post('/api/create/' + id, {
                game: game,
                version: version
            }).then(function (response) {
                if(response.data.success === true)
                {
                    $scope.server_done = true;
                    $scope.data.server.unshift({name: id, type: game, version: version});
                }
                else{
                    $scope.server_error = response.data.error;
                    console.error(response.data.error);
                }
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
    });
