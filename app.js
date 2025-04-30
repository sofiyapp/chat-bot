const http = require("http");
const url = require("url");
function handleStatic(response) {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({
        header: "Hello",
        body: "Octagon NodeJS Test"
    }));
}
function handleDynamic(response, query) {
    const a = parseFloat(query.a);
    const b = parseFloat(query.b);
    const c = parseFloat(query.c);

    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        response.end(JSON.stringify({ header: "Error" }));
    } else {
        const result = (a * b * c) / 3;
        response.end(JSON.stringify({
            header: "Calculated",
            body: result.toString()
        }));
    }
}
function handleNotFound(response) {
    response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ header: "Not Found" }));
}
http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    switch (pathname) {
        case "/static":
            handleStatic(response);
            break;
        case "/dynamic":
            handleDynamic(response, query);
            break;
        default:
            handleNotFound(response);
    }
}).listen(3000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 3000");
});
