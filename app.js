const http = require("http");
const url = require("url");

http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
    });

    if (pathname === "/static") {
        // Обработка статического маршрута
        response.end(JSON.stringify({
            header: "Hello",
            body: "Octagon NodeJS Test"
        }));
    } else if (pathname === "/dynamic") {
        // Получаем параметры a, b, c
        const a = parseFloat(query.a);
        const b = parseFloat(query.b);
        const c = parseFloat(query.c);

        // Проверка на валидность
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            response.end(JSON.stringify({ header: "Error" }));
        } else {
            const result = (a * b * c) / 3;
            response.end(JSON.stringify({
                header: "Calculated",
                body: result.toString()
            }));
        }
    } else {
        // Неизвестный путь
        response.writeHead(404, {
            "Content-Type": "application/json; charset=utf-8"
        });
        response.end(JSON.stringify({ header: "Not Found" }));
    }

}).listen(3000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 3000");
});
