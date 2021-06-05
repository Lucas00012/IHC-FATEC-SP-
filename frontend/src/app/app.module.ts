import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShellComponent } from '@shared/shell/shell.component';
import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';
import { EditTaskDialogComponent } from './features/projec/details/list-project-tasks/edit-task-dialog/edit-task-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
    EditTaskDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
