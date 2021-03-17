import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SavedCartService } from '@spartacus/cart/saved-cart/core';
import {
  Cart,
  GlobalMessageService,
  GlobalMessageType,
  RoutingService,
} from '@spartacus/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { SavedCartDetailService } from '../saved-cart-detail.service';

@Component({
  selector: 'cx-saved-cart-detail-items',
  templateUrl: './saved-cart-detail-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedCartDetailItemsComponent {
  savedCart$: Observable<
    Cart
  > = this.savedCartDetailService.getCartDetails().pipe(
    tap((cart: Cart) => {
      if (!cart.entries?.length) {
        console.log('DELETE CART');
        this.savedCartService.deleteSavedCart(cart.code);
        this.routingService.go({ cxRoute: 'savedCarts' });
        this.globalMessageService.add(
          {
            key: 'savedCartDetails.cartDeleted',
          },
          GlobalMessageType.MSG_TYPE_CONFIRMATION
        );
      }
    })
  );
  cartLoaded$: Observable<
    boolean
  > = this.savedCartDetailService
    .getSavedCartId()
    .pipe(switchMap((cartId) => this.savedCartService.isStable(cartId)));

  constructor(
    protected globalMessageService: GlobalMessageService,
    protected routingService: RoutingService,
    protected savedCartDetailService: SavedCartDetailService,
    protected savedCartService: SavedCartService
  ) {}
}
