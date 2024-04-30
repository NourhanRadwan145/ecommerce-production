import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProductsService } from './product.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../checkout/user.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule,HttpClientModule,FormsModule],
  providers: [UserService,ProductsService], 
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  encapsulation: ViewEncapsulation.None
})

export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'All Categories';
  minPrice: number | undefined;
  maxPrice: number | undefined;

  constructor(
    private userService: UserService,
    private productService: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || 'All Categories';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (response: any) => {
        this.products = response['All Products'].filter((product: any) => product.quantity > 0);
        this.applyCategoryFilter();
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }  

  //Apply The Filter by Category 
  applyCategoryFilter(): void {
    if (this.selectedCategory === 'All Categories') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter((product) =>
        product.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }
  }
  
  // Apply price filter
  applyPriceFilter(): void {
    this.filteredProducts = this.products.filter((product) => {
      const price = product.price;
      return (
        (this.minPrice === undefined || price >= this.minPrice) &&
        (this.maxPrice === undefined || price <= this.maxPrice)
      );
    });
  }
  
  // Reset price filter
  resetPriceFilter(): void {
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.filteredProducts = this.products;
  }

  //Apply Name Filter
  applyNameFilter(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.filteredProducts = this.products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  navigateToProductDetails(productId: string): void {
    this.router.navigate(['product', productId]);
  }

  addToCart(product: any): void {
    this.productService.getUserByToken().subscribe(
      (response: any) => {
        const userId = response.data._id;
        const quantity = 1;

        console.log('userId:', userId);
        console.log('product._id:', product._id);
        console.log('quantity:', quantity);

        this.userService.addProductToCart(userId, product._id, quantity).subscribe(
          (response: any) => {
            console.log('Item added to cart successfully:', response);
          },
          (error: any) => {
            if (error.error && error.error.message) {
              console.error('Error adding item to cart:', error.error.message);
            } else {
              console.error('Error adding item to cart:', error);
            }
          }
        );
      },
      (error: any) => {
        if (error.error && error.error.message) {
          console.error('Error getting user details:', error.error.message);
        } else {
          console.error('Error getting user details:', error);
        }
      }
    );
  }  
  
  ngAfterViewInit(): void {

    // Set default view mode to grid
    document.addEventListener('DOMContentLoaded', () => {
      const gridElement = document.querySelector('.grid') as HTMLElement;
      if (gridElement) {
        gridElement.click();
      }
    });
    
    // Set default mode to light
    document.documentElement.classList.add('light');
    document.querySelector('.mode-switch')?.classList.add('active');

    // Event listener for list view
    document.querySelector('.list')?.addEventListener('click', () => {
      document.querySelector('.list')?.classList.add('active');
      document.querySelector('.grid')?.classList.remove('active');
      document.querySelector('.large')?.classList.remove('active');
      document.querySelectorAll('.products-area-wrapper').forEach((view) => {
        view.classList.remove('gridView', 'largeView');
        view.classList.add('tableView');
      });
    });

    // Event listener for grid view
    document.querySelector('.grid')?.addEventListener('click', () => {
      document.querySelector('.list')?.classList.remove('active');
      document.querySelector('.grid')?.classList.add('active');
      document.querySelector('.large')?.classList.remove('active');
      document.querySelectorAll('.products-area-wrapper').forEach((view) => {
        view.classList.remove('tableView', 'largeView');
        view.classList.add('gridView');
      });
    });

    // Event listener for large view
    document.querySelector('.large')?.addEventListener('click', () => {
      document.querySelector('.list')?.classList.remove('active');
      document.querySelector('.grid')?.classList.remove('active');
      document.querySelector('.large')?.classList.add('active');
      document.querySelectorAll('.products-area-wrapper').forEach((view) => {
        view.classList.remove('tableView', 'gridView');
        view.classList.add('largeView');
      });
    });

    // Event listener for filter menu
    document.querySelector('.jsFilter')?.addEventListener('click', () => {
      document.querySelector('.filter-menu')?.classList.toggle('active');
    });

    // Event listener for mode switch
    const modeSwitch = document.querySelector('.mode-switch');
    modeSwitch?.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
      modeSwitch?.classList.toggle('active');
    });

    // Event listener for toggle sidebar visibility
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    toggleButton?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      toggleButton?.classList.toggle('active');
    });
  }
}