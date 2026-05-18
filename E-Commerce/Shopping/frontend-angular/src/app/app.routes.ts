import { Routes } from "@angular/router";
import { ProductDetailComponent } from "./product-detail/product-detail.component";
import { ShopComponent } from "./shop/shop.component";
import { SuccessComponent } from "./success/success.component";

export const routes: Routes = [
  { path: "", component: ShopComponent },
  { path: "success", component: SuccessComponent },
  { path: "product/:slug", component: ProductDetailComponent },
  { path: "**", redirectTo: "" },
];
