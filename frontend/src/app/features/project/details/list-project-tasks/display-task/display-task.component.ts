import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UsersService } from '@core/api/users.api';
import { AuthService } from '@core/auth/auth.service';
import { Project, Task, User } from '@core/entities/database-entities';
import { TaskStatus, TaskType } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { fromForm, insensitiveContains } from '@shared/utils/utils';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, pairwise, shareReplay, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-display-task',
  templateUrl: './display-task.component.html',
  styleUrls: ['./display-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayTaskComponent implements AfterViewInit {

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _cd: ChangeDetectorRef,
    private _projectFeatureService: ProjectFeatureService,
  ) { }

  ngAfterViewInit() {
    this.form.patchValue(this.task);
    this._cd.detectChanges();
  }

  @Input() task!: Task;
  @Input() isSpecial!: boolean;
  @Input() isTaskAssigned!: boolean;

  @Output() update = new EventEmitter<Task>();
  @Output() delete = new EventEmitter();

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

  project$ = this._projectFeatureService.currentProject$;

  get autocompleteUser() {
    return this.form.get("userId") as FormControl;
  }

  get autocompleteEpic() {
    return this.form.get("epicId") as FormControl;
  }

  taskStatusOptions = Object.values(TaskStatus);
  taskTypeOptions = Object.values(TaskType);
  editing = false;

  user$ = this._authService.user$;

  userOptions$ = this._projectFeatureService.usersProject$;

  form$ = fromForm(this.form);

  epicOptions$ = this.project$.pipe(
    map((project) => {
        if (!project) return [];

        let tasks = project.tasks.filter(t => t.type === TaskType.Epic && t.id !== this.task.id);
        return tasks;
    })
  );
  
  autocompleteUser$ = fromForm(this.autocompleteUser);

  autocompleteEpic$ = fromForm(this.autocompleteEpic);
  
  usersFiltered$ = combineLatest([this.autocompleteUser$, this.userOptions$]).pipe(
    map(([autocompleteUser, userOptions]) => this.filterUsers(userOptions, autocompleteUser))
  );

  epicsFiltered$ = combineLatest([this.autocompleteEpic$, this.epicOptions$]).pipe(
    map(([autocompleteEpic, epicOptions]) => this.filterEpics(epicOptions, autocompleteEpic))
  );

  displayFnUsers(users: User[], userInput: any) {
    const user = users.find(user => user.id == userInput);
    return user ? `${user.name} #${user.id}` : userInput;
  }

  displayFnEpics(epics: Task[], epicInput: any) {
    const epic = epics.find(epic => epic.id == epicInput);
    return epic ? `${epic.title}` : epicInput;
  }

  filterUsers(users: User[], userInput: string | number) {
    if (!userInput) return users;
    
    let search = userInput.toString();

    return users.filter(user =>
      insensitiveContains(user.name, search) ||
      user.id.toString().includes(search)
    );
  }

  filterEpics(epics: Task[], epicInput: string | number) {
    if (!epicInput) return epics;
    
    let search = epicInput.toString();

    return epics.filter(epic =>
      insensitiveContains(epic.title, search) ||
      epic.id.toString().includes(search)
    );
  }

  handleEdit(value: boolean) {
    this.editing = value;

    this.form.patchValue(this.task);
    this._cd.detectChanges();
  }

  onUpdate() {
    if (this.form.invalid) return;

    this.update.emit(this.form.value);
  }

  onDelete() {
    this.delete.emit();
  }
}
