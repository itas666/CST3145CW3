const ProductList = {
  template: `
  <div>
  <!-- sidebar to select the sorting for the products -->
<div class="sidebar" v-show="shopStage">
  <h3>Sort by</h3>
  <ul>
<!-- sort by different fields -->
      <li v-for="sort in sorts" v-bind:class="sort == selectedSort ? 'active' : 'inactive'" v-on:click="selectedSort = sort">
          {{ sort }} 
      </li>
      
<!-- sort by ascending or descending order -->
  </ul>
  <ul>
      <li v-bind:class="selectedOrder === 'ascending' ? 'active' : 'inactive'" v-on:click="selectedOrder = 'ascending'">
          Ascending
      </li>
      <li v-bind:class="selectedOrder === 'descending' ? 'active' : 'inactive'" v-on:click="selectedOrder = 'descending'">
          Descending
      </li>
  </ul>
  
  <!-- checkout button -->
  <div class="row">
      <div class="col-4">
          <button class="btn btn-primary" @click="checkout()" v-show="shopStage" v-if="canCheckout">Shopping Cart ({{cartCount}})</button>
          <button class="btn btn-primary" @click="checkout()" v-show="shopStage" v-else disabled>Shopping Cart (0)</button>
      </div>
  </div>
</div>
<div class="container" v-for="(item, index) in sortedProducts" v-show="shopStage">
      <div class="row">
          <div>
              <img :src="item.image" alt="image">
          </div>
          <div class="col">
              <p><h3>Subject: {{item.name}}, {{item.location}}<span v-bind:class='item.icon'></span></h3></p>
              <p>Price: {{item.price}}</p>
              <p>Availability: {{item.availability}}</p>
              <button class="btn btn-primary" @click="addToCart(index)" v-if="canAddToCart(index)" >Add to cart</button>
              <button class="btn btn-primary" @click="addToCart(index)" v-else disabled >Out of stock</button>
              <button class="btn btn-primary" @click="removeFromCart(index)" v-if="canRemoveFromCart(index)">Remove from cart</button>
              <button class="btn btn-primary" @click="removeFromCart(index)" v-else disabled>Remove from cart</button>
          </div>

          <div class="col">
              <p class="itemDescription"><h3>Description:</h3>{{item.description}}</p>
          </div>
      </div>
  </div>
</div>
  `,
  props: {
      products: Array,
      cart: {
          type: Object,
          required: true,
      },
      searchQuery: String,
      shopStage: Boolean
  },
  data() {
      return {
          sorts: ["name", "price", "availability"],
          selectedSort: "name",
          selectedOrder: "ascending",
      };
  },
  methods: {
      addToCart(index, quantity = 1) {
          this.$emit('add-to-cart', this.products[index], quantity);
      },
/* Helper function to check if we can remove from cart */
      canRemoveFromCart(index) {
          return this.cart.quantities[index] > 0;
      },
      canAddToCart(index) {
          return this.products[index].availability > 0;
      },
      checkout() {
          this.$emit('proceedCheckout');
      },
      removeFromCart(index, quantity = -1) {
          this.$emit('remove-from-cart', this.products[index], quantity);
      },
  },
  computed: {
      cartCount() {
          return this.cart.quantities.reduce((a, b) => a + b, 0);
      },
      sortedProducts() { // sort by the different sortings and also by ascending or descending
          if (this.selectedOrder === "ascending") {
              return this.products.sort((a, b) => {
                  if (this.selectedSort === "name") {
                      return a.name.localeCompare(b.name);
                  } else if (this.selectedSort === "price") {
                      return a.price - b.price;
                  } else if (this.selectedSort === "availability") {
                      return a.availability - b.availability;
                  }
              });
          } else if (this.selectedOrder === "descending") {
              return this.products.sort((a, b) => {
                  if (this.selectedSort === "name") {
                      return b.name.localeCompare(a.name);
                  } else if (this.selectedSort === "price") {
                      return b.price - a.price;
                  } else if (this.selectedSort === "availability") {
                      return b.availability - a.availability;
                  }
              });
          }
      },
      canCheckout() {
          return this.cart.products.length > 0;
      },

  },
  filteredProducts() {
      return this.sortedProducts.filter((product) => {
          return product.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
  },
  mounted() {
      console.log("Mounted");
      console.log("Prods:");
      console.log(JSON.stringify(this.products));
  },
};