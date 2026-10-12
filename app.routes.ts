import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Products } from './products/products';
import { Admin } from './admin/admin';
import { Cart } from './cart/cart';
import { Recommendations } from './recommendations/recommendations';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: Home
  },

  {
    path: 'products',
    component: Products
  },

  {
    path: 'recommendations',
    component: Recommendations
  },

  {
    path: 'cart',
    component: Cart,
    canActivate: [authGuard]
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'signup',
    component: Signup
  },

  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard]
  },

  {
    path: '**',
    redirectTo: 'home'
  }

];