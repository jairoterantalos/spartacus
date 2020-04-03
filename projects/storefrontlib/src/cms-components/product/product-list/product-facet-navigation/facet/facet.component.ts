import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  ViewChild,
} from '@angular/core';
import { Facet, FacetValue } from '@spartacus/core';
import { Observable } from 'rxjs';
import { ICON_TYPE } from '../../../../../cms-components/misc/icon/icon.model';
import { FocusDirective } from '../../../../../layout/a11y/keyboard-focus/focus.directive';
import { FacetCollapseState } from '../facet.model';
import { FacetService } from '../services/facet.service';

@Component({
  selector: 'cx-facet',
  templateUrl: './facet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacetComponent {
  protected _facet: Facet;

  state$: Observable<FacetCollapseState>;

  /** configurable icon that is used to collapse the facet group  */
  @Input() expandIcon: ICON_TYPE = ICON_TYPE.EXPAND;
  @Input() collapseIcon: ICON_TYPE = ICON_TYPE.COLLAPSE;

  @HostBinding('class.multi-select') isMultiSelect: boolean;

  @ViewChild(FocusDirective) keyboardFocus: FocusDirective;

  @Input()
  set facet(value: Facet) {
    this._facet = value;
    this.isMultiSelect = !!value.multiSelect;
    this.state$ = this.facetService.getState$(value);
  }

  get facet(): Facet {
    return this._facet;
  }

  constructor(
    protected facetService: FacetService,
    protected elementRef: ElementRef<HTMLElement>
  ) {}

  /**
   * Handles clicking the heading of the facet group, which means toggling the visibility
   * of the group (collapse / expand) and optionally focusing the group.
   */
  toggleGroup(event: UIEvent) {
    const host: HTMLElement = this.elementRef.nativeElement;
    const isLocked = this.keyboardFocus?.isLocked;

    const isExpanded = host.classList.contains('expanded');

    if (!isLocked || isExpanded) {
      this.facetService.toggleExpand(this.facet);
      host.focus();
      // we stop propagating the event as otherwise the focus on the host will trigger
      // an unlock event from the LockFocus directive.
      event.stopPropagation();
    } else {
      this.facetService.toggleExpand(this.facet, true);
    }
  }

  /**
   * Increases the number of visible values for the facet. This is delegated
   * to `facetService.increaseVisibleValues`.
   */
  increaseVisibleValues(): void {
    this.facetService.increaseVisibleValues(this.facet);
  }

  /**
   * Decreases the number of visible values for the facet. This is delegated
   * to `facetService.decreaseVisibleValues`.
   */
  decreaseVisibleValues(): void {
    this.facetService.decreaseVisibleValues(this.facet);
  }

  getLinkParams(value: FacetValue) {
    return this.facetService.getLinkParams(value.query.query.value);
  }
}
