import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// eslint-disable-next-line jsdoc/require-jsdoc
export type BooleanFunction = ((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => boolean)
    | ((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => Promise<boolean>);