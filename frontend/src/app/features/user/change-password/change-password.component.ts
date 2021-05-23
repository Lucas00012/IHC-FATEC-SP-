import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '@core/api/users.api';
import { AuthService } from '@core/auth/auth.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { catchError, finalize, switchMap, take, tap } from 'rxjs/operators';

@Component({
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  constructor(
    private _authService: AuthService,
    private _fb: FormBuilder,
    private _usersService: UsersService,
    private _printService: PrintSnackbarService
  ) { }

  form = this._fb.group({
    oldPassword: ["", [Validators.required]],
    newPassword: ["", [Validators.required]],
    confirmNewPassword: ["", [Validators.required]]
  });

  changePassword() {
    if (this.form.invalid) return;

    const { oldPassword, newPassword } = this.form.value;

    this._authService.user$.pipe(
      take(1),
      switchMap((user) => this._usersService.changePassword(oldPassword, newPassword, user?.id)),
      tap((user) => this._authService.load(user)),
      tap(_ => this._printService.printSuccess("Senha alterada com sucesso!")),
      finalize(() => this.form.reset()),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }
}
