import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/firestore';
import { GeoFireObj, GeoFirestore } from '@digitaldealers/geostore';
import { LocalStorageService } from 'angular-2-local-storage';
import { isSameDay } from 'date-fns';
import firebase from 'firebase/app';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Assigment } from './interfaces/assigment';
import { Jobcard } from './interfaces/jobcard';

@Injectable()
export class FireStoreService {
  private paramsGeoQuery: any[] = [];
  private paramsTimeQuery: any[] = [];
  private geoQuery: any = null;
  private geoQuerySub$ = new BehaviorSubject<any>(null);
  geoQueryWorker: any = null;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private _localStorageService: LocalStorageService
  ) {
  }

  public getFirebaseToken(): Observable<{ token: string }> {
    const url = `<authApi>/dealers/getAppToken?appType=<applicationId>&lc=true`;
    return this.http.get<{ token: string }>(url);
  }

  getGeoWorkerAndAssigmnets(mapCenter: any, status: any, date: any, startTime: any, endTime: any) {
    this.getGeoAssigments(mapCenter, status, startTime, endTime);
    if (!isSameDay(new Date(), date)) {
      if (this.geoQueryWorker) {
        this.geoQueryWorker.cancel();
        this.geoQueryWorker = null;
      }
    } else {
      this.getGeoWorkers(mapCenter);
    }

    return this.geoQuerySub$;
  }

  getGeoWorkers(mapCenter: any) {
    const params = [];
    params.push({
      name: 'dealerId',
      value: this._localStorageService.get('dealerId')
    });
    params.push({ name: 'type', value: 'worker' });

    const collectionRef = this.afs.collection<GeoFireObj>('users').ref;
    const geoFirestore = new GeoFirestore(collectionRef);

    if (!this.geoQueryWorker) {
      this.geoQueryWorker = geoFirestore.query(
        {
          center: [mapCenter.center.lat(), mapCenter.center.lng()],
          radius: mapCenter.r
        },
        params
      );

      this.geoQueryWorker.on('ready', () => {
        this.geoQuerySub$.next({ event: 'ready_worker', value: null });
      });

      this.geoQueryWorker.on('key_entered', (key: any, location: any, _distance: any, data: any) => {
        this.geoQuerySub$.next({
          event: 'key_entered_worker',
          key: key,
          location: location,
          data: data
        });
      });

      this.geoQueryWorker.on('key_exited', (key: any, location: any, _distance: any, data: any) => {
        this.geoQuerySub$.next({
          event: 'key_exited_worker',
          key: key,
          location: location,
          data: data
        });
      });

      this.geoQueryWorker.on('key_moved', (key: any, location: any, _distance: any, data: any) => {
        this.geoQuerySub$.next({
          event: 'key_moved_worker',
          key: key,
          location: location,
          data: data
        });
      });
    } else {
      if (mapCenter != null) {
        this.geoQueryWorker.updateCriteria(
          {
            center: [mapCenter.center.lat(), mapCenter.center.lng()],
            radius: mapCenter.r
          },
          params
        );
      }
    }

    return this.geoQuerySub$;
  }

  getGeoAssigments(mapCenter: any, status: any, startTime: any, endTime: any) {
    const params = [];
    params.push({
      name: 'dealerId',
      value: this._localStorageService.get('dealerId')
    });

    if (status) {
      params.push({ name: 'status', value: status });
    }

    if (
      (!isEqual(this.paramsGeoQuery, params) ||
        !isEqual(this.paramsTimeQuery, [startTime, endTime])) &&
      this.geoQuery
    ) {
      this.geoQuery.cancel();
      this.geoQuery = null;
    }

    this.paramsTimeQuery = [startTime, endTime];
    this.paramsGeoQuery = params;

    const collectionRef = this.afs.collection<GeoFireObj>('assignments').ref;
    const geoFirestore = new GeoFirestore(collectionRef);

    if (!this.geoQuery) {
      this.geoQuery = geoFirestore.query(
        {
          center: [mapCenter.center.lat(), mapCenter.center.lng()],
          radius: mapCenter.r
        },
        params
      );

      this.geoQuery.on('ready', () => {
        this.geoQuerySub$.next({ event: 'ready', value: null });
      });

      this.geoQuery.on('key_entered', (key: any, location: any, _distance: any, data: any) => {
        this.handleAssignmentGeoQuery('key_entered', key, location, data);
      });

      this.geoQuery.on('key_exited', (key: any, location: any, _distance: any, data: any) => {
        this.handleAssignmentGeoQuery('key_exited', key, location, data);
      });

      this.geoQuery.on('key_moved', (key: any, location: any, _distance: any, data: any) => {
        this.handleAssignmentGeoQuery('key_moved', key, location, data);
      });
    } else {
      if (mapCenter != null) {
        this.geoQuery.updateCriteria(
          {
            center: [mapCenter.center.lat(), mapCenter.center.lng()],
            radius: mapCenter.r
          },
          params
        );
      }
    }

    return this.geoQuerySub$;
  }

  handleAssignmentGeoQuery(event: any, key: any, location: any, data: any) {
    if (
      data.timestamp >= this.paramsTimeQuery[0] &&
      data.timestamp <= this.paramsTimeQuery[1]
    ) {
      this.geoQuerySub$.next({ event, key, location, data });
    }
  }

  getAssignmentsByInterval(start: any, end: any) {
    return this.afs
      .collection('assignments', ref => {
        return ref
          .where('dealerId', '==', this._localStorageService.get('dealerId'))
          .where('timestamp', '>=', start)
          .where('timestamp', '<=', end);
      })
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Assigment;
            data.id = (a.payload.doc as any).id;
            data.address = data.address
              .replace(/(\r\n\t|\n|\r\t)/gm, ' ')
              .replace('%1', '');
            return data;
          });
        })
      );
  }

  getDocsByAssignment(id: any) {
    return this.afs
      .collection('images', ref => {
        return ref.where('assignmentId', '==', id);
      })
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data: any = a.payload.doc.data();
            data.id = (a.payload.doc as any).id;
            data.src = 'data:image/jpeg;base64, ' + data.image;
            return data;
          });
        })
      );
  }

  getTimeSheetByInterval(start: any, end: any) {
    return this.afs
      .collection('jobcards', ref => {
        return ref
          .where('dealerId', '==', this._localStorageService.get('dealerId'))
          .where('status', '==', 'Completed')
          .where('startTime', '>=', start)
          .where('startTime', '<=', end)
          .orderBy('startTime');
      })
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Jobcard;
            data.id = (a.payload.doc as any).id;
            return data;
          });
        })
      );
  }

  updateTimeJob(item: any) {
    delete item['isNotesOpen'];
    const assignmentDoc = this.afs.doc(`jobcards/${item.id}`);
    return assignmentDoc.update(item);
  }

  deleteTimeJob(item: any) {
    const assignmentDoc = this.afs.doc(`jobcards/${item.id}`);
    return assignmentDoc.delete().then(
      () => {
        console.warn('Record has been deleted');
      },
      error => {
        console.error('Error: ' + error);
      }
    );
  }

  updateTimeJobBatch(events: any, expenses: any, allowances: any) {
    const batch = this.afs.firestore.batch();

    events.map((event: any) => {
      delete event['isNotesOpen'];
      const assignmentDoc = this.afs.doc(`jobcards/${event.id}`);
      batch.update(assignmentDoc.ref, event);
    });

    expenses.map((event: any) => {
      delete event['isNotesOpen'];
      const assignmentDoc = this.afs.doc(`jobcards/${event.id}`);
      batch.update(assignmentDoc.ref, event);
    });

    allowances.map((event: any) => {
      delete event['isNotesOpen'];
      const assignmentDoc = this.afs.doc(`jobcards/${event.id}`);
      batch.update(assignmentDoc.ref, event);
    });

    // Commit the batch
    return batch.commit();
  }

  updateAssignment(item: Assigment) {
    const assignmentDoc = this.afs.doc(`assignments/${item.id}`);
    return assignmentDoc.update(item);
  }

  getWorkers(workGroup = null) {
    return this.afs
      .collection('users', ref => {
        let query = ref
          .where('dealerId', '==', this._localStorageService.get('dealerId'))
          .where('type', '==', 'worker');

        if (workGroup != null) {
          query = query.where('workGroup', '==', workGroup);
        }
        return query;
      })
      .stateChanges(['added']);
  }

  getWorkGroups() {
    return this.afs
      .collection('workGroups', ref => {
        return ref.where(
          'dealerId',
          '==',
          this._localStorageService.get('dealerId')
        );
      })
      .valueChanges();
  }

  searchWorkers(start = '') {
    const end = start + '\uf8ff';
    return this.afs
      .collection('users', ref => {
        return ref
          .where('dealerId', '==', this._localStorageService.get('dealerId'))
          .where('type', '==', 'worker')
          .orderBy('displayName')
          .limit(5)
          .startAt(start)
          .endAt(end);
      })
      .valueChanges();
  }

  getWorkerAssignments(worker: any, day: any, month: any, year: any) {
    return this.afs
      .collection<Assigment>('assignments', ref => {
        let query: CollectionReference | Query = ref;
        query = query.where('dealerId', '==', this._localStorageService.get('dealerId'));
        query = query.where('day', '==', day);
        query = query.where('month', '==', month);
        query = query.where('year', '==', year);
        query = query.where('worker', '==', worker);
        query = query.orderBy('date', 'asc');
        return query;
      })
      .valueChanges();
  }

  addAssigment(item: Assigment) {
    const collectionRef = this.afs.collection<GeoFireObj>('assignments').ref;
    const geoFirestore = new GeoFirestore(collectionRef);
    const loc = item.location as firebase.firestore.GeoPoint;
    item.dealerId = this._localStorageService.get('dealerId');
    return geoFirestore.set(null, item, [loc.latitude, loc.longitude]).then(
      () => {
        console.warn('Provided key has been added to GeoFirestore');
      },
      error => {
        console.error('Error: ' + error);
      }
    );
  }

  getCurrentLocation() {
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(position => {
        resolve(
          new firebase.firestore.GeoPoint(
            position.coords.latitude,
            position.coords.longitude
          )
        );
      });
    });
  }

  addTimeEnty(item: any) {
    const collectionRef = this.afs.collection('jobcards').ref;
    item.dealerId = this._localStorageService.get('dealerId');
    return collectionRef.add(item).then(
      () => {
        console.warn('Record has been added');
      },
      (error: any) => {
        console.error('Error: ' + error);
      }
    );
  }
}
