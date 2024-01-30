var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/home"] = requestHandlers.start;
handle["/brightness"] = requestHandlers.brightness;
handle["/monitor"] = requestHandlers.monitoring;
handle["/ranges"] = requestHandlers.thresholds;
handle["/contacts"] = requestHandlers.contacts;
handle["/contacts-form"] = requestHandlers.updateForm;
handle["/updateRange"] = requestHandlers.updateRange;

server.start(router.route, handle);