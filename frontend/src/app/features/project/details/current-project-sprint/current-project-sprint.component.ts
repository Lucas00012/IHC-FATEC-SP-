import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-current-project-sprint',
  templateUrl: './current-project-sprint.component.html',
  styleUrls: ['./current-project-sprint.component.scss']
})
export class CurrentProjectSprintComponent {

  constructor(
    private _projectFeatureService: ProjectFeatureService,
    private _authService: AuthService
  ) { }

  @Input() projectId!: number | null;

  isProductOwner$ = this._projectFeatureService.isProductOwner$;
  isScrumMaster$ = this._projectFeatureService.isScrumMaster$;
  user$ = this._authService.user$;

  isSpecial$ = combineLatest([
    this.isProductOwner$, 
    this.isScrumMaster$
  ]).pipe(
    map(([isProductOwner, isScrumMaster]) => isProductOwner || isScrumMaster)
  );

  taskInfo$ = combineLatest([this.user$, this.isSpecial$]);

  sprint$ = this._projectFeatureService.currentSprint$.pipe(
    map((sprint) => ({ value: sprint }))
  );
}
