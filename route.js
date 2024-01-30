function route(handle, pathname, response, request, debug) {
  console.log("About to route a request for " + pathname);
  // Check if the pathname is in the handle object and is a function
  if (typeof handle[pathname] == 'function') {
    // Call the function with the response and request objects
    return handle[pathname](response, request);
  } else {
    if (debug == true) {
      console.log("No request handler found for " + pathname);
    }
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;