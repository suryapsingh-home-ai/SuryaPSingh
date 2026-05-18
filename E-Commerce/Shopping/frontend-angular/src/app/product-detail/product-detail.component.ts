import { NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { EMPTY, Subscription, switchMap } from "rxjs";
import { CartPanelComponent } from "../cart-panel/cart-panel.component";
import type { Product } from "../models/product.model";
import { CartService } from "../services/cart.service";
import { ShopApiService } from "../services/shop-api.service";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [NgIf, RouterLink, CartPanelComponent],
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.css"],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = true;
  error = "";
  cartOpen = false;
  cartCount = 0;
  private routeSub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ShopApiService,
    private readonly cart: CartService
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cart.lines.subscribe((lines) => {
      this.cartCount = lines.reduce((s, l) => s + l.quantity, 0);
    });
    this.routeSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get("slug");
          if (!slug) {
            this.loading = false;
            this.error = "Missing product.";
            return EMPTY;
          }
          this.loading = true;
          this.error = "";
          this.product = null;
          return this.api.getProduct(slug);
        })
      )
      .subscribe({
        next: (p) => {
          this.product = p;
          this.loading = false;
        },
        error: (e: Error) => {
          this.error = e.message || "Could not load product";
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  addToCart(p: Product): void {
    this.cart.add(p, 1);
  }
}
