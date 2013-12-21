define(["app/files"], function (files) {
    "use strict";
    
    var termSystem = {};
    
    function parseArgs(argStr) {
        var args = [],
            currentSymbol,
            currentArg,
            currentArgQuote,
            i;
        
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
    
    function parsePath(path) {
        var resultPathArray,
            pathArray,
            doesNotExist = false,
            i;
        
        // Exit early if path === '/'
        if (path === '/') {
            return [];
        }
        
        // Get starting path
        if (path.charAt(0) !== '/') {
            if (termSystem.state.currentDir !== '/') {
                resultPathArray = termSystem.state.currentDir.substring(1).split('/');
            } else {
                resultPathArray = [];
            }
        } else {
            resultPathArray = [];
            path = path.substring(1);
        }
        
        pathArray = path.split('/');
        
        // Parse the path argument
        for (i = 0; i < pathArray.length; i += 1) {
            if (pathArray[i] === '..') {
                if (resultPathArray.length !== 0) {
                    resultPathArray = resultPathArray.splice(
                        0,
                        resultPathArray.length - 1
                    );
                } else {
                    doesNotExist = true;
                    break;
                }
            } else if (pathArray[i] !== '.') {
                resultPathArray.push(pathArray[i]);
            }
        }
        
        if (doesNotExist) {
            return undefined;
        }
        
        return resultPathArray;
    }
    
    function getFsObject(path) {
        var parsedPath,
            currentObject,
            lastPathElement,
            mustBeDir = false,
            i;
        
        if (typeof path === 'string') {
            parsedPath = parsePath(path);
        } else if (Array.isArray(path)) {
            parsedPath = path;
        }
        
        // Exit early on some conditions
        if (parsedPath === undefined) {
            return undefined;
        } else if (parsedPath.length === 0) {
            currentObject = termSystem.filesystem;
            currentObject.type = 'dir';
            return currentObject;
        }
        
        // Try to find the filesystem object
        currentObject = termSystem.filesystem;
        for (i = 0; i < parsedPath.length - 1; i += 1) {
            currentObject = currentObject.dirs[parsedPath[i]];
            if (!currentObject) {
                break;
            }
        }
        
        if (!currentObject) {
            return undefined;
        }
        
        // Get the last path element
        lastPathElement = parsedPath[parsedPath.length - 1];
        
        if (lastPathElement.charAt(lastPathElement.length - 1) === '/') {
            mustBeDir = true;
            lastPathElement = lastPathElement.substring(
                0,
                lastPathElement.length - 1
            );
        }
            
        // It can be a directory or a file
        if (lastPathElement === '') {
            currentObject.type = 'dir';
            return currentObject;
        } else if (currentObject.dirs[lastPathElement]) {
            currentObject = currentObject.dirs[lastPathElement];
            currentObject.type = 'dir';
            return currentObject;
        } else if (!mustBeDir && currentObject.files[lastPathElement]) {
            currentObject = currentObject.files[lastPathElement];
            currentObject.type = 'file';
            return currentObject;
        } else {
            return undefined;
        }
    }
    
    termSystem = {
        filesystem: files,
        state: {
            currentDir: '/'
        },
        
        getFsObject: getFsObject,
        parseArgs: parseArgs,
        parsePath: parsePath
    };
    
    return termSystem;
});