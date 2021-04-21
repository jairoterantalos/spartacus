import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StatePersistenceService } from '../../state/services/state-persistence.service';
import { SiteContextConfig } from '../config/site-context-config';
import { LANGUAGE_CONTEXT_ID } from '../providers';
import { LanguageStatePersistenceService } from './language-state-persistence.service';
import { LanguageService } from './language.service';
import createSpy = jasmine.createSpy;

class MockLanguageService implements Partial<LanguageService> {
  getActive() {
    return of('');
  }
  setActive = createSpy('setActive');
}

const mockLanguages = ['ja', 'de'];

const mockSiteContextConfig: SiteContextConfig = {
  context: {
    [LANGUAGE_CONTEXT_ID]: mockLanguages,
  },
};

describe('LanguageStatePersistenceService', () => {
  let service: LanguageStatePersistenceService;
  let persistenceService: StatePersistenceService;
  let languageService: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LanguageService,
          useClass: MockLanguageService,
        },
        { provide: SiteContextConfig, useValue: mockSiteContextConfig },
        StatePersistenceService,
      ],
    });

    service = TestBed.inject(LanguageStatePersistenceService);
    persistenceService = TestBed.inject(StatePersistenceService);
    languageService = TestBed.inject(LanguageService);
  });

  it('should inject service', () => {
    expect(service).toBeTruthy();
  });

  describe('initSync', () => {
    it('should call StatePersistenceService with the correct attributes', () => {
      const state$ = of('en');
      spyOn(languageService, 'getActive').and.returnValue(state$);
      spyOn(persistenceService, 'syncWithStorage');

      service.initSync();

      expect(persistenceService.syncWithStorage).toHaveBeenCalledWith(
        jasmine.objectContaining({
          key: LANGUAGE_CONTEXT_ID,
          state$,
        })
      );
      expect(languageService.getActive).toHaveBeenCalled();
    });
  });

  describe('onRead', () => {
    it('should update state after read', () => {
      const lang = 'de';

      service['onRead'](lang);

      expect(languageService.setActive).toHaveBeenCalledWith(lang);
    });
    it('should use default language if state is empty', () => {
      service['onRead']('');

      expect(languageService.setActive).toHaveBeenCalledWith(mockLanguages[0]);
    });
    it('should use default language if it is not in the configurations', () => {
      const lang = 'en';

      service['onRead'](lang);

      expect(languageService.setActive).toHaveBeenCalledWith(mockLanguages[0]);
    });
  });
});
