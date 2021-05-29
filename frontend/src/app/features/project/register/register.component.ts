import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '@core/api/projects.api';
import { UsersService } from '@core/api/users.api';
import { AuthService } from '@core/auth/auth.service';
import { Allocation, User } from '@core/entities/database-entities';
import { Responsability } from '@core/entities/value-entities';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { fromForm, insensitiveCompare, insensitiveContains } from '@shared/utils/utils';
import { combineLatest } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { ProjectFeatureService } from '../tools/project-feature.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(
    private _fb: FormBuilder,
    private _projectsService: ProjectsService,
    private _projectFeatureService: ProjectFeatureService,
    private _authService: AuthService,
    private _router: Router,
    private _printService: PrintSnackbarService,
    private _usersService: UsersService,
  ) { }

  form = this._fb.group({
    name: ["", [Validators.required]],
    allocations: this._fb.array([]),
    tasks: [
      [
        
      ]
    ]
  });

  get allocations() {
    return this.form.get("allocations") as FormArray;
  }

  autocomplete = this._fb.control("");

  responsabilityOptions = Object.values(Responsability)
    .filter((responsability) => responsability !== Responsability.ScrumMaster);

  autocomplete$ = fromForm(this.autocomplete);

  user$ = this._authService.user$;

  users$ = this._usersService.getAllExceptCurrent().pipe(
    shareReplay(1)
  );

  usersFiltered$ = combineLatest([this.autocomplete$, this.users$]).pipe(
    map(([autocomplete, users]) => this.filter(users, autocomplete))
  );

  displayFn(user: User) {
    return user && user.name ? user.name : '';
  }

  userOnChange(event) {
    const user = event.option.value;
    this.addAllocation(user);
    this.autocomplete.setValue("");
  }

  addAllocation(user: User) {
    if (this.allocations.value.some((a) => a.user.id == user.id)) return;

    this.allocations.push(
      this._fb.group({
        user: [user, [Validators.required]],
        responsability: [Responsability.Employee, Validators.required]
      })
    );
  }

  removeAllocation(index: number) {
    this.allocations.removeAt(index);
  }

  filter(users: User[], userInput: any) {
    userInput = typeof userInput === "string" ? userInput : userInput.name;
    return users.filter(user =>
      insensitiveContains(user.name, userInput) ||
      user.id?.toString().includes(userInput)
    );
  }

  create() {
    if (this.form.invalid) return;

    let body = this.form.value;
    let allocations = body.allocations.map(a => ({ userId: a.user.id, responsability: a.responsability }));
    body = { ...body, allocations, creation: Date.now() };

    this.user$.pipe(
      take(1),
      switchMap((creator) => this._projectsService.add(body, creator?.id)),
      tap(_ => this._router.navigate(["/project", "list"])),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      tap(_ => this._printService.printSuccess("Projeto criado com sucesso!")),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }

}
