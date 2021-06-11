import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectsService } from '@core/api/projects.api';
import { Meeting } from '@core/entities/database-entities';
import { MeetingType } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { combineLatest } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-meeting-dialog-component',
  templateUrl: './edit-meeting-dialog-component.component.html',
  styleUrls: ['./edit-meeting-dialog-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditMeetingDialogComponent implements OnInit {

  constructor(
    private _dialogRef: MatDialogRef<EditMeetingDialogComponent>,
    private _fb: FormBuilder,
    private _projectFeatureService: ProjectFeatureService,
    private _projectsService: ProjectsService,
    private _printService: PrintSnackbarService,
    @Inject(MAT_DIALOG_DATA) private _data: { meeting: Meeting, currentUserIsCreator: boolean }
  ) { }

  ngOnInit() {
    this.form.patchValue(this.meeting);
  }

  meeting = this._data.meeting;
  currentUserIsCreator = this._data.currentUserIsCreator;

  meetingTypeOptions = Object.values(MeetingType);

  project$ = this._projectFeatureService.currentProject$;
  projectId$ = this._projectFeatureService.currentProjectId$;
  userOptions$ = this._projectFeatureService.usersProject$;
  allocation$ = this._projectFeatureService.currentAllocation$;

  form = this._fb.group({
    type: [null, [Validators.required]],
    title: ["", [Validators.required, Validators.maxLength(30)]],
    description: ["", [Validators.required]],
    participants: [null],
    startTime: [null, [Validators.required]],
    endTime: [null, [Validators.required]],
    date: [null, [Validators.required]],
  });

  update(projectId: number) {
    if (this.form.invalid) return;

    const body = this.form.value;
    this._projectsService.updateMeeting(projectId, body, this.meeting.id).pipe(
      tap(_ => this._printService.printSuccess("Reunião atualizada com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      tap(_ => this._dialogRef.close()),
      catchError(err => this._printService.printError("Erro ao atualizar a reunião", err))
    ).subscribe();
  }

  delete(projectId: number) {
    this._projectsService.removeTask(projectId, this.meeting.id).pipe(
      tap(_ => this._printService.printSuccess("Reunião removida com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      tap(_ => this._dialogRef.close()),
      catchError(err => this._printService.printError("Erro ao remover a reunião", err))
    ).subscribe();
  }

}
