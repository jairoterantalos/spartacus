import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CmsConfig,
  I18nModule,
  provideDefaultConfig,
  UrlModule,
} from '@spartacus/core';
import { CartNotEmptyGuard } from '@spartacus/storefront';
import { defaultCheckoutConfig } from '../../../config/default-checkout-config';
import { CheckoutAuthGuard } from '../../../guards/checkout-auth.guard';
import { CheckoutStepsSetGuard } from '../../../guards/checkout-steps-set.guard';
import { CheckoutProgressMobileTopComponent } from './checkout-progress-mobile-top.component';

@NgModule({
  imports: [CommonModule, UrlModule, I18nModule, RouterModule],
  providers: [
    provideDefaultConfig(defaultCheckoutConfig),
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        CheckoutProgressMobileTop: {
          component: CheckoutProgressMobileTopComponent,
          guards: [CheckoutAuthGuard, CartNotEmptyGuard, CheckoutStepsSetGuard],
        },
      },
    }),
  ],
  declarations: [CheckoutProgressMobileTopComponent],
  entryComponents: [CheckoutProgressMobileTopComponent],
  exports: [CheckoutProgressMobileTopComponent],
})
export class CheckoutProgressMobileTopModule {}
