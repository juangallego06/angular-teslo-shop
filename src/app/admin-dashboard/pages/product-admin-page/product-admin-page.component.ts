import { ProductsService } from '@/products/services/products.service';
import { Component, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ProductDetailsComponent } from './product-details/product-details.component';

@Component({
  selector: 'app-product-admin-page',
  imports: [ProductDetailsComponent],
  templateUrl: './product-admin-page.component.html',
  styleUrl: './product-admin-page.component.css',
})
export class ProductAdminPageComponent {
  activateRoute = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  router = inject(Router);

  productId = toSignal(
    this.activateRoute.params.pipe(map((params) => params['id'])),
  );

  productResource = rxResource({
    request: () => ({ productId: this.productId() }),
    loader: ({ request }) => {
      return this.productsService.getProductById(request.productId);
    },
  });

  redirectEffect = effect(() => {
    if (this.productResource.error()) {
      this.router.navigate(['admin/products']);
    }
  });
}
