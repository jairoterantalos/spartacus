import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { SavedCartService } from '@spartacus/cart/saved-cart/core';
import {
  Cart,
  GlobalMessageService,
  GlobalMessageType,
  I18nTestingModule,
  RoutingService,
  Translatable,
} from '@spartacus/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SavedCartDetailService } from '../saved-cart-detail.service';
import { SavedCartDetailItemsComponent } from './saved-cart-detail-items.component';

const mockSavedCart: Cart = {
  description: 'test-cart-description',
  entries: [{ entryNumber: 0, product: { name: 'test-product' } }],
  name: 'test-cart-name',
  totalItems: 1,
  code: '1234',
};

const mockEmptySavedCart: Cart = {
  description: 'test-cart-description',
  entries: [],
  name: 'test-cart-name',
  totalItems: 0,
  code: '1234',
};

const cart$ = new BehaviorSubject<Cart>(mockSavedCart);

class MockSavedCartDetailService implements Partial<SavedCartDetailService> {
  getCartDetails(): Observable<Cart> {
    return cart$.asObservable();
  }
  getSavedCartId(): Observable<string> {
    return of();
  }
}

class MockSavedCartService implements Partial<SavedCartService> {
  isStable(_cartId: string): Observable<boolean> {
    return of();
  }
  deleteSavedCart(_cartId: string): void {}
}

class MockRoutingService implements Partial<RoutingService> {
  go(): void {}
}

class MockGlobalMessageService implements Partial<GlobalMessageService> {
  add(
    _text: string | Translatable,
    _type: GlobalMessageType,
    _timeout?: number
  ): void {}
}

describe('SavedCartDetailItemsComponent', () => {
  let component: SavedCartDetailItemsComponent;
  let fixture: ComponentFixture<SavedCartDetailItemsComponent>;
  let el: DebugElement;
  let globalMessageService: GlobalMessageService;
  let routingService: RoutingService;
  let savedCartService: SavedCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), I18nTestingModule],
      declarations: [SavedCartDetailItemsComponent],
      providers: [
        {
          provide: SavedCartService,
          useClass: MockSavedCartService,
        },
        {
          provide: SavedCartDetailService,
          useClass: MockSavedCartDetailService,
        },
        { provide: GlobalMessageService, useClass: MockGlobalMessageService },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
      ],
    }).compileComponents();

    globalMessageService = TestBed.inject(GlobalMessageService);
    routingService = TestBed.inject(RoutingService);
    savedCartService = TestBed.inject(SavedCartService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedCartDetailItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart item list', () => {
    cart$.next(mockSavedCart);
    fixture.detectChanges();

    expect(el.query(By.css('cx-cart-item-list'))).toBeTruthy();
  });

  it('should trigger delete cart actions if cart has no entries', () => {
    spyOn(globalMessageService, 'add');
    spyOn(routingService, 'go');
    spyOn(savedCartService, 'deleteSavedCart');

    cart$.next(mockEmptySavedCart);

    expect(savedCartService.deleteSavedCart).toHaveBeenCalledWith(
      mockEmptySavedCart.code
    );
    expect(routingService.go).toHaveBeenCalledWith({
      cxRoute: 'savedCarts',
    });
    expect(globalMessageService.add).toHaveBeenCalledWith(
      { key: 'savedCartDetails.cartDeleted' },
      GlobalMessageType.MSG_TYPE_CONFIRMATION
    );
  });
});
