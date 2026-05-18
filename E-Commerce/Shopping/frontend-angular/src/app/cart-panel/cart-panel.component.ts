import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable, firstValueFrom } from "rxjs";
import type { CartLine } from "../models/product.model";
import { CartService } from "../services/cart.service";
import { ShopApiService } from "../services/shop-api.service";

@Component({
  selector: "app-cart-panel",
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, FormsModule],
  templateUrl: "./cart-panel.component.html",
  styleUrls: ["./cart-panel.component.css"],
})
export class CartPanelComponent {
  /** When true, mobile drawer cart is visible. */
  @Input() panelOpen = false;
  @Output() panelOpenChange = new EventEmitter<boolean>();

  lines$: Observable<CartLine[]>;
  email = "";
  checkoutError = "";
  checkoutLoading = false;

  constructor(
    private readonly cart: CartService,
    private readonly api: ShopApiService
  ) {
    this.lines$ = this.cart.lines;
  }

  close(): void {
    this.panelOpenChange.emit(false);
  }

  setQty(id: string, q: number): void {
    this.cart.setQuantity(id, q);
  }

  remove(id: string): void {
    this.cart.removeLine(id);
  }

  async pay(): Promise<void> {
    this.checkoutError = "";
    const email = this.email.trim();
    if (!email) {
      this.checkoutError = "Enter your email.";
      return;
    }
    const lines = this.cart.snapshot();
    if (!lines.length) {
      this.checkoutError = "Cart is empty.";
      return;
    }
    this.checkoutLoading = true;
    const origin = window.location.origin;
    try {
      const { checkout_url } = await firstValueFrom(
        this.api.createCheckout({
          customer_email: email,
          items: lines.map((l) => ({
            product_id: l.product.id,
            quantity: l.quantity,
          })),
          success_url: `${origin}/#/success`,
          cancel_url: `${origin}/#/`,
        })
      );
      window.location.href = checkout_url;
    } catch (e: unknown) {
      this.checkoutError = e instanceof Error ? e.message : "Checkout failed";
    } finally {
      this.checkoutLoading = false;
    }
  }

  count(lines: CartLine[]): number {
    return lines.reduce((s, l) => s + l.quantity, 0);
  }

  total(lines: CartLine[]): number {
    return lines.reduce((s, l) => s + Number(l.product.price) * l.quantity, 0);
  }
}
