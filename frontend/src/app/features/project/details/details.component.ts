import { AfterContentInit, Component } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { ProjectFeatureService } from "../tools/project-feature.service";

@Component({
    templateUrl: "./details.component.html",
    styleUrls: ["./details.component.scss"]
})
export class DetailsComponent implements AfterContentInit {
    constructor(
        private _projectFeatureService: ProjectFeatureService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) { }

    ngAfterContentInit() {
        this._activatedRoute.queryParams.pipe(
            first()
        ).subscribe(params => this.activeTab = params['option'] ? this.tabOptions.indexOf(params['option']) : 0);
    }

    activeTab = 0;

    tabOptions: Array<string> = [
        'tarefas',
        'alocações',
        'reuniões',
        'sprints',
        'sprint_backlog'
    ];

    projectId$ = this._projectFeatureService.currentProjectId$;

    handleMatTabChange(event: MatTabChangeEvent) {
        let tabParam = this.tabOptions[event.index];
        this._router.navigate([], { queryParams: { option: tabParam }, queryParamsHandling: 'merge' });
    }
}