import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../pipes/locale.pipes';
import { Newsletter } from './newsletter/newsletter';
import { StoreBenefits } from './store-benefits/store-benefits';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, Newsletter, StoreBenefits],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
