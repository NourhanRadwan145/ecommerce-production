import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from './user.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductsService } from '../products/product.service';
import { Product } from '../products//product.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule],
  providers: [UserService,ProductsService], 
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
  user: User | null = null;
  cart: any;
  products: Product[] = []; // Add a property to store the products
  userForm!: FormGroup; // Add ! to indicate that userForm will be initialized in ngOnInit
  formSubmitted = false;

  constructor(private userService: UserService, private productService: ProductsService, private router: Router,private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    const userId = '662b8775a566fe5003f222ee'; // User ID to fetch

    this.userForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });

    this.userService.getUserById(userId).subscribe(user => {
    this.user = user;
    this.userForm.patchValue({
      fullName: user.username,
      email: user.email
    });
  });

    this.userService.getCartByUserId(userId).subscribe((cart: any) => {
      console.log(cart); // Log the cart object to see its structure
      this.cart = cart;
      this.loadProducts(); // Load the products for the cart items
    });
  }

  loadProducts() {
    let totalPrice = 0; // Initialize total price
    let totalQuantity = 0; // Initialize total quantity
    const deliveryCost = 300;
    const totalElement = document.querySelector('.total'); // Select the total element in the DOM
  
    if (totalElement) {
      this.cart.cart.forEach((item: { product: string, quantity: number }) => {
        this.productService.getProductById(item.product).subscribe((product: Product) => {
          this.products.push(product);
          totalPrice += product.price * item.quantity; // Multiply item quantity by price and add to total price
          totalQuantity += item.quantity; // Add item quantity to total quantity
        });
      });
  
      // Update total price and total quantity in the DOM after all products are loaded
      this.productService.getProductById(this.cart.cart[0].product).subscribe(() => {
        const totalItems = this.products.length;
        totalElement.innerHTML = `
          <span style='float:left;'>
            <div class='thin dense'>Total Items</div>
            <div class='thin dense'>Delivery</div>
            TOTAL
          </span>
          <span style='float:right; text-align:right;'>
            <div class='thin dense'>${totalQuantity}</div> <!-- Use totalQuantity instead of totalItems -->
            <div class='thin dense'>$${deliveryCost.toFixed(2)}</div>
            $${(totalPrice + deliveryCost).toFixed(2)}
          </span>
        `;
      });
    }
  }
  
   

// Method to get product by ID
getProductById(productId: string): Product | undefined {
  return this.products.find(product => product._id === productId);
}

navigateToPayment() {
  this.formSubmitted = true;
  if (this.userForm.valid) {
    // Save the user info form data and cart to local storage
    localStorage.setItem('userInfo', JSON.stringify(this.userForm.value));
    localStorage.setItem('cart', JSON.stringify(this.cart));

    // Navigate to payment page
    this.router.navigate(['/payment']);
  }
}



placeOrder() {
    this.formSubmitted = true;
    if (this.userForm.valid) {
        const userId = '662b8775a566fe5003f222ee'; 
        this.userService.addProductToOrder(userId).subscribe(
            (response) => {
                console.log('Order placed successfully', response);
                this.router.navigate(['/confirm']);
            },
            (error) => {
                console.error('Failed to place order:', error);
            }
        );
    }
}
}