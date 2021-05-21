import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoggedGuard } from "@shared/guards/logged.guard";
import { ListComponent } from "./list/list.component";
import { ProjectComponent } from "./project.component";
import { RegisterComponent } from "./register/register.component";

const routes: Routes = [
    { path: "", pathMatch: "full", redirectTo: "list" },
    { 
        path: "", 
        component: ProjectComponent, 
        canActivate: [LoggedGuard],
        children: [
            { path: "list", component: ListComponent },
            { path: "register", component: RegisterComponent }
        ] 
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule {

}