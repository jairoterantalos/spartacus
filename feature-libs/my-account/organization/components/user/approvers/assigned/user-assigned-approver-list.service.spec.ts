import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { B2BUser, EntitiesModel } from '@spartacus/core';
import {
  B2BUserService,
  UserGroup,
} from '@spartacus/my-account/organization/core';
import { Table, TableService, TableStructure } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { UserAssignedApproverListService } from './user-assigned-approver-list.service';

const mockUserApproverEntities: EntitiesModel<B2BUser> = {
  values: [
    {
      uid: 'first',
      selected: true,
    },
    {
      uid: 'second',
      selected: false,
    },
    {
      uid: 'third',
      selected: true,
    },
  ],
};
class MockB2BUserService implements Partial<B2BUserService> {
  getApprovers(): Observable<EntitiesModel<B2BUser>> {
    return of(mockUserApproverEntities);
  }
}

@Injectable()
export class MockTableService {
  buildStructure(type): Observable<TableStructure> {
    return of({ type });
  }
}

describe('UserAssignedApproverListService', () => {
  let service: UserAssignedApproverListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        UserAssignedApproverListService,
        {
          provide: B2BUserService,
          useClass: MockB2BUserService,
        },
        {
          provide: TableService,
          useClass: MockTableService,
        },
      ],
    });
    service = TestBed.inject(UserAssignedApproverListService);
  });

  it('should inject service', () => {
    expect(service).toBeTruthy();
  });

  it('should filter selected approvers', () => {
    let result: Table<UserGroup>;
    service.getTable().subscribe((table) => (result = table));
    expect(result.data.length).toEqual(2);
    expect(result.data[0].uid).toEqual('first');
    expect(result.data[1].uid).toEqual('third');
  });
});
