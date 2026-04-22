import { ProductCarouselComponent } from '@/products/components/product-carousel/product-carousel.component';
import { Product } from '@/products/interfaces/product.interface';
import { FormUtils } from '@/utils/forms-utils';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorLabelComponent } from '../../../../shared/components/form-error-label/form-error-label.component';
import { ProductsService } from '@/products/services/products.service';
import { Router } from '@angular/router';
import { first, firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [
    ProductCarouselComponent,
    ReactiveFormsModule,
    FormErrorLabelComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  // Común properties
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  imageFileList: FileList | undefined = undefined;

  // Signals
  wasSaved = signal(false);
  tempImages = signal<string[]>([]);

  // Computed Signals
  imagesToCarousel = computed(() => {
    const currentProductImages = [
      ...this.product().images,
      ...this.tempImages(),
    ];
    return currentProductImages;
  });

  // Inputs
  product = input.required<Product>();

  // Inyecciones
  fb = inject(FormBuilder);
  productService = inject(ProductsService);
  router = inject(Router);

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
    gender: [
      'men',
      [Validators.required, Validators.pattern(/men|women,kid|unisex/)],
    ],
  });

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.patchValue(formLike as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
  }

  onSizeClicked(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];

    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid) return;

    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags:
        formValue.tags
          ?.toLocaleLowerCase()
          .split(',')
          .map((tag) => tag.trim()) ?? [],
    };

    if (this.product().id === 'new') {
      // Crear Producto
      const product = await firstValueFrom(
        this.productService.createProduct(productLike, this.imageFileList),
      );

      // Navegamos
      this.router.navigate(['/admin/product/', product.id]);
    } else {
      // Actualizamos Producto
      await firstValueFrom(
        this.productService.updateProduct(
          this.product().id,
          productLike,
          this.imageFileList,
        ),
      );
    }

    this.wasSaved.set(true);
    setTimeout(() => {
      this.wasSaved.set(false);
    }, 3000);
  }

  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.tempImages.set([]);

    this.imageFileList = fileList ?? undefined;

    const imageUrls = Array.from(fileList ?? []).map((file) =>
      URL.createObjectURL(file),
    );

    this.tempImages.set(imageUrls);
  }
}
