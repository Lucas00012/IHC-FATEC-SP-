import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SprintsService } from '@core/api/sprint.api';
import { ProjectFeatureService } from '@features/project/tools/project-feature.service';
import { fromForm } from '@shared/utils/utils';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-project-sprints',
  templateUrl: './list-project-sprints.component.html',
  styleUrls: ['./list-project-sprints.component.scss']
})
export class ListProjectSprintsComponent implements OnDestroy, OnInit {

  constructor(
    private _fb: FormBuilder,
    private _projectFeatureService: ProjectFeatureService,
    private _sprintsService: SprintsService
  ) { }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnInit() {
    this.applyFilter();
  }

  @Input() projectId!: number | null;

  search = this._fb.control("");

  displayedColumns = ["id", "objective", "startDate", "endDate", "status", "actions"];

  sort: MatSort;

  dataSource = new MatTableDataSource();

  private _destroy$ = new Subject();

  allocation$ = this._projectFeatureService.currentAllocation$;
  projectId$ = this._projectFeatureService.currentProjectId$;

  search$ = fromForm(this.search);

  dataSource$ = this.projectId$.pipe(
    switchMap((projectId) => this._sprintsService.getAll({ projectId, _sort: "id", _order: "desc" })),
    tap((data) => this.dataSource.data = data),
    map(_ => this.dataSource)
  );

  applyFilter() {
    this.search$.pipe(takeUntil(this._destroy$))
      .subscribe(search => this.dataSource.filter = search);
  }
}
