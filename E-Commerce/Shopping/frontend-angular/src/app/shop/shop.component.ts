import { NgFor, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { CartPanelComponent } from "../cart-panel/cart-panel.component";
import type { Product } from "../models/product.model";
import { CartService } from "../services/cart.service";
import { ShopApiService } from "../services/shop-api.service";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink, CartPanelComponent],
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.css"],
})
export class ShopComponent implements OnInit, OnDestroy {
  allProducts: Product[] = [];
  loading = true;
  error = "";
  searchInput = "";
  searchQuery = "";
  cartOpen = false;
  cartCount = 0;
  private cartSub?: Subscription;

  constructor(
    private readonly api: ShopApiService,
    private readonly cart: CartService
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cart.lines.subscribe((lines) => {
      this.cartCount = lines.reduce((s, l) => s + l.quantity, 0);
    });
    this.api.getProducts().subscribe({
      next: (p) => {
        this.allProducts = p;
        this.loading = false;
      },
      error: (e: Error) => {
        this.error = e.message || "Could not load catalog";
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get filteredProducts(): Product[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allProducts;
    return this.allProducts.filter((p) => {
      const cat = (p.category?.name || "").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        cat.includes(q)
      );
    });
  }

  doSearch(): void {
    this.searchQuery = this.searchInput.trim().toLowerCase();
  }

  clearSearch(): void {
    this.searchInput = "";
    this.searchQuery = "";
  }

  addToCart(p: Product): void {
    this.cart.add(p, 1);
  }
}
