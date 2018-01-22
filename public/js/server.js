angular.module("mainModule", [])
    .controller("serverController", function ($scope, $http, $sce) {
        $scope.loadData = function (data) {
            Debug(data);

            $scope.data = data;

            if(data.user){
                $scope.user = data.user;
            }

            $scope.data.state = false;

            $scope.history = [];
            $scope.log = "";
            LoadLog(data.log.replace("\n", "\r\n"));

            $scope.socket = io();

            $scope.socket.emit('reg', {server: data.id});

            $scope.socket.on('log', function (data) {
                Log(data);
            });

            $scope.socket.on('shutdown', function () {
                $scope.data.state = "stopped";
            });

            $scope.socket.on('error', function (data) {
                console.error(data);
            });

            $scope.getState();
        };

        angular.element(document).ready(function () {
            setInterval(function () {
                $scope.getState();
            }, 10000);
        });

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

        $scope.getState = function () {
            $http.post('/api/status/' + $scope.data.id, {}).then(function (response) {
                $scope.$applyAsync(function () {
                    Debug(response);
                    if (response.data && $scope.data.state !== "stopping") {
                        $scope.data.state = response.data.status;
                    }
                });
            }, function (err) {
                console.error(err);
            });
        };

        $scope.start = function () {
            if ($scope.isStart()) {
                return;
            }
            $scope.data.state = "starting";
            $http.post('/api/start/' + $scope.data.id, {}).then(function (response) {
                if (response.data.message !== "error") {
                    setTimeout(function () {
                        $scope.$applyAsync(function () {
                            $scope.data.state = "running";
                        });
                    }, 2000);
                    Log(GetTime() + " [SYSTEM] Starting server\n");
                }
                Debug(response);
            }, function (err) {
                console.error(err);
            });
        };

        $scope.isStart = function () {
            if (["running", "starting", "stopping"].indexOf($scope.data.state) !== -1) {
                return true;
            }
            return false;
        };

        $scope.stop = function () {
            if ($scope.isStop()) {
                return;
            }
            $scope.data.state = "stopping";
            $http.post('/api/stop/' + $scope.data.id, {}).then(function (response) {
                if (response.data.message !== "error") {
                    $scope.$applyAsync(function () {
                        $scope.data.state = "stopped";
                    });
                    Log(GetTime() + " [SYSTEM] Stopping server\n");
                }
                Debug(response);
            }, function (err) {
                console.error(err);
            });
        };

        $scope.isStop = function () {
            if (["stopped", "stopping"].indexOf($scope.data.state) !== -1) {
                return true;
            }
            return false;
        };

        $scope.sendCommand = function (cmd) {
        	$scope.socket.emit('command', cmd);
        };

        $scope.send = function () {
            if (!$scope.commandinput) {
                return;
            }
            $scope.socket.emit('command', $scope.commandinput);
            Debug($scope.commandinput);
            $scope.history.unshift($scope.commandinput);
            $scope.commandinput = "";
        };

        let index = 0;

        $scope.HandleKeypress = function (event) {
            switch (event.keyCode) {
                case 13: // Enter
                    $scope.send();
                    index = -1;
                    break;

                case 38: // Up
                    if (index < history.length) {
                        $scope.commandinput = $scope.history[++index];
                    }
                    break;

                case 40: // Down
                    if (index > 0) {
                        $scope.commandinput = $scope.history[--index];
                    }
                    break;
            }
        };

        $scope.open = function (url) {
            window.location = url;
        };

        $scope.Logout = function () {
            $http.post('/api/logout',).then(function (response) {
                Debug(response);
                window.location.href = "/";
            }, function (err) {
                console.error(err);
            });
        };

        function Log(data) {
            
            let replace = [
                [/(\[(([^\]\[]*)(error)\]):?)/ig, '<span class="label label-danger">\$1</span>'],
                [/(\[(([^\]\[]*)(warning)\]):?)/ig, '<span class="label label-warning">\$1</span>'],
                [/(\[(([^\]\[]*)(warn)\]):?)/ig, '<span class="label label-warning">\$1</span>'],
                [/(\[(([^\]\[]*)(info)\]):?)/ig, '<span class="label label-info">\$1</span>'],
                [/(\[(([^\]\[]*)(system)\]):?)/ig, '<span class="label label-default">\$1</span>'],
                [/(\[(\d\d:\d\d:\d\d)\]:?)/ig, '<span class="label label-default">\$1</span>']
            ];

            for (let i = 0; i < replace.length; i++) {
                let key = replace[i][0];
                let value = replace[i][1];
                data = data.replace(key, value);
            }
                                    
            $scope.$applyAsync(function () {
                $scope.log = $sce.trustAsHtml(data + $scope.log);
            });
        }

        function LoadLog(data) {
            let lines = data.split('\n');
            for (let i = 0; i < lines.length; i++) {
                Log(lines[i]);
            }
        }

        function GetTime() {
            let d = new Date();
            return "[" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "]";
        }

        function Debug(msg) {
            console.log(msg);
        }
    });
