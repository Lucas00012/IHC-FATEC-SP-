import { Component, forwardRef } from "@angular/core";
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

export function valueAcessorProvider(type) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    }
}

@Component({
    template: ""
})
export abstract class NestedForm implements ControlValueAccessor {
    protected abstract form: AbstractControl;

    protected destroy$ = new Subject();

    protected onChange: (value:any) => void;
    protected onTouched: () => void;
    protected onValidatorChange: () => void;

    writeValue(obj: any): void {
        this.form.patchValue(obj, { emitEvent: false });
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
        this.form.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(this.onChange);
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.form.disable() : this.form.enable();
    }

}