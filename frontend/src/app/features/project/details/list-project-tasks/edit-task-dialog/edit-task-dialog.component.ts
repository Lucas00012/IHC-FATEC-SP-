import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectsService } from '@core/api/projects.api';
import { Task } from '@core/entities/database-entities';
import { TaskStatus, TaskType } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { fromForm, insensitiveContains } from '@shared/utils/utils';
import { combineLatest } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTaskDialogComponent implements OnInit {

  constructor(
    private _dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private _fb: FormBuilder,
    private _projectFeatureService: ProjectFeatureService,
    private _projectsService: ProjectsService,
    private _printService: PrintSnackbarService,
    @Inject(MAT_DIALOG_DATA) private _data: { task: Task, isSpecial: boolean, isTaskAssigned: boolean, deleteEnabled: boolean }
  ) { }

  ngOnInit() {
    this.form.patchValue(this.task);
  }

  task = this._data.task;
  isSpecial = this._data.isSpecial;
  isTaskAssigned = this._data.isTaskAssigned;
  deleteEnabled = this._data.deleteEnabled;

  taskStatusOptions = Object.values(TaskStatus);
  taskTypeOptions = Object.values(TaskType);

  form = this._fb.group({
    title: ["", [Validators.required, Validators.maxLength(20)]],
    type: [null, [Validators.required]],
    description: ["", [Validators.required]],
    status: [null, [Validators.required]],
    userId: [null],
    epicId: [null],
    storyPoints: [null],
    minutesEstimated: [null]
  });

  get autocompleteEpic() {
    return this.form.get("epicId") as FormControl;
  }

  project$ = this._projectFeatureService.currentProject$;
  projectId$ = this._projectFeatureService.currentProjectId$;
  userOptions$ = this._projectFeatureService.usersProject$;

  autocompleteEpic$ = fromForm(this.autocompleteEpic);

  epicOptions$ = this.project$.pipe(
    map((project) => {
      if (!project) return [];

      let tasks = project.tasks.filter(t => t.type === TaskType.Epic && t.id !== this.task.id);
      return tasks;
    })
  );

  epicsFiltered$ = combineLatest([this.autocompleteEpic$, this.epicOptions$]).pipe(
    map(([autocompleteEpic, epicOptions]) => this.filterEpics(epicOptions, autocompleteEpic))
  );

  displayFnEpics(epics: Task[], epicInput: any) {
    const epic = epics.find(epic => epic.id == epicInput);
    return epic ? `${epic.title}` : epicInput;
  }

  filterEpics(epics: Task[], epicInput: string | number) {
    if (!epicInput) return epics;
    let search = epicInput.toString();

    return epics.filter(epic =>
      insensitiveContains(epic.title, search) ||
      epic.id.toString().includes(search)
    );
  }

  update(projectId: number) {
    if (this.form.invalid) return;

    const body = this.form.value;
    this._projectsService.updateTask(projectId, body, this.task.id).pipe(
      tap(_ => this._printService.printSuccess("Tarefa atualizada com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      tap(_ => this._dialogRef.close()),
      catchError(err => this._printService.printError("Erro ao atualizar a tarefa", err))
    ).subscribe();
  }

  delete(projectId: number) {
    this._projectsService.removeTask(projectId, this.task.id).pipe(
      tap(_ => this._printService.printSuccess("Tarefa removida com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      tap(_ => this._dialogRef.close()),
      catchError(err => this._printService.printError("Erro ao remover a tarefa: " + err, err))
    ).subscribe();
  }
}
