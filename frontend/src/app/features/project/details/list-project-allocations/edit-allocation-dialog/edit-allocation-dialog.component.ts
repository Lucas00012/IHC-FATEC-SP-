import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Responsability } from '@core/entities/value-entities';

@Component({
  selector: 'app-edit-allocation-dialog',
  templateUrl: './edit-allocation-dialog.component.html',
  styleUrls: ['./edit-allocation-dialog.component.scss']
})
export class EditAllocationDialogComponent {

  constructor(
    private _dialogRef: MatDialogRef<EditAllocationDialogComponent>,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data 
  ) { }

  form = this._fb.group({
    userId: [this.data.id],
    responsability: [this.data.responsability, [Validators.required]]
  });

  responsabilityOptions = Object.values(Responsability)
    .filter((responsability) => responsability !== Responsability.ScrumMaster);

  onSave() {
    if (this.form.invalid) return;
    this._dialogRef.close(this.form.value);
  }
}
