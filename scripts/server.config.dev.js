var liveServer = require("live-server");  
var severCofig = {  
    port: 10002, // Set the server port. Defaults to 8080.   
    host: "localhost", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.   
    root: "./", // Set root directory that's being served. Defaults to cwd.   
    open: false, // When false, it won't load your browser by default.   
    wait: 500, // Waits for all changes, before reloading. Defaults to 0 sec.   
    logLevel: 3, // 0 = errors only, 1 = some, 2 = lots 
    middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack   
};  
liveServer.start(severCofig);  
