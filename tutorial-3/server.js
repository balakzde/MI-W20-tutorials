var storage = {
    orders: [{id: "1", customer: "customer_1", item: "item_1"}],
    lastId: 1,

    getOrder: function (id) {
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i].id == id) {
                return this.orders[i];
            }
        }
        return null;
    },

    adOrder: function (customer, item) {
        this.lastId++;
        orders.push({id: this.lastId, customer: customer, item: item});
    },
    deleteOrder: function (id) {
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i].id == id) {
                array.splice(i, 1);
                return true;
            }
        }
        return false;
    }

};


var http = require("http");

http.createServer(function (req, res) {

    // initialize the body to get the data asynchronously
    req.body = "";

    // get the data of the body
    req.on('data', function (chunk) {
        req.body += chunk;
    });

    //all data
    req.on('end', function () {
        // log request object

        var response = {};
        var url = require('url');
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if ((id = req.url.match("^/orders/([0-9]+)$"))) {
            console.log(req.url);
            if (req.method == "GET") {

                var order = storage.getOrder(id[1]);
                response.order = order;
                if (order) {
                    response.order._links = [];
                    response.order._links.push({
                        "href": "http://localhost:8080/orders/"+id[1],
                        "rel": "self",
                        "method": "GET"
                    });
                    if (query.apiid) {
                        response.order._links.push({
                            "href": "http://localhost:8080/orders/" + id[1],
                            "rel": "delete the order",
                            "method": "DELETE "
                        });
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(response));
                } else {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(response));
                }
            }
            if (req.method == "DELETE") {
                var deleteOrder = storage.deleteOrder(id[1]);
                if (deleteOrder) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    response._links = [];
                    response._links.push({"href": "http://localhost:8080/orders", "rel": "get list of orders", "method": "GET"});
                    res.end(response)

                } else {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    response._links = [];
                    response._links.push({"href": "http://localhost:8080/orders", "rel": "get list of orders", "method": "GET"});
                    res.end(response)
                }
            }
        } else if (req.url.match("^/orders")) {
            if (req.method == "GET") {
                response._links = [];
                response._links.push({
                    "href": "http://localhost:8080/orders",
                    "rel": "get list of orders",
                    "method": "GET"
                });
                response._links.push({
                    "href": "http://localhost:8080/orders/{id}",
                    "rel": "read the detail",
                    "method": "GET"
                });
                if (query.apiid) {
                    response._links.push({
                        "href": "http://localhost:8080/orders",
                        "rel": "create a new order",
                        "method": "POST"
                    });
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                response.orders = storage.orders;
                res.end(JSON.stringify(response));
            }
            if (req.method == "POST") {
                var customer = req.body.customer;
                var item = req.body.item;
                if (customer && item) {
                    res.writeHead(201, {'Content-Type': 'application/json'});
                    storage.adOrder(customer, item);
                    response._links = [];
                    response._links.push({"href": "http://localhost:8080/orders", "rel": "get list of orders", "method": "GET"});
                    response.order = JSON.stringify(storage.getOrder(storage.lastId));
                    res.end(response)
                } else {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    response.message = "required fields: customer, item";
                    response._links = [];
                    response._links.push({"href": "http://localhost:8080/orders", "rel": "get list of orders", "method": "GET"});
                    response.order = JSON.stringify(storage.getOrder(storage.lastId));
                    res.end(response)
                }
            }
        } else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Root');
        }


        // send response to client
        res.end(req.body);
    });

}).listen(2222);