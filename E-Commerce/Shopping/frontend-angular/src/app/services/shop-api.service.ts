import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";
import type { CheckoutPayload, OrderResult, Product } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class ShopApiService {
  private readonly base = environment.apiUrl.replace(/\/$/, "");

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/api/products/`).pipe(
      catchError(() => throwError(() => new Error("Failed to load products")))
    );
  }

  getProduct(slug: string): Observable<Product> {
    const enc = encodeURIComponent(slug);
    return this.http.get<Product>(`${this.base}/api/products/${enc}/`).pipe(
      catchError((err) => {
        const msg =
          err?.error?.detail && typeof err.error.detail === "string"
            ? err.error.detail
            : "Failed to load product";
        return throwError(() => new Error(msg));
      })
    );
  }

  createCheckout(payload: CheckoutPayload): Observable<{ checkout_url: string }> {
    return this.http
      .post<{ checkout_url: string }>(`${this.base}/api/checkout/`, payload)
      .pipe(
        catchError((err) => {
          const detail = err?.error?.detail;
          const msg =
            typeof detail === "string" ? detail : "Checkout failed";
          return throwError(() => new Error(msg));
        })
      );
  }

  getOrderStatus(params: { session_id?: string; order_id?: string }): Observable<OrderResult> {
    let httpParams = new HttpParams();
    if (params.session_id) httpParams = httpParams.set("session_id", params.session_id);
    if (params.order_id) httpParams = httpParams.set("order_id", params.order_id);
    return this.http
      .get<OrderResult>(`${this.base}/api/orders/status/`, { params: httpParams })
      .pipe(
        catchError(() => throwError(() => new Error("Order not found")))
      );
  }
}
