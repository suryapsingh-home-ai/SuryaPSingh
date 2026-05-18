import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import type { CartLine, Product } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class CartService {
  private readonly lines$ = new BehaviorSubject<CartLine[]>([]);
  readonly lines = this.lines$.asObservable();

  snapshot(): CartLine[] {
    return this.lines$.value;
  }

  add(product: Product, qty = 1): void {
    const lines = [...this.lines$.value];
    const i = lines.findIndex((l) => l.product.id === product.id);
    if (i >= 0) {
      lines[i] = { ...lines[i], quantity: lines[i].quantity + qty };
    } else {
      lines.push({ product, quantity: qty });
    }
    this.lines$.next(lines);
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.lines$.next(this.lines$.value.filter((l) => l.product.id !== productId));
      return;
    }
    const lines = this.lines$.value.map((l) =>
      l.product.id === productId ? { ...l, quantity } : l
    );
    this.lines$.next(lines);
  }

  removeLine(productId: string): void {
    this.lines$.next(this.lines$.value.filter((l) => l.product.id !== productId));
  }

  totalCount(): number {
    return this.lines$.value.reduce((s, l) => s + l.quantity, 0);
  }

  subtotal(): number {
    return this.lines$.value.reduce(
      (s, l) => s + Number(l.product.price) * l.quantity,
      0
    );
  }
}
