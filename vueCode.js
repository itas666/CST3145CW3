var shopApp = new Vue({
    el: '#shop',
    data: {
/* Array for our products */
        product: [],
/* Array for our cart where referenced products will be held */
        cart: {product: [], quantity: [], totalPrice: 0},
        total: 0,
        sorts: ['name', 'price', 'availability', 'location'],
        selectedSort: 'name',
        selectedOrder: 'ascending',
        checkoutStage: false,
        shopStage: true,
        checkoutName: '',
        checkoutPhone: '',
        search: ''
    },
    methods: {
/* LOCAL METHODS */
/* Adds a single product to the cart, if it exists, it increases the quantity by one and does not push the item */
        addToCart: function (index) {
            if(this.canAddToCart(index)){
                if (this.cart.product.indexOf(this.product[index]) == -1) {
                    this.cart.product.push(this.product[index]);
                    this.cart.quantity.push(1);
                } else {
                    this.cart.quantity[this.cart.product.indexOf(this.product[index])] += 1;
                }
                this.product[index].availability -= 1;
                this.cart.totalPrice += this.product[index].price;
            }
            this.$forceUpdate();
        },
/* Adds a single product to the cart,
if it exists, it increases the quantity by one and does not push the item */
        getData: function (index) {
            if(this.canAddToCart(index)){
                if (this.cart.product.indexOf(this.product[index]) == -1) {
                    this.cart.product.push(this.product[index]);
                    this.cart.quantity.push(1);
                } else {
                    this.cart.quantity[this.cart.product.indexOf(this.product[index])] += 1;
                }
                this.product[index].availability -= 1;
                this.cart.totalPrice += this.product[index].price;
            }
            this.$forceUpdate();
        },
/* Removes a single item from the cart and adds the availability back to the product list,
if it is the last product to be removed, also remove the entry from the carts products */
        removeFromCart: function (index) {
            if(this.canRemoveFromCart(index)){
                var cartIndex = this.cart.product.indexOf(this.product[index]);
                if(this.cart.quantity[cartIndex] == 1 && cartIndex != -1) {
                    this.cart.totalPrice -= this.product[index].price;
                    this.cart.product.splice(cartIndex, 1);
                    this.cart.quantity.splice(cartIndex, 1);
                } else {
                    this.cart.quantity[cartIndex] -= 1;
                }
                this.product[index].availability += 1;
                this.cart.totalPrice -= this.product[index].price;
            }
            this.$forceUpdate();
        },
/* Helper function to check if we can remove from cart */
        canRemoveFromCart: function (index) {
            var cartIndex = this.cart.product.indexOf(this.product[index]);
            if(cartIndex != -1) {
                return true;
            }
            return false;
        },
/* Clears up the cart completely by removing one by one the taken products
run through all cart and remove items while there is quantity */
        clearCart: function () {
            for (var i = 0; i < this.cart.product.length; i++) {
                while(this.cart.quantity[i] > 0) {
/* find the index of the product in the cart and remove it
the removeFromCart takes the index of the product, not the index of the cart */
                    this.removeFromCart(this.product.indexOf(this.cart.product[i]));
                }
            }
        },
/****************** Clears the cart, prompts a message thanking for the purchase but does not return the availability to the items */
        checkout: function () {
            this.checkoutStage = true;
            this.shopStage = false;
        },
/* Navigation function */
        goBack: function () {
            this.checkoutStage = false;
            this.shopStage = true;
        },
/* Helper function to check if we can add to cart */
        canAddToCart: function (index) {
            return this.product[index].availability > 0;
        },
/*  */
        async createOrderAndUpdateAvailability() {
            const orderDetails = {
            customerName: this.checkoutName,
            customerPhone: this.checkoutPhone,
            items: this.cart.product.map((item, index) => ({
                productId: item._id,
                quantity: this.cart.quantity[index]
            })),
            total: this.cart.totalPrice
            };
        
            await fetch("https://coursework2-env.eba-ik4mpxmi.us-east-1.elasticbeanstalk.com/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderDetails)
            });
        
            for (let i = 0; i < this.cart.product.length; i++) {
            const product = this.cart.product[i];
            const availability = product.availability - this.cart.quantity[i];
            await fetch(`https://coursework2-env.eba-ik4mpxmi.us-east-1.elasticbeanstalk.com/lessons/${product._id}`, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    availability
                })
            });
            }
        },  
