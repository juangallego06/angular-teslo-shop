import { ProductsService } from '@/products/services/products.service';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductCarouselComponent } from '@/products/components/product-carousel/product-carousel.component';

@Component({
  selector: 'app-product-page',
  imports: [ProductCarouselComponent],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css',
})
export class ProductPageComponent {
  activatedRoute = inject(ActivatedRoute);
  productsService = inject(ProductsService);

  productIdSlug: string = this.activatedRoute.snapshot.params['idSlug'];

  productResource = rxResource({
    request: () => ({ idSlug: this.productIdSlug }),
    loader: ({ request }) => {
      return this.productsService.getProductByIdSlug(request.idSlug);
    },
  });
}
