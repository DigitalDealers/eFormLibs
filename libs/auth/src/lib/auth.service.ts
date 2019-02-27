import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable, of, Subscription, throwError, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';

import { Assigment, FireStoreService, User } from 'eformlibs/firebase-api';

@Injectable()
export class AuthService implements CanActivate, CanActivateChild, OnDestroy {
  private refreshFirebaseSub: Subscription;
  private jwtHelper = new JwtHelperService();

  constructor(
    private _localStorageService: LocalStorageService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private _api: FireStoreService
  ) {
  }

  public ngOnDestroy(): void {
    this.unscheduleFirebaseRenewal();
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return !!this.fetchKioskProfile();
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  public setSession(token: string): void {
    this._localStorageService.set('token', token);
  }

  public getToken(): string {
    return this._localStorageService.get('token');
  }

  public getCustomerNumber(): any | null {
    return this.fetchKioskProfile();
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !this.jwtHelper.isTokenExpired(token);
  }

  public getFirebaseToken(): Observable<any> {
    return this._api.getFirebaseToken()
      .pipe(
        catchError(err => throwError(`An error occurred fetching Firebase token: ${ err.message }`)),
        switchMap(({ token }) => this._firebaseAuth(token))
      );
  }

  private fetchKioskProfile(): any | null {
    const token = this.getToken();
    return this.jwtHelper.isTokenExpired(token) ? null : this.jwtHelper.decodeToken(token);
  }

  private _firebaseAuth(fbToken: string): Observable<any> {
    return fromPromise(this.afAuth.auth.signInWithCustomToken(fbToken))
      .pipe(
        catchError(err => throwError(`${ err.code } Could not log into Firebase: ${ err.message }`)),
        switchMap(() => {
          this.scheduleFirebaseRenewal();
          const token = this.getToken();
          const profile = this.jwtHelper.decodeToken(token);
          this._localStorageService.set('dealerId', profile['https://digital-dealers.com/dealerid']);
          return this.upsertUser(profile);
        })
      );
  }

  private upsertUser(profile): Observable<any> {
    const currentUserId = this.afAuth.auth.currentUser.uid;
    const doc = this.afs.collection<Assigment>('users').doc(currentUserId);

    return doc.get()
      .pipe(
        switchMap(docSnapshot => {
          if (!docSnapshot.exists) {
            const usrToSave: User = {
              email: currentUserId,
              displayName: profile['https://digital-dealers.com/fullName'],
              language: 'en-au',
              dealerId: profile['https://digital-dealers.com/dealerid'],
              timezone: 10,
              worker: '',
              photoURL: profile['https://digital-dealers.com/userLogo'],
              phoneNumber: profile['https://digital-dealers.com/phone'],
              type: 'planner',
              workGroup: null,
              jobTitle: null
            };
            return doc.set(usrToSave);
          }
          return of(null);
        }),
        catchError(err => {
          console.error(err);
          return throwError(`Can't update user data`);
        })
      );
  }

  private scheduleFirebaseRenewal(): void {
    this.unscheduleFirebaseRenewal();
    const expiresAt = new Date().getTime() + 3600 * 1000;
    const expiresIn$ = of(expiresAt).pipe(
      mergeMap(expires => {
        const now = Date.now();
        return timer(Math.max(1, expires - now));
      })
    );

    this.refreshFirebaseSub = expiresIn$
      .pipe(switchMap(() => this.getFirebaseToken()))
      .subscribe({ error: err => console.error(err) });
  }

  private unscheduleFirebaseRenewal(): void {
    if (this.refreshFirebaseSub) {
      this.refreshFirebaseSub.unsubscribe();
    }
  }
}
