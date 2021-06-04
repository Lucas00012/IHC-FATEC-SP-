import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UsersService } from '@core/api/users.api';
import { User } from '@core/entities/database-entities';
import { Responsability } from '@core/entities/value-entities';
import { fromForm, insensitiveContains } from '@shared/utils/utils';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-add-allocation-dialog',
  templateUrl: './add-allocation-dialog.component.html',
  styleUrls: ['./add-allocation-dialog.component.scss']
})
export class AddAllocationDialogComponent {

  constructor(
    private _usersService: UsersService,
    private _dialogRef: MatDialogRef<AddAllocationDialogComponent>,
    private _fb: FormBuilder,
  ) { }

  form = this._fb.group({
    user: [null, [Validators.required]],
    responsability: [Responsability.Employee, [Validators.required]]
  });

  get user() {
    return this.form.get("user") as FormControl;
  }

  autocomplete = this._fb.control("");

  autocomplete$ = fromForm(this.autocomplete);

  userOptions$ = this._usersService.getAllExceptCurrent().pipe(
    shareReplay(1)
  );

  usersFiltered$ = combineLatest([this.autocomplete$, this.userOptions$]).pipe(
    map(([autocomplete, userOptions]) => this.filter(userOptions, autocomplete))
  );

  responsabilityOptions = Object.values(Responsability)
    .filter((responsability) => responsability !== Responsability.ScrumMaster);

  displayFn(user: User) {
    return user && user.name ? user.name : '';
  }

  userOnChange(event) {
    const user = event.option.value;
    this.user.patchValue(user);
    this.autocomplete.setValue("");
  }

  filter(users: User[], userInput: string | number) {
    if (!userInput) return users;
    
    let search = userInput.toString();

    return users.filter(user =>
      insensitiveContains(user.name, search) ||
      user.id?.toString().includes(search)
    );
  }

  onSave() {
    if (this.form.invalid) return;

    let body = this.form.value;
    body = { userId: body.user.id, responsability: body.responsability };

    this._dialogRef.close(body);
  }
}
