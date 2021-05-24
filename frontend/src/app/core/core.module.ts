import { HttpClientModule } from "@angular/common/http";
import { LOCALE_ID, NgModule, Optional, SkipSelf } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { ApiModule } from "./api/api.module";
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";

registerLocaleData(localePt);

@NgModule({
    imports: [
        SharedModule,
        HttpClientModule,
        ApiModule,
        MatDatepickerModule,
        MatNativeDateModule,
        RouterModule,
    ],
    providers: [
      MatDatepickerModule,
      { provide: MAT_DATE_LOCALE, useValue: 'pt' },
      { provide: LOCALE_ID, useValue: "pt" }
    ]
})
export class CoreModule {
    constructor(
        @Optional()
        @SkipSelf()
        parentModule: CoreModule | null = null
      ) {
        if (parentModule) {
          const msg = `CoreModule has already been loaded.
          Import CoreModule once, only, in the root AppModule.`;
          throw new Error(msg);
        }
      }
}