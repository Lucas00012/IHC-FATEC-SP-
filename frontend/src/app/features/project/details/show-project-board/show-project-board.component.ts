import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsService } from '@core/api/projects.api';
import { AuthService } from '@core/auth/auth.service';
import { TaskStatus } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-show-project-board',
  templateUrl: './show-project-board.component.html',
  styleUrls: ['./show-project-board.component.scss']
})
export class ShowProjectBoardComponent {

  constructor(
    private _dialog: MatDialog,
    private _projectsService: ProjectsService,
    private _printService: PrintSnackbarService,
    private _projectFeatureService: ProjectFeatureService,
    private _authService: AuthService,
    private _fb: FormBuilder
  ) { }

  @Input() projectId!: number | null;

  allocation$ = this._projectFeatureService.currentAllocation$;
  isProductOwner$ = this._projectFeatureService.isProductOwner$;
  isScrumMaster$ = this._projectFeatureService.isScrumMaster$;
  project$ = this._projectFeatureService.currentProject$;
  user$ = this._authService.user$;

  isSpecial$ = combineLatest([this.isProductOwner$, this.isScrumMaster$]).pipe(
    map(([isProductOwner, isScrumMaster]) => isProductOwner || isScrumMaster)
  );

  sprint$ = this._projectFeatureService.currentSprint$.pipe(
    map((sprint) => ({ value: sprint }))
  );

  tasks$ = combineLatest([this.project$, this.sprint$]).pipe(
    map(([project, sprint]) => {
        if (!project) return [];
        if (!sprint.value) return [];

        let tasks = sprint.value.tasks;
        return tasks;
    })
  );

  tasksToDo$ = combineLatest([this.tasks$]).pipe(
    map(([tasks]) => {
        if (!tasks) return [];
        return tasks.filter(t => t.status == TaskStatus.ToDo);
    })
  );

  tasksInProgess$ = combineLatest([this.tasks$]).pipe(
    map(([tasks]) => {
        if (!tasks) return [];
        return tasks.filter(t => t.status == TaskStatus.InProgress);
    })
  );

  tasksDone$ = combineLatest([this.tasks$]).pipe(
    map(([tasks]) => {
        if (!tasks) return [];
        return tasks.filter(t => t.status == TaskStatus.Done);
    })
  );

  info$ = combineLatest([this.user$, this.isSpecial$]);

}
