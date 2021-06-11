import { getLocaleDateFormat } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@core/auth/auth.service';
import { MeetingType } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-meeting-add-dialog',
  templateUrl: './meeting-add-dialog.component.html',
  styleUrls: ['./meeting-add-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingAddDialogComponent {

  constructor(
    private _dialogRef: MatDialogRef<MeetingAddDialogComponent>,
    private _fb: FormBuilder,
    private _projectFeatureService: ProjectFeatureService,
    private _authService: AuthService,
  ) { }

  project$ = this._projectFeatureService.currentProject$;
  user$ = this._authService.user$;
  userOptions$ = this._projectFeatureService.usersProject$;

  form = this._fb.group({
    type: [MeetingType.GeneralPurpose, [Validators.required]],
    title: ["", [Validators.required, Validators.maxLength(30)]],
    description: ["", [Validators.required]],
    //sprintId: [null],
    minutesEstimated: [null],
    creatorId: this._authService.user$.pipe(map(user => user.id)),
    participants: [],
    startTime: null,
    endTime: null,
    date: Date.now()
  });

  typeOptions = Object.values(MeetingType);
  //sprintOptions = [{id: 0, title:"Sprint 0"}];

  onSave() {
    if (this.form.invalid) return;
    this._dialogRef.close(this.form.value);
  }
}