/*************** The checkout function just recreates the cart and empties it */
        completeCheckout: function () {
            this.createOrderAndUpdateAvailability();
            this.cart = {product: [], quantity: [], totalPrice: 0};
            alert('Thank you for your purchase!');
            this.goBack();
        },
/* VALIDATION METHODS - CLIENT SIDE */
        validateName: function () {
            return /^[a-zA-Z]+ [a-zA-Z]+$/.test(this.checkoutName);
        },
        validatePhone: function () {
            return /^(\+44|0)7\d{9}$/.test(this.checkoutPhone);
        },
        validateCheckout: function () {
            return this.validateName() && this.validatePhone();
        },
/* Takes the number of taken classes and returns the total price
 THIS WILL NOT WORK AS COMPUTED, DOES NOT UPDATE */
        getCartCount: function () {
            return this.cart.quantity.reduce((sum, a) => sum + a, 0);;
        },
/* END OF LOCAL METHODS */
/* REMOTE METHODS */
/* Fetches the products from the remote server */
        getLessons: function () {
            this.loading = true;
            fetch('https://coursework2-env.eba-ik4mpxmi.us-east-1.elasticbeanstalk.com/lessons')
            .then(response => response.json())
            .then(data => {
                this.product = data;
                this.loading = false;
            })
            .catch(error => {
                console.log(error);
                this.loading = false;
            });
        },
/* POST function to send the checkout data to the server; it also updates the items in the cart
and updates their availability */
        postCheckout: function () {
            this.loading = true;
            fetch('https://coursework2-env.eba-ik4mpxmi.us-east-1.elasticbeanstalk.com/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.checkoutName,
                    phone: this.checkoutPhone,
                    cart: this.cart
                })
            })
            .then(response => response.json())
            .then(data => {
                this.loading = false;
                this.completeCheckout();
            })
            .catch(error => {
                console.log(error);
                this.loading = false;
            });
        }
    },
    computed: {
        canCheckout: function () {
            return this.cart.product.length > 0;
        },
/* Sorts the products depending on the selected sort
Idea from: https://stackoverflow.com/questions/42883835/sort-an-array-in-vue-js */
        sortedProducts: function () {
            return this.product.sort((a, b) => {
                if (this.selectedOrder === 'ascending') {
                    return a[this.selectedSort] > b[this.selectedSort] ? 1 : -1;
                } else {
                    return a[this.selectedSort] < b[this.selectedSort] ? 1 : -1;
                }
            });
        },
/* Filtering function for the search bar according to what we have on the
product array and starts with what is on the search variable */
        filteredProducts: function () {
            return this.sortedProducts.filter((product) => {
                if(product.name.toLowerCase().startsWith(this.search.toLowerCase())
                    || product.description.toLowerCase().includes(this.search.toLowerCase())
                    || product.location.toLowerCase().startsWith(this.search.toLowerCase())
                    || (product.price >= parseInt(this.search)) || (product.availability >= parseInt(this.search))) {
                        return true;
                    }
                return false;
            });
        },
/* autocomplete for the search bar; if search is empty, do not return anything
when search has any data, return the first name of a product returned */
        autocomplete: function () {
            if (this.search == '') {
                return '';
            } else if (this.filteredProducts.length > 0) {
                return this.filteredProducts[0].name;
            }
            return '';
        }
    },
    mounted: function () {
        this.getLessons();
    }
});