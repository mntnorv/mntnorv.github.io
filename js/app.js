requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: "../app"
    },
    shim: {
        "jquery.terminal": ["jquery"]
    }
});

requirejs(["app/main"]);