define(["app/files"], function (files) {
    "use strict";
    
    function parsePath(path) {
        var split = path.split('/');
    }
    
    function argStringToArray(argStr) {
        var args = [],
            currentSymbol,
            currentArg,
            currentArgQuote,
            i;
        
        // Parse quotes in arguments
        currentArg = '';
        for (i = 0; i < argStr.length; i += 1) {
            currentSymbol = argStr.charAt(i);
            
            if (!currentArgQuote) {
                if (currentSymbol === '\'' || currentSymbol === '"') {
                    currentArgQuote = currentSymbol;
                } else if (currentSymbol !== ' ') {
                    currentArg += currentSymbol;
                } else if (currentArg) {
                    args.push(currentArg);
                    currentArg = '';
                }
            } else {
                if (currentSymbol !== currentArgQuote) {
                    currentArg += currentSymbol;
                } else {
                    currentArgQuote = null;
                }
            }
        }
        
        if (currentArg) {
            args.push(currentArg);
        }
        
        return args;
    }
    
    var system = {
        filesystem: files,
        state: {
            currentDir: '/'
        },
        
        parsePath: parsePath,
        argStringToArray: argStringToArray
    };
    
    return system;
});