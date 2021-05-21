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
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(
    private _fb: FormBuilder,
    private _projectsService: ProjectsService,
    private _authService: AuthService,
    private _router: Router,
    private _printService: PrintSnackbarService,
    private _usersService: UsersService,
  ) { }

  form = this._fb.group({
    name: ["", [Validators.required]],
    allocations: this._fb.array([])
  });

  get allocations() {
    return this.form.get("allocations") as FormArray;
  }

  autocomplete = this._fb.control("");

  responsabilityOptions = Object.values(Responsability)
    .filter((responsability) => responsability !== Responsability.ScrumMaster);

  autocomplete$ = fromForm(this.autocomplete).pipe(
    map(autocomplete => typeof autocomplete === "string" ? autocomplete : autocomplete.name)
  );

  user$ = this._authService.user$;

  users$ = this.user$.pipe(
    switchMap(user => this._usersService.getAll().pipe(
      map(users => users.filter(u => u.id !== user?.id))
    )),
    shareReplay(1)
  );

  userOptions$ = combineLatest([this.autocomplete$, this.users$]).pipe(
    map(([autocomplete, users]) => users.filter(user => 
        insensitiveContains(user.name, autocomplete) || user.id?.toString().includes(autocomplete)
    ))
  );

  displayFn(user: User) {
    return user && user.name ? user.name : '';
  }

  userById(id: number) {
    return this.users$.pipe(map(users => users.find(user => user.id === id)));
  }

  userOnChange(event) {
    const user = event.option.value;
    this.addAllocation(user);
    this.autocomplete.setValue("");
  }

  addAllocation(user: User) {
    if (this.allocations.value.some((a) => a.userId === user.id)) return;

    this.allocations.push(
      this._fb.group({
        userId: [user.id, [Validators.required]],
        responsability: [Responsability.Employee, Validators.required]
      })
    );
  }

  removeAllocation(index: number) {
    this.allocations.removeAt(index);
  }

  create() {
    let body = this.form.value;
    body = { ...body, creation: Date.now() };

    this.user$.pipe(
      switchMap((creator) => this._projectsService.add(body, creator?.id)),
      tap(_ => this._router.navigate(["/project", "list"])),
      tap(_ => this._printService.printSuccess("Projeto criado com sucesso!")),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }

}
