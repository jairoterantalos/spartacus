import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { I18nTestingModule, Title, UserService } from '@spartacus/core';
import { OrgUnitService } from '@spartacus/my-account/organization/core';
import {
  DateTimePickerModule,
  FormErrorsComponent,
} from '@spartacus/storefront';
import { UrlTestingModule } from 'projects/core/src/routing/configurable-routes/url-translation/testing/url-testing.module';
import { Observable, of } from 'rxjs';
import { OrganizationFormTestingModule } from '../../shared/organization-form/organization-form.testing.module';
import { UserItemService } from '../services/user-item.service';
import { UserFormComponent } from './user-form.component';

const mockForm = new FormGroup({
  name: new FormControl(),

  orgUnit: new FormGroup({
    uid: new FormControl(),
  }),
  titleCode: new FormControl(),
  firstName: new FormControl(),
  lastName: new FormControl(),
  email: new FormControl(),
  isAssignedToApprovers: new FormControl(),
  roles: new FormArray([]),
});

class MockUserService {
  getTitles(): Observable<Title[]> {
    return of();
  }

  loadTitles(): void {}
}

class MockOrgUnitService {
  getActiveUnitList() {
    return of([]);
  }
  loadList() {}
}

class MockOrganizationItemService {
  getForm() {}
}

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let b2bUnitService: OrgUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        I18nTestingModule,
        UrlTestingModule,
        ReactiveFormsModule,
        NgSelectModule,
        DateTimePickerModule,
        OrganizationFormTestingModule,
      ],
      declarations: [UserFormComponent, FormErrorsComponent],
      providers: [
        { provide: OrgUnitService, useClass: MockOrgUnitService },
        { provide: UserItemService, useClass: MockOrganizationItemService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compileComponents();

    b2bUnitService = TestBed.inject(OrgUnitService);

    spyOn(b2bUnitService, 'getActiveUnitList').and.callThrough();
    spyOn(b2bUnitService, 'loadList').and.callThrough();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render form groups', () => {
    component.form = mockForm;
    fixture.detectChanges();
    const formGroups = fixture.debugElement.queryAll(By.css('.form-group'));
    expect(formGroups.length).toBeGreaterThan(0);
  });

  it('should not render any form groups if the form is falsy', () => {
    component.form = undefined;
    fixture.detectChanges();
    const formGroups = fixture.debugElement.queryAll(By.css('.form-group'));
    expect(formGroups.length).toBe(0);
  });

  it('should get active b2bUnits from service', () => {
    component.form = mockForm;
    expect(b2bUnitService.getActiveUnitList).toHaveBeenCalled();
  });

  it('should load list of b2bUnits on subscription', () => {
    component.form = mockForm;
    fixture.detectChanges();
    expect(b2bUnitService.loadList).toHaveBeenCalled();
  });
});

// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { By, Title } from '@angular/platform-browser';
// import { NgSelectModule } from '@ng-select/ng-select';
// import { B2BUnitNode, I18nTestingModule, UserService } from '@spartacus/core';
// import { OrgUnitService } from '@spartacus/my-account/organization/core';
// import { FormErrorsComponent } from '@spartacus/storefront';
// import { UrlTestingModule } from 'projects/core/src/routing/configurable-routes/url-translation/testing/url-testing.module';
// import { Observable, of } from 'rxjs';
// import { UserFormComponent } from './user-form.component';
// import createSpy = jasmine.createSpy;

// const mockOrgUnits: B2BUnitNode[] = [
//   {
//     active: true,
//     children: [],
//     id: 'unitNode1',
//     name: 'Org Unit 1',
//     parent: 'parentUnit',
//   },
//   {
//     active: true,
//     children: [],
//     id: 'unitNode2',
//     name: 'Org Unit 2',
//     parent: 'parentUnit',
//   },
// ];

// class MockUserService {
//   getTitles(): Observable<Title[]> {
//     return of();
//   }

//   loadTitles(): void {}
// }

// class MockOrgUnitService implements Partial<OrgUnitService> {
//   load = createSpy('load');
//   getActiveUnitList = createSpy('getActiveUnitList').and.returnValue(
//     of(mockOrgUnits)
//   );
//   loadList = jasmine.createSpy('loadList');
// }

// describe('UserFormComponent', () => {
//   let component: UserFormComponent;
//   let fixture: ComponentFixture<UserFormComponent>;
//   let orgUnitService: OrgUnitService;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         I18nTestingModule,
//         UrlTestingModule,
//         ReactiveFormsModule,
//         NgSelectModule,
//       ],
//       declarations: [UserFormComponent, FormErrorsComponent],
//       providers: [
//         { provide: OrgUnitService, useClass: MockOrgUnitService },
//         { provide: UserService, useClass: MockUserService },
//       ],
//     }).compileComponents();

//     orgUnitService = TestBed.inject(OrgUnitService);
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(UserFormComponent);
//     component = fixture.componentInstance;
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should render form groups', () => {
//     component.form = new FormGroup({ uid: new FormControl() });
//     fixture.detectChanges();
//     const formGroups = fixture.debugElement.queryAll(By.css('.form-group'));
//     expect(formGroups.length).toBeGreaterThan(0);
//   });

//   it('should not render any form groups if the form is falsy', () => {
//     component.form = undefined;
//     fixture.detectChanges();
//     const formGroups = fixture.debugElement.queryAll(By.css('.form-group'));
//     expect(formGroups.length).toBe(0);
//   });

//   it('should load units', () => {
//     component.form = new FormGroup({});
//     fixture.detectChanges();
//     expect(orgUnitService.getActiveUnitList).toHaveBeenCalled();
//   });
// });
