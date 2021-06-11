import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/auth/auth.service';
import { Project, Task, User } from '@core/entities/database-entities';
import { TaskType } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { map } from 'rxjs/operators';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';

@Component({
  selector: 'app-display-task',
  templateUrl: './display-task.component.html',
  styleUrls: ['./display-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayTaskComponent {

  public taskTypeEnum = TaskType;

  constructor(
    private _projectFeatureService: ProjectFeatureService,
    private _dialog: MatDialog
  ) { }

  @Input() task!: Task;
  @Input() isSpecial!: boolean;
  @Input() isTaskAssigned!: boolean;
  @Input() isBodySimpler!: boolean;
  @Input() deleteEnabled = true;

  usersProject$ = this._projectFeatureService.usersProject$;

  userTask$ = this.usersProject$.pipe(
    map((users) => users.find(u => u.id == this.task.userId)),
    map((user) => ({ value: user }) )
  );

  showDetails() {
    this._dialog.open(EditTaskDialogComponent, {
      width: '700px',
      height: '600px',
      data: {
        task: this.task,
        isSpecial: this.isSpecial,
        isTaskAssigned: this.isTaskAssigned,
        deleteEnabled: this.deleteEnabled
      }
    });
  }
}
