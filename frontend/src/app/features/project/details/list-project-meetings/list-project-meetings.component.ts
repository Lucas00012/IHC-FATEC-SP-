import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsService } from '@core/api/projects.api';
import { AuthService } from '@core/auth/auth.service';
import { MeetingStatus, MeetingType } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { fromForm, insensitiveCompare, insensitiveContains } from '@shared/utils/utils';
import { combineLatest } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { MeetingAddDialogComponent } from './meeting-add-dialog/meeting-add-dialog.component';

@Component({
  selector: 'app-list-project-meetings',
  templateUrl: './list-project-meetings.component.html',
  styleUrls: ['./list-project-meetings.component.scss']
})
export class ListProjectMeetingsComponent {

  constructor(
    private _dialog: MatDialog,
    private _projectsService: ProjectsService,
    private _printService: PrintSnackbarService,
    private _authService: AuthService,
    private _projectFeatureService: ProjectFeatureService,
    private _fb: FormBuilder
  ) { }

  @Input() projectId!: number | null;

  form = this._fb.group({
    type: ["Todas"],
    status: ["Todas"],
    title: [""],
    //sprintId: ["Todas"],
    myMeetings: [false]
  });

  allocation$ = this._projectFeatureService.currentAllocation$;
  project$ = this._projectFeatureService.currentProject$;
  user$ = this._authService.user$;

  form$ = fromForm(this.form);

  typeOptions=["Todas", ...Object.values(MeetingType)];
  //sprintOptions=[{id: 0, title: "Todas"}];
  statusOptions=["Todas", ...Object.values(MeetingStatus)];

  meetings$ = combineLatest([this.form$, this.project$, this.allocation$]).pipe(
    map(([form, project, allocation]) => {
      if(!project) return [];

      let meetings = project.meetings;

      if(!meetings)
        return [];

      if(form.status != "Todas")
        meetings = meetings.filter(m => m.status == form.status);

      if(form.type != "Todas")
        meetings = meetings.filter(m => m.type == form.type);

      if(form.myMeetings)
        meetings = meetings.filter(m => m.creatorId == allocation.userId);

      //if(form.sprint.id != 0)
      //  meetings = meetings.filter(m => m.sprintId == form.sprint.id);

      meetings = meetings.filter(m => insensitiveContains(m.title, form.title));

      return meetings;
    })
  );

  addMeeting(){
      this._dialog.open(MeetingAddDialogComponent, {
        width: "400px",
        height: "520px"
      }).afterClosed().pipe(
        filter(body => !!body),
        switchMap(body => this._projectsService.addMeeting(this.projectId, body)),
        tap(_ => this._printService.printSuccess("Reunião cadastrada com sucesso!")),
        tap(_ => this._projectFeatureService.notifyProjectChanges()),
        catchError(err => this._printService.printError("Erro ao cadastrar reunião", err))
      ).subscribe();
  }
}
