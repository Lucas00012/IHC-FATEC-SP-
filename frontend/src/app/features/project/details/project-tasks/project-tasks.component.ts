import { Component, Input } from "@angular/core";
import { Project } from "@core/entities/database-entities";

@Component({
    selector: "app-project-tasks",
    templateUrl: "./project-tasks.component.html",
    styleUrls: ["./project-tasks.component.scss"]
})
export class ProjectTasksComponent {

    constructor(

    ) { }

    @Input() project!: Project;
}