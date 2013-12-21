requirejs.config({
    baseUrl: "js/lib",
    paths: {
        app: "../app",
        partials: "../../partials"
    },
    shim: {
        "jquery.terminal": ["jquery"]
    }
});

requirejs(["app/main"]);