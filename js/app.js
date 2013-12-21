requirejs.config({
    baseUrl: "/js/lib",
    paths: {
        app: "/js/app",
        partials: "/partials"
    },
    shim: {
        "jquery.terminal": ["jquery"]
    }
});

requirejs(["app/main"]);