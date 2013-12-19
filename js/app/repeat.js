define(["app/projects"], function (projects) {
    "use strict";

    function repeat(pattern, count) {
        /*jslint bitwise: true */
        if (count < 1) {
            return '';
        }
        
        var result = '';
        while (count > 0) {
            if (count & 1) {
                result += pattern;
            }
            count >>= 1;
            pattern += pattern;
        }
        /*jslint bitwise: false */
        return result;
    }
    
    return repeat;
});