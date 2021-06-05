import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Meeting } from '@core/entities/database-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';

@Component({
  selector: 'app-display-meeting',
  templateUrl: './display-meeting.component.html',
  styleUrls: ['./display-meeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayMeetingComponent {

  constructor(
    private _projectFeatureService: ProjectFeatureService,
    private _dialog: MatDialog
  ) { }

  @Input() meeting!: Meeting;
}
