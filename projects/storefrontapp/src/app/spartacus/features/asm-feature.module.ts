import { NgModule } from '@angular/core';
import {
  asmTranslationChunksConfig,
  asmTranslations,
} from '@spartacus/asm/assets';
import { AsmRootModule } from '@spartacus/asm/root';
import { CmsConfig, I18nConfig, provideConfig } from '@spartacus/core';

@NgModule({
  imports: [AsmRootModule],
  providers: [
    provideConfig(<CmsConfig>{
      featureModules: {
        asm: {
          module: () => import('@spartacus/asm').then((m) => m.AsmModule),
        },
      },
    }),
    provideConfig(<I18nConfig>{
      i18n: {
        resources: asmTranslations,
        chunks: asmTranslationChunksConfig,
      },
    }),
  ],
})
export class AsmFeatureModule {}
