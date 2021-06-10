import { NgModule } from "@angular/core";
import { SharedModule } from "@shared/shared.module";
import { DetailsComponent } from "./details/details.component";
import { ListComponent } from "./list/list.component";
import { ProjectRoutingModule } from "./project-routing.module";
import { ProjectComponent } from "./project.component";
import { RegisterComponent } from './register/register.component';
import { ProjectFeatureService } from "./tools/project-feature.service";
import { ProjectGuard } from "./tools/project.guard";
import { TaskAddDialogComponent } from './details/list-project-tasks/task-add-dialog/task-add-dialog.component';
import { ListProjectTasksComponent } from "./details/list-project-tasks/list-project-tasks.component";
import { DisplayTaskComponent } from './details/list-project-tasks/display-task/display-task.component';
import { ListProjectAllocationsComponent } from './details/list-project-allocations/list-project-allocations.component';
import { AddAllocationDialogComponent } from './details/list-project-allocations/add-allocation-dialog/add-allocation-dialog.component';
import { AutocompleteUsersComponent } from "./tools/autocomplete-users/autocomplete-users.component";
import { EditTaskDialogComponent } from './details/list-project-tasks/edit-task-dialog/edit-task-dialog.component';
import { EditAllocationDialogComponent } from './details/list-project-allocations/edit-allocation-dialog/edit-allocation-dialog.component';
import { ListProjectSprintsComponent } from './details/list-project-sprints/list-project-sprints.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AddSprintComponent } from './navigation/add-sprint/add-sprint.component';
import { CurrentProjectSprintComponent } from './details/current-project-sprint/current-project-sprint.component';

@NgModule({
    declarations: [
        ProjectComponent,
        ListComponent,
        RegisterComponent,
        DetailsComponent,
        ListProjectTasksComponent,
        TaskAddDialogComponent,
        DisplayTaskComponent,
        ListProjectAllocationsComponent,
        AddAllocationDialogComponent,
        AutocompleteUsersComponent,
        EditTaskDialogComponent,
        EditAllocationDialogComponent,
        ListProjectSprintsComponent,
        NavigationComponent,
        AddSprintComponent,
        CurrentProjectSprintComponent
    ],
    imports: [
        SharedModule,
        ProjectRoutingModule
    ],
    providers: [
        ProjectFeatureService,
        ProjectGuard
    ]
})
export class ProjectModule {

}