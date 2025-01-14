import { ChangeDetectorRef, Pipe, PipeTransform, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormControl } from '@angular/forms';
import { I18nTestingModule, OrderEntry } from '@spartacus/core';
import {
  CommonConfiguratorTestUtilsService,
  CommonConfiguratorUtilsService,
  ConfigurationInfo,
  ConfiguratorCartEntryBundleInfoService,
  ConfiguratorType,
} from '@spartacus/product-configurator/common';
import { BreakpointService, CartItemContext } from '@spartacus/storefront';
import { of, ReplaySubject } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { ConfiguratorCartEntryBundleInfoComponent } from './configurator-cart-entry-bundle-info.component';

@Pipe({
  name: 'cxNumeric',
})
class MockNumericPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

class MockCartItemContext implements Partial<CartItemContext> {
  item$ = new ReplaySubject<OrderEntry>(1);
  readonly$ = new ReplaySubject<boolean>(1);
  quantityControl$ = new ReplaySubject<FormControl>(1);
}

const configurationInfos: ConfigurationInfo[] = [
  {
    configurationLabel: 'Canon ABC',
    configurationValue: '5 x $1,000.00',
    configuratorType: ConfiguratorType.CPQ,
    status: 'SUCCESS',
  },
  {
    configurationLabel: 'Canon DEF',
    configurationValue: '10',
    configuratorType: ConfiguratorType.CPQ,
    status: 'SUCCESS',
  },
  {
    configurationLabel: 'Canon HJZ',
    configurationValue: '$1,000.00',
    configuratorType: ConfiguratorType.CPQ,
    status: 'SUCCESS',
  },
];

const entry: OrderEntry = {
  configurationInfos: configurationInfos,
};

