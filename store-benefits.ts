import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/locale.pipes';

@Component({
  selector: 'app-store-benefits',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './store-benefits.html',
  styleUrl: './store-benefits.css'
})
export class StoreBenefits {}
