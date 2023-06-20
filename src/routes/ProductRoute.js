const express = require('express');
const productRoute = express();

const ProductController = require('../controllers/ProductController');
const path = require("path");

const bodyParser = require('body-parser');
productRoute.use(bodyParser.json());
productRoute.use(bodyParser.urlencoded({ extended: true }));

productRoute.set('view engine', 'pug');
productRoute.set('views', path.join(__dirname, '../views'))

// productRoute.get('/products', (req, res) => {
//     res.render('AddProduct')
// })

productRoute.get('/products', ProductController.AllProducts);
productRoute.get('/product/:_id', ProductController.FindProductById);
productRoute.post('/product', ProductController.AddProduct);
productRoute.put('/product/:_id', ProductController.EditProduct);
productRoute.delete('/product/:_id', ProductController.DeleteProduct);

// Supplier
productRoute.get('/suppliers', ProductController.AllSuppliers);
productRoute.get('/supplier/:_id', ProductController.FindSupplierById);
productRoute.post('/supplier', ProductController.AddSupplier);
productRoute.put('/supplier/:id', ProductController.EditSupplier);
productRoute.delete('/supplier/:_id', ProductController.DeleteSupplier);

module.exports = productRoute;