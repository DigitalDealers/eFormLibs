import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { CanActivate, CanActivateChild } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { FireStoreService, User } from '@digitaldealers/firebase-api';
import { LocalStorageService } from 'angular-2-local-storage';
import { Observable, of, Subscription, throwError, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthService implements CanActivate, CanActivateChild, OnDestroy {
  private refreshFirebaseSub: Subscription;
  private jwtHelper = new JwtHelperService();
  private needUpsertUser: boolean;

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

  public canActivate(): boolean {
    return !!this.fetchKioskProfile();
  }

  public canActivateChild(): boolean {
    return this.canActivate();
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
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
      return false;
    }
  }

  public getFirebaseToken(needUpsertUser = false): Observable<any> {
    this.needUpsertUser = needUpsertUser;
    return this._api.getFirebaseToken()
      .pipe(
        catchError(err => throwError(`An error occurred fetching Firebase token: ${err.message}`)),
        switchMap(({ token }) => this._firebaseAuth(token))
      );
  }

  private fetchKioskProfile(): any | null {
    const token = this.getToken();
    try {
      return this.jwtHelper.isTokenExpired(token) ? null : this.jwtHelper.decodeToken(token);
    } catch (e) {
      return null;
    }
  }

  private _firebaseAuth(fbToken: string): Observable<any> {
    return fromPromise(this.afAuth.signInWithCustomToken(fbToken))
      .pipe(
        catchError(err => throwError(`${err.code} Can't log into Firebase: ${err.message}`)),
        switchMap(() => {
          this.scheduleFirebaseRenewal();
          const token = this.getToken();
          try {
            const profile = this.jwtHelper.decodeToken(token);
            this._localStorageService.set('dealerId', profile['https://digital-dealers.com/dealerid']);
            return this.needUpsertUser ? this.upsertUser(profile) : of(null);
          } catch (e) {
            throw new Error(`Can't log into Firebase: invalid token`);
          }
        })
      );
  }

  private upsertUser(profile): Observable<any> {
    let currentUserId: string;
    let doc: AngularFirestoreDocument<User>;
    return this.afAuth.user
      .pipe(
        switchMap(currentUser => {
          currentUserId = currentUser.uid;
          doc = this.afs.collection<User>('users').doc(currentUserId);
          return doc.get();
        }),
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
      .pipe(switchMap(() => this.getFirebaseToken(this.needUpsertUser)))
      .subscribe({ error: err => console.error(err) });
  }

  private unscheduleFirebaseRenewal(): void {
    if (this.refreshFirebaseSub) {
      this.refreshFirebaseSub.unsubscribe();
    }
  }
}
