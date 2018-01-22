let rights = {};

rights.init = function () {
    global.rights = {
        test: function (user, right) {
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
        }
    };
};

module.exports = rights;