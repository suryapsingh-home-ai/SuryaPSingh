import { NgFor, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import type { OrderResult } from "../models/product.model";
import { ShopApiService } from "../services/shop-api.service";

@Component({
  selector: "app-success",
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: "./success.component.html",
  styleUrls: ["./success.component.css"],
})
export class SuccessComponent implements OnInit {
  order: OrderResult | null = null;
  error = "";

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ShopApiService
  ) {}

  ngOnInit(): void {
    const sid =
      this.route.snapshot.queryParamMap.get("session_id") ||
      this.parseSessionFromWindow();
    if (!sid) {
      this.error = "Missing session id.";
      return;
    }
    this.api.getOrderStatus({ session_id: sid }).subscribe({
      next: (o) => {
        this.order = o;
        this.error = "";
      },
      error: (e: Error) => {
        this.error = e.message || "Could not load order";
        this.order = null;
      },
    });
  }

  /** Stripe may append ?session_id= to the hash URL; also read from top-level search. */
  private parseSessionFromWindow(): string {
    const u = new URL(window.location.href);
    let sid = u.searchParams.get("session_id");
    if (!sid && u.hash) {
      const hash = u.hash.startsWith("#") ? u.hash.slice(1) : u.hash;
      const qi = hash.indexOf("?");
      if (qi !== -1) {
        sid = new URLSearchParams(hash.slice(qi + 1)).get("session_id");
      }
    }
    return sid || "";
  }
}
