import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@core/api/users.api';
import { AuthService } from '@core/auth/auth.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { catchError, tap } from 'rxjs/operators';

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(
    private _fb: FormBuilder,
    private _usersService: UsersService,
    private _printService: PrintSnackbarService,
    private _authService: AuthService
  ) { }

  form = this._fb.group({
    name: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
    confirmPassword: ["", [Validators.required]]
  });

  register() {
    if (this.form.invalid) return;

    const body = this.form.value;
    delete body.confirmPassword;

    this._usersService.add(body).pipe(
      tap((user) => this._authService.login(user)),
      tap(_ => this._printService.printSuccess("Conta cadastrada com sucesso!")),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }
}
