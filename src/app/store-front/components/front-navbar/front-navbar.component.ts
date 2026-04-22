import { AuthService } from '@/auth/services/auth.service';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'front-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './front-navbar.component.html',
  styleUrl: './front-navbar.component.css',
})
export class FrontNavbarComponent {
  authService = inject(AuthService);
}
