define([], function () {
    "use strict";
    
    var commands = {};
    require(["app/commands"], function (realCommands) {
        commands = realCommands;
    });
    
    function help(args, term) {
        var first = true,
            message = '',
            name;
        
        for (name in commands) {
            if (commands.hasOwnProperty(name)) {
                if (!first) {
                    message += ', ' + name;
                } else {
                    message += name;
                    first = false;
                }
            }
        }
        
        term.echo('Available commands:\n' + message + '\n');
    }
    
    return help;
});