import { NgModule } from "@angular/core";
import { SharedModule } from "@shared/shared.module";
import { ListComponent } from "./list/list.component";
import { ProjectRoutingModule } from "./project-routing.module";
import { ProjectComponent } from "./project.component";

@NgModule({
    declarations: [
        ProjectComponent,
        ListComponent
    ],
    imports: [
        SharedModule,
        ProjectRoutingModule
    ]
})
export class ProjectModule {

}