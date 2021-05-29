import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UsersService } from '@core/api/users.api';
import { AuthService } from '@core/auth/auth.service';
import { Project, Task, User } from '@core/entities/database-entities';
import { TaskStatus } from '@core/entities/value-entities';
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
  @Input() project!: Project;
  @Input() isSpecial!: boolean;

  @Output() update = new EventEmitter<Task>();
  @Output() delete = new EventEmitter();

  form = this._fb.group({
    title: ["", [Validators.required, Validators.maxLength(20)]],
    description: ["", [Validators.required]],
    status: [null, [Validators.required]],
    userId: [null]
  });

  get autocomplete() {
    return this.form.get("userId") as FormControl;
  }

  taskStatusOptions = Object.values(TaskStatus);
  editing = false;

  user$ = this._authService.user$;

  userOptions$ = this._projectFeatureService.usersProject$;

  isTaskAssignedOrSpecial$ = this.user$.pipe(
    map((user) => user?.id == this.task.userId),
    map((isTaskAssigned) => isTaskAssigned || this.isSpecial)
  );
  
  autocomplete$ = fromForm(this.autocomplete);
  
  usersFiltered$ = combineLatest([this.autocomplete$, this.userOptions$]).pipe(
    map(([autocomplete, userOptions]) => this.filter(userOptions, autocomplete))
  );

  displayFn(users: User[], userInput: any) {
    const user = users.find(user => user.id == userInput);
    return user ? `${user.name} #${user.id}` : userInput;
  }

  filter(users: User[], userInput: any) {
    if (!userInput) return users;

    userInput = typeof userInput === "number" ? userInput.toString() : userInput;

    return users.filter(user =>
      insensitiveContains(user.name, userInput) ||
      user.id?.toString().includes(userInput)
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
