import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProjectsService } from '@core/api/projects.api';
import { AuthService } from '@core/auth/auth.service';
import { User } from '@core/entities/database-entities';
import { Responsability } from '@core/entities/value-entities';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { PrintSnackbarService } from '@shared/print-snackbar/print-snackbar.service';
import { fromForm } from '@shared/utils/utils';
import { combineLatest, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { AddAllocationDialogComponent } from './add-allocation-dialog/add-allocation-dialog.component';
import { EditAllocationDialogComponent } from './edit-allocation-dialog/edit-allocation-dialog.component';

@Component({
  selector: 'app-list-project-allocations',
  templateUrl: './list-project-allocations.component.html',
  styleUrls: ['./list-project-allocations.component.scss']
})
export class ListProjectAllocationsComponent implements OnInit, OnDestroy {

  constructor(
    private _projectFeatureService: ProjectFeatureService,
    private _authService: AuthService,
    private _projectsService: ProjectsService,
    private _printService: PrintSnackbarService,
    private _fb: FormBuilder,
    private _dialog: MatDialog,
  ) { }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnInit() {
    this.applyFilter();
    this.handleTableCols();
  }

  @Input() projectId!: number | null;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.dataSource.sort = this.sort;
  }

  search = this._fb.control("");

  displayedColumns = ["id", "name", "email", "responsability"];

  sort: MatSort;

  dataSource = new MatTableDataSource();

  private _destroy$ = new Subject();

  user$ = this._authService.user$;
  usersProjectExceptCurrent$ = this._projectFeatureService.usersProjectExceptCurrent$;
  allocation$ = this._projectFeatureService.currentAllocation$;
  project$ = this._projectFeatureService.currentProject$;

  search$ = fromForm(this.search);

  dataSource$ = combineLatest([this.project$, this.usersProjectExceptCurrent$]).pipe(
    map(([project, users]) => {
      if(!project) return [];
      return users.map(user => ({
        ...user,
        responsability: project.allocations.find(a => a.userId == user.id)?.responsability 
      }))
    }),
    tap((data) => this.dataSource.data = data),
    map(_ => this.dataSource)
  );


  removeAllocation(userId: number) {
    this._projectsService.removeAllocation(this.projectId, userId).pipe(
      tap(_ => this._printService.printSuccess("Alocação excluída com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      catchError((err) => this._printService.printError("Não foi possível excluir a alocação", err))
    ).subscribe();
  }

  addAllocation() {
    this._dialog.open(AddAllocationDialogComponent, {
      width: "550px",
      height: "320px"
    }).afterClosed().pipe(
      filter((body) => !!body),
      switchMap((body) => this._projectsService.addAllocation(this.projectId, body)),
      tap(_ => this._printService.printSuccess("Usuário alocado com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }

  editAllocation(userRow) {
    this._dialog.open(EditAllocationDialogComponent, {
      width: "400px",
      height: "350px",
      data: userRow
    }).afterClosed().pipe(
      filter((body) => !!body),
      switchMap((body) => this._projectsService.editAllocation(this.projectId, body)),
      tap(_ => this._printService.printSuccess("Alocação editada com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      catchError((err) => this._printService.printError(err, err))
    ).subscribe();
  }

  applyFilter() {
    this.search$.pipe(takeUntil(this._destroy$))
      .subscribe(search => this.dataSource.filter = search);
  }

  handleTableCols() {
    this.allocation$.pipe(
      take(1),
      takeUntil(this._destroy$)
    ).subscribe(allocation => {
      if (allocation.responsability == Responsability.ScrumMaster) 
        this.displayedColumns.push("actions");
    });
  }
}
