import { Type } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  Cart,
  OCC_USER_ID_ANONYMOUS,
  OrderEntry,
  UserIdService,
} from '@spartacus/core';
import { Observable, of } from 'rxjs';
import {
  CommonConfigurator,
  ConfiguratorType,
  OrderEntryStatus,
} from '../../core/model/common-configurator.model';
import { CommonConfiguratorUtilsService } from './common-configurator-utils.service';

const productCode = 'CONF_LAPTOP';
const documentId = '12344';
const entryNumber = 4;
let owner: CommonConfigurator.Owner = null;

const CART_CODE = '0000009336';
const CART_GUID = 'e767605d-7336-48fd-b156-ad50d004ca10';
const NAMED_USER = 'NAMED_USER';

const cartAnonymous: Cart = {
  code: CART_CODE,
  guid: CART_GUID,
  user: { uid: OCC_USER_ID_ANONYMOUS },
};

let cartItem: OrderEntry;

class MockUserIdService {
  getUserId(): Observable<string> {
    return of(NAMED_USER);
  }
}

describe('CommonConfiguratorUtilsService', () => {
  let classUnderTest: CommonConfiguratorUtilsService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: UserIdService,
            useClass: MockUserIdService,
          },
        ],
      }).compileComponents();
    })
  );
  beforeEach(() => {
    classUnderTest = TestBed.inject(
      CommonConfiguratorUtilsService as Type<CommonConfiguratorUtilsService>
    );
    owner = {};
    cartItem = {};
  });

  it('should create component', () => {
    expect(classUnderTest).toBeDefined();
  });

  it('should set key for product related owner', () => {
    owner.type = CommonConfigurator.OwnerType.PRODUCT;
    owner.id = productCode;
    classUnderTest.setOwnerKey(owner);
    expect(owner.key.includes(productCode)).toBe(true);
    expect(owner.key.includes(CommonConfigurator.OwnerType.PRODUCT)).toBe(true);
  });

  it('should set key for document related owner', () => {
    owner.type = CommonConfigurator.OwnerType.CART_ENTRY;
    owner.id = '1';
    classUnderTest.setOwnerKey(owner);
    expect(owner.key.includes(owner.id)).toBe(true);
    expect(owner.key.includes(CommonConfigurator.OwnerType.CART_ENTRY)).toBe(
      true
    );
  });

  it('should throw an error if no owner type is present', () => {
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should throw an error if for owner type PRODUCT if no product code is present', () => {
    owner.type = CommonConfigurator.OwnerType.PRODUCT;
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should throw an error if for owner type CART_ENTRY no cart entry link is present', () => {
    owner.type = CommonConfigurator.OwnerType.CART_ENTRY;
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should throw an error if for owner type ORDER_ENTRY no order entry link is present', () => {
    owner.type = CommonConfigurator.OwnerType.ORDER_ENTRY;
    expect(function () {
      classUnderTest.setOwnerKey(owner);
    }).toThrow();
  });

  it('should compose an owner ID from 2 attributes', () => {
    expect(classUnderTest.getComposedOwnerId(documentId, entryNumber)).toBe(
      documentId + '+' + entryNumber
    );
  });

  it('should decompose an owner ID properly', () => {
    const decompose = classUnderTest.decomposeOwnerId(
      classUnderTest.getComposedOwnerId(documentId, entryNumber)
    );
    expect(decompose.documentId).toBe(documentId);
    expect(decompose.entryNumber).toBe('' + entryNumber);
  });

  it('should throw an error in case ownerId is malformed', () => {
    expect(function () {
      classUnderTest.decomposeOwnerId(documentId);
    }).toThrow();
  });

  describe('getCartId', () => {
    it('should return cart guid if user is anonymous', () => {
      expect(classUnderTest.getCartId(cartAnonymous)).toBe(CART_GUID);
    });

    it('should return cart code if user is not anonymous', () => {
      const namedCart: Cart = {
        code: CART_CODE,
        guid: CART_GUID,
        user: { name: 'Ulf Becker', uid: 'ulf.becker@rustic-hw.com' },
      };
      expect(classUnderTest.getCartId(namedCart)).toBe(CART_CODE);
    });

    it('throw error if cart Id cannot be found', () => {
      const incompleteCart: Cart = {};
      expect(() => classUnderTest.getCartId(incompleteCart)).toThrowError();
    });
  });

  describe('Cart item issue handling', () => {
    it('should return number of issues of ERROR status', () => {
      cartItem.statusSummaryList = [
        { numberOfIssues: 2, status: OrderEntryStatus.Error },
      ];
      expect(classUnderTest.getNumberOfIssues(cartItem)).toBe(2);
    });

    it('should return number of issues of ERROR status if ERROR and SUCCESS statuses are present', () => {
      cartItem.statusSummaryList = [
        { numberOfIssues: 1, status: OrderEntryStatus.Success },
        { numberOfIssues: 3, status: OrderEntryStatus.Error },
      ];
      expect(classUnderTest.getNumberOfIssues(cartItem)).toBe(3);
    });

    it('should return number of issues as 0 if only SUCCESS status is present', () => {
      cartItem.statusSummaryList = [
        { numberOfIssues: 2, status: OrderEntryStatus.Success },
      ];
      expect(classUnderTest.getNumberOfIssues(cartItem)).toBe(0);
    });

    it('should return number of issues as 0 if statusSummaryList is undefined', () => {
      cartItem.statusSummaryList = undefined;
      expect(classUnderTest.getNumberOfIssues(cartItem)).toBe(0);
    });

    it('should return number of issues as 0 if statusSummaryList is empty', () => {
      cartItem.statusSummaryList = [];
      expect(classUnderTest.getNumberOfIssues(cartItem)).toBe(0);
    });

    it('should return true if number of issues of ERROR status is > 0', () => {
      cartItem.statusSummaryList = [
        { numberOfIssues: 2, status: OrderEntryStatus.Error },
      ];
      expect(classUnderTest.hasIssues(cartItem)).toBeTrue();
    });

    it('should return false if number of issues of ERROR status is = 0', () => {
      cartItem.statusSummaryList = [
        { numberOfIssues: 2, status: OrderEntryStatus.Success },
      ];
      expect(classUnderTest.hasIssues(cartItem)).toBeFalse();
    });
  });

  describe('isAttributeBasedConfigurator', () => {
    it('should return false, because the configurator type is undefined', () => {
      expect(classUnderTest.isAttributeBasedConfigurator(undefined)).toBe(
        false
      );
    });

    it('should return false, because the configurator type is not an attribute based one', () => {
      expect(
        classUnderTest.isAttributeBasedConfigurator('ANYCONFIGURATOR')
      ).toBe(false);
    });

    it('should return true for the variant configurator type', () => {
      expect(
        classUnderTest.isAttributeBasedConfigurator(ConfiguratorType.VARIANT)
      ).toBe(true);
    });

    it('should return true for the textfield configurator type', () => {
      expect(
        classUnderTest.isAttributeBasedConfigurator(ConfiguratorType.TEXTFIELD)
      ).toBe(true);
    });
  });

  describe('isBundleBasedConfigurator', () => {
    it('should return false, because the configurator type is undefined', () => {
      expect(classUnderTest.isBundleBasedConfigurator(undefined)).toBe(false);
    });

    it('should return false, because the configurator type is not an attribute based one', () => {
      expect(classUnderTest.isBundleBasedConfigurator('ANYCONFIGURATOR')).toBe(
        false
      );
    });

    it('should return true for the CPQ configurator type', () => {
      expect(
        classUnderTest.isBundleBasedConfigurator(ConfiguratorType.CPQ)
      ).toBe(true);
    });
  });
});
