import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoggedGuard } from "@shared/guards/logged.guard";
import { DetailsComponent } from "./details/details.component";
import { ListComponent } from "./list/list.component";
import { ProjectComponent } from "./project.component";
import { RegisterComponent } from "./register/register.component";
import { ProjectGuard } from "./tools/project.guard";

const routes: Routes = [
    { path: "", pathMatch: "full", redirectTo: "list" },
    { 
        path: "", 
        component: ProjectComponent, 
        canActivate: [LoggedGuard],
        children: [
            { path: "list", component: ListComponent, canActivate: [ProjectGuard] },
            { path: "register", component: RegisterComponent, canActivate: [ProjectGuard] },
            { 
                path: ":projectId",
                canActivate: [ProjectGuard],
                children: [
                    { path: "", pathMatch: "full", redirectTo: "details" },
                    { path: "details", component: DetailsComponent }
                ] 
            }
        ] 
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule {

}