import { AbstractControl, FormGroup } from "@angular/forms";
import { merge } from "rxjs";
import { first, startWith, switchMapTo } from "rxjs/operators";

export function buildQuery(objQuery?: any) {
    if (!objQuery) return "";

    var entries = Object.entries(objQuery)
        .map(([key, value]) => value ? `${key}=${value}` : null)
        .filter(query => !!query)
        .join("&");

    return entries.length ? `?${entries}` : "";
}

export function fromForm(control: AbstractControl, fieldNames: string[] = []) {
    if(!fieldNames.length)
        return control.valueChanges.pipe(startWith(control.value));

        return merge(
        ...fieldNames
            .map(fieldName => control.get(fieldName))
            .map(field => field!.valueChanges)
        ).pipe(
            switchMapTo(control.valueChanges.pipe(first())),
            startWith(control.value)
        )
}

export function insensitiveCompare(a: string, b: string) {
    return a.toLowerCase() === b.toLowerCase();
}

export function insensitiveContains(contain: string, contained: string) {
    return contain?.toLowerCase().includes(contained?.toLowerCase());
}