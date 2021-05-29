import { Component, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "@core/api/projects.api";
import { UsersService } from "@core/api/users.api";
import { AuthService } from "@core/auth/auth.service";
import { Project, Task } from "@core/entities/database-entities";
import { ProjectFeatureService } from "@features/project/tools/project-feature.service";
import { PrintSnackbarService } from "@shared/print-snackbar/print-snackbar.service";
import { combineLatest } from "rxjs";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";
import { TaskAddDialogComponent } from "./task-add-dialog/task-add-dialog.component";

@Component({
    selector: "app-list-project-tasks",
    templateUrl: "./list-project-tasks.component.html",
    styleUrls: ["./list-project-tasks.component.scss"]
})
export class ListProjectTasksComponent {

    constructor(
        private _dialog: MatDialog,
        private _projectsService: ProjectsService,
        private _printService: PrintSnackbarService,
        private _projectFeatureService: ProjectFeatureService
    ) { }

    @Input() project!: Project;

    isProductOwner$ = this._projectFeatureService.isProductOwner$;
    isScrumMaster$ = this._projectFeatureService.isScrumMaster$;

    isSpecial$ = combineLatest([
        this.isProductOwner$, 
        this.isScrumMaster$
    ]).pipe(
        map(([isProductOwner, isScrumMaster]) => isProductOwner || isScrumMaster)
    );

    addTask() {
        this._dialog.open(TaskAddDialogComponent, {
            width: "400px",
            height: "450px"
        }).afterClosed().pipe(
            filter(body => !!body),
            switchMap(body => this._projectsService.addTask(this.project.id, body)),
            tap(_ => this._printService.printSuccess("Tarefa cadastrada com sucesso!")),
            tap(_ => this._projectFeatureService.notifyProjectChanges()),
            catchError(err => this._printService.printError("Erro ao cadastrar a tarefa", err))
        ).subscribe();
    }

    updateTask(body: any, index: number) {
        this._projectsService.updateTask(this.project.id, body, index).pipe(
            tap(_ => this._printService.printSuccess("Tarefa atualizada com sucesso!")),
            tap(_ => this._projectFeatureService.notifyProjectChanges()),
            catchError(err => this._printService.printError("Erro ao atualizar a tarefa", err))
        ).subscribe();
    }

    deleteTask(index: number) {
        this._projectsService.removeTask(this.project.id, index).pipe(
            tap(_ => this._printService.printSuccess("Tarefa excluida com sucesso!")),
            tap(_ => this._projectFeatureService.notifyProjectChanges()),
            catchError(err => this._printService.printError("Erro ao excluir a tarefa", err))
        ).subscribe();
    }
}