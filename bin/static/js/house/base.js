function print_object(obj){
    var temp = ""
    for(var key in obj){
        temp += key + ":" + obj[key] + "\n";
    }
}


function check_obj_val(obj){
    for(var key in obj){
        var value = obj[key];
        if(!value){
            console.log('key: '+key);
            return false;
        }
    }
    return true;
}

function split_key(key) {
    if(key === null){
        return '';
    }
    var len = key.length;
    if(len > 16){
        return key.slice(0,16)+'<br>' + key.slice(16, -1);
    } else {
        return key;
    }
}

