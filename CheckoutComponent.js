const Checkout = {
  template: `
  <!-- Total price and complete checkout process -->
<div>
<div class="sidebar" v-show="checkoutStage">
  <div class="">
      <h1>Checkout</h1>
      <h2>Total price: {{cart.totalPrice}}</h2>
      <!-- input texts for the checkout name and checkout phone in the vue application -->
      <div class="form-group">
          <label for="checkoutName">Name</label>
          <input type="text" class="form-control" id="checkoutName" v-model="checkoutName">
          <label for="checkoutName">Phone</label>
          <input type="text" class="form-control" id="checkoutPhone" v-model="checkoutPhone">
      </div>
      <button class="btn btn-primary" @click="completeCheckout()" v-if="validateCheckout()" >Complete checkout</button>
      <button class="btn btn-primary" @click="completeCheckout()" v-else disabled >Complete checkout</button>
      <button class="btn btn-primary" @click="goBack()">Go Back</button>
  </div>
</div>
<!-- Cart items -->
      
<div class="container" v-for="(item, index) in cart.products">
  <div class="row">
      <div>
          <img :src="item.image" alt="image">
      </div>
      <div class="col">
          <p><h3>Subject: {{item.name}}, {{item.location}}<span v-class='item.icon'></span></h3></p>
          <p>Quantity: {{cart.quantities[index]}}</p>
          <p>Total price: {{item.price * cart.quantities[index]}}</p>
      </div>
      <div class="col">
          <button class="btn btn-primary" @click="removeFromCart(index)">Remove from cart</button>
      </div>
  </div>
</div>
</div>
  `,
  props: {
      cart: {
          type: Object,
          required: true,
      },
      checkoutStage: Boolean,
  },
  data() {
      return {
          checkoutName: "",
          checkoutPhone: "",
      };
  },
  methods: {
      completeCheckout() {
          alert("Thank you for your purchase!");
          this.$emit("reset-cart");
      },
      /* VALIDATION METHODS - CLIENT SIDE */
      validateName() {
          console.log(JSON.stringify(this.cart));
          return /^[a-zA-Z]+ [a-zA-Z]+$/.test(this.checkoutName);
      },
      validatePhone() {
          return /^(\+44|0)7\d{9}$/.test(this.checkoutPhone);
      },
      validateCheckout() {
          return this.validateName() && this.validatePhone();
      },
      goBack() {
          this.$emit("go-back");
      },
      removeFromCart(index) {
          this.$emit("remove-from-cart", this.cart.products[index], -1);
      },
  },
};