const express = require("express");
const route = express.Router();
const orderController = require("../Controllers/OrderController")

route.get("/", orderController.getAllOrders);
route.get("/:status", orderController.getOrderByStatus);
route.get("/:id", orderController.getOrderById);
route.post("/", orderController.createNewOrder);
route.put("/:id", orderController.updateOrderByID);
route.delete("/:id", orderController.deleteOrderByID);


module.exports = route;