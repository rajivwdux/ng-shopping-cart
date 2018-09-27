import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Product } from '../../product.model';
import { ProductService } from '../../product.service';
import { CartService } from '../../../cart/cart.service';
import { ProductDetailWrapperComponent } from '../product-detail-wrapper/product-detail-wrapper.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  search = new FormControl();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.productService.get().subscribe();

    this.products$ = this.productService.getProductByName('');
    // this.search.valueChanges.pipe(
    //   startWith(''),
    //   switchMap(value => this.productService.getProductByName(value))
    // );
  }

  onAddToCart(product: Product) {
    this.cartService.addProduct(product.id);
  }

  onRemoveFromCart(product: Product) {
    this.cartService.removeProduct(product.id);
  }

  onSearch(text: string) {
    this.products$ = this.productService.getProductByName(text);
  }

  onShowProductDetail(productId: number) {
    this.productService
      .getProductById(productId)
      .pipe(take(1))
      .subscribe(product => {
        const dialogRef = this.dialog.open(ProductDetailWrapperComponent, {
          data: product
        });

        dialogRef.afterClosed().subscribe(result => {
          this.cartService.addProduct(result.id, result.amount);
        });
      });
  }
}
