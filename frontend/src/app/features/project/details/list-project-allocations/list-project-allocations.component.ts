import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { catchError, map, take, takeUntil, tap } from 'rxjs/operators';

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
    private _fb: FormBuilder
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

  displayedColumns = ["id", "name", "email"];

  sort: MatSort;

  dataSource = new MatTableDataSource<User>();

  private _destroy$ = new Subject();

  user$ = this._authService.user$;
  usersProject$ = this._projectFeatureService.usersProject$;
  allocation$ = this._projectFeatureService.currentAllocation$;

  search$ = fromForm(this.search);

  dataSource$ = combineLatest([this.user$, this.usersProject$]).pipe(
    map(([user, usersProject]) => usersProject.filter(u => u.id != user.id)),
    tap((users) => this.dataSource.data = users),
    map(_ => this.dataSource)
  );

  removeAllocation(userId: number) {
    this._projectsService.removeAllocation(this.projectId, userId).pipe(
      tap(_ => this._printService.printSuccess("Alocação excluída com sucesso!")),
      tap(_ => this._projectFeatureService.notifyProjectChanges()),
      catchError((err) => this._printService.printError("Não foi possível excluir a alocação", err))
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
