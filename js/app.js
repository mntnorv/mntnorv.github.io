require.config({
    baseUrl: 'js/lib',
});

require(["jquery", "termlib"], function (jquery, termlib) {
    "use strict";
    
    /*function termHandler() {
        this.newLine();
        var line = this.lineBuffer;
        if (line != "") {
            this.write("You typed: " + line);
        }
        this.prompt();
    }
    
    var term = new Terminal({
        handler: termHandler
    });
    
    term.open();*/
});