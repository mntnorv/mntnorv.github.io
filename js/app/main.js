define(["jquery", "jquery.terminal"], function ($) {
    "use strict";
    
    $('#terminal').terminal(function (command, term) {
        switch (command) {
        case 'test':
            term.echo('test!\n');
            break;
        default:
            term.echo('Unrecognised command: \'' + command + '\'\n');
            break;
        }
    }, {
        width: 800,
        prompt: 'mntnorv>'
    });
});