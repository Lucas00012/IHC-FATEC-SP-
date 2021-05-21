import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@core/api/users.api';
import { AuthService } from '@core/auth/auth.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { catchError, tap } from 'rxjs/operators';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(
    private _authService: AuthService,
    private _fb: FormBuilder,
    private _usersService: UsersService,
    private _printService: PrintSnackbarService
  ) { }

  form = this._fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]]
  });

  login() {
    const { email, password } = this.form.value;

    this._usersService.login(email, password).pipe(
      tap((user) => this._authService.login(user)),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }
}
