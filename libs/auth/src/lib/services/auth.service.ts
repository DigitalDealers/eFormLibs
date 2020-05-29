import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { CanActivate, CanActivateChild } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { FireStoreService, User as FirebaseUser } from '@digitaldealers/firebase-api';
import { User as AppUser } from '@digitaldealers/typings';
import { LocalStorageService } from 'angular-2-local-storage';
import { from, Observable, of, Subscription, throwError, timer } from 'rxjs';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class AuthService implements CanActivate, CanActivateChild, OnDestroy {
  private refreshFirebaseSub: Subscription | null = null;
  private jwtHelper = new JwtHelperService();
  private needUpsertUser = false;

  constructor(
    private localStorageService: LocalStorageService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private api: FireStoreService
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
    this.localStorageService.set('token', token);
  }

  public getToken(): string {
    return this.localStorageService.get<string>('token');
  }

  public getCustomerNumber(): AppUser | null {
    return this.fetchKioskProfile();
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public getFirebaseToken(needUpsertUser = false): Observable<void> {
    this.needUpsertUser = needUpsertUser;
    return this.api.getFirebaseToken()
      .pipe(
        catchError(err => {
          console.error(err);
          return throwError(`An error occurred when fetching Firebase token: ${err.message}`);
        }),
        switchMap(({ token }) => this.firebaseAuth(token))
      );
  }

  private fetchKioskProfile(): AppUser | null {
    const token = this.getToken();
    try {
      return this.jwtHelper.isTokenExpired(token) ? null : this.jwtHelper.decodeToken(token) as AppUser;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private firebaseAuth(firebaseToken: string): Observable<void> {
    return from(this.afAuth.auth.signInWithCustomToken(firebaseToken))
      .pipe(
        catchError(err => {
          console.error(err);
          return throwError(`${err.code} Can't log in to Firebase: ${err.message}`);
        }),
        tap(() => this.scheduleFirebaseRenewal()),
        switchMap(() => {
          try {
            const token = this.getToken();
            const profile = this.jwtHelper.decodeToken(token) as AppUser;
            this.localStorageService.set('dealerId', profile['https://digital-dealers.com/dealerid']);
            return this.needUpsertUser ? this.upsertUser(profile) : of(void 0);
          } catch (e) {
            console.error(e);
            throw new Error(`Can't log in to Firebase: invalid token`);
          }
        })
      );
  }

  private upsertUser(profile: AppUser): Observable<void> {
    let currentUserId: string;
    let doc: AngularFirestoreDocument<FirebaseUser>;
    return this.afAuth.user
      .pipe(
        switchMap(currentUser => {
          if (!currentUser) {
            return of(null);
          }
          currentUserId = currentUser.uid;
          doc = this.afs.collection<FirebaseUser>('users').doc(currentUserId);
          return doc.get();
        }),
        switchMap(docSnapshot => {
          if (!docSnapshot || docSnapshot.exists) {
            return of(void 0);
          }

          const usrToSave: FirebaseUser = {
            email: currentUserId,
            displayName: profile['https://digital-dealers.com/fullName'] || '',
            language: 'en-au',
            dealerId: profile['https://digital-dealers.com/dealerid'],
            timezone: 10,
            worker: '',
            photoURL: profile['https://digital-dealers.com/userLogo'] || '',
            phoneNumber: profile['https://digital-dealers.com/phone'] || '',
            type: 'planner',
            workGroup: '',
            jobTitle: ''
          };
          return doc.set(usrToSave);
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
    const expiresIn$ = of(expiresAt).pipe(mergeMap(expires => {
      const now = Date.now();
      return timer(Math.max(1, expires - now));
    }));

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
