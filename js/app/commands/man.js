define([], function () {
    "use strict";
    
    var commands = {};
    require(["app/commands"], function (realCommands) {
        commands = realCommands;
    });
    
    function man(args, term) {
        var command = commands[args[0]];
        
        if (command) {
            term.echo('Usage: ' + command.usage + '\n' + command.description);
        } else {
            term.echo('man: no manual entry for ' + args[0] + '.');
        }
    }
    
    return man;
});