describe('ConfiguratorCartEntryBundleInfoComponent', () => {
  let component: ConfiguratorCartEntryBundleInfoComponent;
  let fixture: ComponentFixture<ConfiguratorCartEntryBundleInfoComponent>;
  let changeDetectorRef: ChangeDetectorRef;
  let htmlElem: HTMLElement;
  let mockCartItemContext: MockCartItemContext;
  let commonConfigUtilsService: CommonConfiguratorUtilsService;
  let configCartEntryBundleInfoService: ConfiguratorCartEntryBundleInfoService;
  let breakpointService: BreakpointService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [ConfiguratorCartEntryBundleInfoComponent, MockNumericPipe],
      providers: [
        { provide: CartItemContext, useClass: MockCartItemContext },
        {
          provide: ControlContainer,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    commonConfigUtilsService = TestBed.inject(
      CommonConfiguratorUtilsService as Type<CommonConfiguratorUtilsService>
    );
    configCartEntryBundleInfoService = TestBed.inject(
      ConfiguratorCartEntryBundleInfoService as Type<ConfiguratorCartEntryBundleInfoService>
    );

    spyOn(
      commonConfigUtilsService,
      'isBundleBasedConfigurator'
    ).and.callThrough();
    spyOn(
      configCartEntryBundleInfoService,
      'retrieveLineItems'
    ).and.callThrough();

    breakpointService = TestBed.inject(
      BreakpointService as Type<BreakpointService>
    );

    fixture = TestBed.createComponent(ConfiguratorCartEntryBundleInfoComponent);
    changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
    component = fixture.componentInstance;
    htmlElem = fixture.nativeElement;
    mockCartItemContext = TestBed.inject(CartItemContext) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose orderEntry$', (done) => {
    const orderEntry: OrderEntry = { orderCode: '123' };
    component.orderEntry$.pipe(take(1)).subscribe((value) => {
      expect(value).toBe(orderEntry);
      done();
    });

    mockCartItemContext.item$.next(orderEntry);
  });

  it('should expose quantityControl$', (done) => {
    const quantityControl = new FormControl();
    component.quantityControl$.pipe(take(1)).subscribe((value) => {
      expect(value).toBe(quantityControl);
      done();
    });

    mockCartItemContext.quantityControl$.next(quantityControl);
  });

  it('should expose readonly$', (done) => {
    component.readonly$.pipe(take(2), toArray()).subscribe((values) => {
      expect(values).toEqual([true, false]);
      done();
    });

    mockCartItemContext.readonly$.next(true);
    mockCartItemContext.readonly$.next(false);
  });

  describe('bundle info for cart entry', () => {
    it('should not be displayed if model provides empty array', () => {
      mockCartItemContext.item$.next({
        statusSummaryList: null,
        configurationInfos: [
          {
            configuratorType: 'ANOTHERCPQCONFIGURATOR',
          },
        ],
      });
      mockCartItemContext.readonly$.next(false);
      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-item-infos'
      );
    });

    it('should be displayed if model provides a success entry', () => {
      mockCartItemContext.item$.next({
        statusSummaryList: null,
        configurationInfos: [
          {
            configurationLabel: 'Color',
            configurationValue: 'Blue',
            configuratorType: ConfiguratorType.CPQ,
            status: 'SUCCESS',
          },
        ],
      });
      mockCartItemContext.readonly$.next(false);
      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-item-infos'
      );
    });

    it('should be displayed if model provides a warning entry', () => {
      mockCartItemContext.item$.next({
        statusSummaryList: null,
        configurationInfos: [
          {
            configurationLabel: 'Pricing',
            configurationValue: 'could not be carried out',
            configuratorType: ConfiguratorType.CPQ,
            status: 'WARNING',
          },
        ],
      });
      mockCartItemContext.readonly$.next(false);

      fixture.detectChanges();
      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        '.cx-item-infos'
      );
    });
  });

  describe('toggleItems', () => {
    it('should return corresponding state after toggling the link show / hide items', () => {
      expect(component.hideItems).toBe(true);
      component.toggleItems();
      expect(component.hideItems).toBe(false);
      component.toggleItems();
      expect(component.hideItems).toBe(true);
    });
  });

  describe('isBundleBasedConfigurator', () => {
    it('should return false because the configurator type is not bundle based one', () => {
      entry.configurationInfos[0].configuratorType =
        'notBundleBasedConfiguratorType';
      fixture.detectChanges();
      expect(component.isBundleBasedConfigurator(entry)).toBe(false);
    });

    it('should return true because the configurator type is a bundle based one', () => {
      entry.configurationInfos[0].configuratorType = ConfiguratorType.CPQ;
      fixture.detectChanges();
      expect(component.isBundleBasedConfigurator(entry)).toBe(true);
    });

    it('should return false in case no configuration infos are available', () => {
      const entryWoConfigInfo: OrderEntry = {};
      fixture.detectChanges();
      expect(component.isBundleBasedConfigurator(entryWoConfigInfo)).toBe(
        false
      );
    });
  });

  describe('isDesktop', () => {
    it('should return `false` because we deal with mobile widget', () => {
      spyOn(breakpointService, 'isUp').and.returnValue(of(false));
      let result: boolean;
      component
        .isDesktop()
        .subscribe((br) => (result = br))
        .unsubscribe();
      expect(result).toBe(false);
    });

    it('should return `true` because we deal with desktop widget', () => {
      spyOn(breakpointService, 'isUp').and.returnValue(of(true));
      let result: boolean;
      component
        .isDesktop()
        .subscribe((br) => (result = br))
        .unsubscribe();
      expect(result).toBe(true);
    });
  });

  describe('check component structure', () => {
    describe('without any line item information', () => {
      beforeEach(() => {
        mockCartItemContext.item$.next({
          statusSummaryList: null,
          configurationInfos: [],
          product: {
            configurable: true,
          },
        });
        mockCartItemContext.readonly$.next(false);
        mockCartItemContext.quantityControl$.next(new FormControl());
        fixture.detectChanges();
      });

      it('should not display number of bundle items', () => {
        let numberOfItems: number = 0;
        component.numberOfLineItems$.subscribe(
          (value) => (numberOfItems = value)
        );
        expect(numberOfItems).toBe(0);

        CommonConfiguratorTestUtilsService.expectElementNotPresent(
          expect,
          htmlElem,
          '.cx-number-items'
        );
      });

      it('should not display toggle link', () => {
        CommonConfiguratorTestUtilsService.expectElementNotPresent(
          expect,
          htmlElem,
          '.cx-toggle-hide-items'
        );
      });

      it('should not display Edit Configuration link', () => {
        CommonConfiguratorTestUtilsService.expectElementNotPresent(
          expect,
          htmlElem,
          'cx-configure-cart-entry'
        );
      });
    });

    describe('with line item information', () => {
      beforeEach(() => {
        mockCartItemContext.item$.next({
          statusSummaryList: null,
          configurationInfos: configurationInfos,
          product: {
            configurable: true,
          },
        });
        mockCartItemContext.readonly$.next(false);
        mockCartItemContext.quantityControl$.next(new FormControl());
        fixture.detectChanges();
      });

      it('should display number of bundle items', () => {
        let numberOfItems: number = 0;
        component.numberOfLineItems$.subscribe(
          (value) => (numberOfItems = value)
        );
        expect(numberOfItems).toBe(configurationInfos?.length);

        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          '.cx-number-items'
        );

        const expectedText = 'configurator.header.items count:' + numberOfItems;

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-number-items',
          expectedText
        );
      });

      it('should display toggle link', () => {
        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          '.cx-toggle-hide-items'
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-toggle-hide-items',
          'configurator.header.show'
        );

        expect(component.hideItems).toBe(true);
        component.toggleItems();
        changeDetectorRef.detectChanges();
        expect(component.hideItems).toBe(false);

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-toggle-hide-items',
          'configurator.header.hide'
        );
      });

      it('should display Edit Configuration link', () => {
        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          'cx-configure-cart-entry'
        );
      });
    });

    describe('cart entry bundle info with price and quantity', () => {
      beforeEach(() => {
        mockCartItemContext.item$.next({
          statusSummaryList: null,
          configurationInfos: [
            {
              configurationLabel: 'Canon ABC',
              configurationValue: '5 x $1,000.00',
              configuratorType: ConfiguratorType.CPQ,
              status: 'SUCCESS',
            },
          ],
          product: {
            configurable: true,
          },
        });
        mockCartItemContext.readonly$.next(false);
        mockCartItemContext.quantityControl$.next(new FormControl());
        component.hideItems = false;
        fixture.detectChanges();
      });

      it('should display in desktop mode', () => {
        spyOn(breakpointService, 'isUp').and.returnValue(of(true));
        fixture.detectChanges();
        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          '.cx-item-infos.open'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-info',
          1
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-price span.cx-item',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-price span.cx-item',
          '$1,000.00'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          '5'
        );
      });

      it('should display in mobile mode', () => {
        spyOn(breakpointService, 'isUp').and.returnValue(of(false));
        fixture.detectChanges();
        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          '.cx-item-infos.open'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-info',
          1
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-identifier',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-identifier',
          'configurator.attribute.quantity'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          '5'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-price span.cx-identifier',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-price span.cx-identifier',
          'configurator.overviewForm.itemPrice'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-price span.cx-item',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-price span.cx-item',
          '$1,000.00'
        );
      });
    });

    describe('cart entry bundle info with only quantity', () => {
      beforeEach(() => {
        mockCartItemContext.item$.next({
          statusSummaryList: null,
          configurationInfos: [
            {
              configurationLabel: 'Canon ABC',
              configurationValue: '10',
              configuratorType: ConfiguratorType.CPQ,
              status: 'SUCCESS',
            },
          ],
          product: {
            configurable: true,
          },
        });
        mockCartItemContext.readonly$.next(false);
        mockCartItemContext.quantityControl$.next(new FormControl());
        component.hideItems = false;
        fixture.detectChanges();
      });

      it('should display in desktop mode', () => {
        spyOn(breakpointService, 'isUp').and.returnValue(of(true));
        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          '.cx-item-infos.open'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-info',
          1
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-price span.cx-item',
          0
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          '10'
        );
      });

      it('should display in mobile mode', () => {
        spyOn(breakpointService, 'isUp').and.returnValue(of(false));
        CommonConfiguratorTestUtilsService.expectElementPresent(
          expect,
          htmlElem,
          '.cx-item-infos.open'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-info',
          1
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-price span.cx-identifier',
          0
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-price span.cx-item',
          0
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-identifier',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-identifier',
          'configurator.attribute.quantity'
        );

        CommonConfiguratorTestUtilsService.expectNumberOfElements(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          1
        );

        CommonConfiguratorTestUtilsService.expectElementToContainText(
          expect,
          htmlElem,
          '.cx-item-quantity span.cx-item',
          '10'
        );
      });
    });
  });
});
