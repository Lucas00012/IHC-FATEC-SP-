import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task } from '@core/entities/database-entities';
import { SprintsService } from '@core/api/sprint.api';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { catchError, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { fromForm, insensitiveContains } from '@shared/utils/utils';
import { combineLatest } from 'rxjs';

function notHasTasks(control: AbstractControl) : ValidationErrors | null {
  let tasks = control.value;

  return tasks.length ? null : { notHasTasks: true };
}

@Component({
  selector: 'app-add-sprint',
  templateUrl: './add-sprint.component.html',
  styleUrls: ['./add-sprint.component.scss']
})
export class AddSprintComponent {

  constructor(
    private _sprintService: SprintsService,
    private _projectFeatureService: ProjectFeatureService,
    private _printService: PrintSnackbarService,
    private _router: Router,
    private _fb: FormBuilder
  ) { }

  form: FormGroup;

  projectId$ = this._projectFeatureService.currentProjectId$;
  project$ = this._projectFeatureService.currentProject$;

  form$ = this.projectId$.pipe(
    map((projectId) => this._fb.group({
      projectId: [projectId],
      objective: ["", [Validators.required]],
      startDate: [Date.now()],
      endDate: [null],
      tasks: this._fb.array([], [notHasTasks]) 
    })), 
    tap((form) => this.form = form)
  );

  autocompleteTask = this._fb.control("");
  autocompleteTask$ = fromForm(this.autocompleteTask);

  get tasks() {
    return this.form.get("tasks") as FormArray;
  }

  tasksOption$ = this.project$.pipe(
    map((project) => project.tasks)
  );

  tasksFiltered$ = combineLatest([
    this.tasksOption$,
    this.autocompleteTask$
  ]).pipe(
    map(([tasks, autocomplete]) => this.filterTask(tasks, autocomplete))
  );

  removeTask(index: number) {
    this.tasks.removeAt(index);
  }

  taskOnChange(event) {
    const task = event.option.value as Task;

    this.tasks.push(this._fb.group({
      id: [task.id],
      title: [task.title],
      type: [task.type],
      status: [task.status]
    }));

    this.autocompleteTask.setValue("");
  }

  filterTask(tasks: Task[], taskInput: string | Task) {
    if (!taskInput) return tasks;
    let search = taskInput.toString();

    return tasks.filter(task =>
      insensitiveContains(task.title, search) ||
      task.id.includes(search)
    );
  }

  createSprint() {
    if (this.form.invalid) return;

    let body = this.form.value;

    body.tasksId = body.tasks.map(t => t.id);
    delete body.tasks;

    this._sprintService.add(body).pipe(
      tap(_ => this._printService.printSuccess("Sprint criada com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      tap((sprint) => this._router.navigate(["/project", sprint.projectId, "details"])),
      catchError((err) => this._printService.printError("Erro ao criar a sprint:" + err, err))
    ).subscribe();
  }
}
