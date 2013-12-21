requirejs.config({
    baseUrl: "js",
    paths: {
        partials: "../partials",
        jquery: "lib/jquery",
        "jquery.terminal": "lib/jquery.terminal",
        "jquery.mousewheel": "lib/jquery.mousewheel"
    },
    shim: {
        "jquery.terminal": ["jquery"]
    }
});

requirejs(["app/main"]);