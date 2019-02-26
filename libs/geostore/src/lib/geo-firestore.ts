/*!
 * GeoFire is an open-source library that allows you to store and query a set
 * of keys based on their geographic location. At its heart, GeoFire simply
 * stores locations with string keys. Its main benefit, however, is the
 * possibility of retrieving only those keys within a given geographic area -
 * all in realtime.
 *
 * GeoFire 0.0.0
 * https://github.com/firebase/geofire-js/
 * License: MIT
 */

import * as firebase from 'firebase';

import { GeoFireObj } from './interfaces/geo-fire-obj';
import { QueryCriteria } from './interfaces/query-criteria';
import { GeoFirestoreQuery } from './query';
import { decodeGeoFireObject, encodeGeoFireObject, encodeGeohash, validateKey, validateLocation } from './utils';

/**
 * Creates a GeoFirestore instance.
 */
export class GeoFirestore {
  /**
   * @param _collectionRef A Firestore Collection reference where the GeoFirestore data will be stored.
   */
  constructor(private _collectionRef: firebase.firestore.CollectionReference) {
    if (
      Object.prototype.toString.call(this._collectionRef) !== '[object Object]'
    ) {
      throw new Error(
        'collectionRef must be an instance of a Firestore Collection'
      );
    }
  }

  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * Returns a promise fulfilled with the location corresponding to the provided key.
   *
   * If the provided key does not exist, the returned promise is fulfilled with null.
   *
   * @param key The key of the location to retrieve.
   * @returns A promise that is fulfilled with the location of the given key.
   */
  public get(key: string): Promise<number[]> {
    validateKey(key);
    return this._collectionRef
      .doc(key)
      .get()
      .then((documentSnapshot: firebase.firestore.DocumentSnapshot) => {
        if (!documentSnapshot.exists) {
          return null;
        } else {
          const snapshotVal = <GeoFireObj>documentSnapshot.data();
          return decodeGeoFireObject(snapshotVal);
        }
      });
  }

  /**
   * Returns the Firestore Collection used to create this GeoFirestore instance.
   *
   * @returns The Firestore Collection used to create this GeoFirestore instance.
   */
  public ref(): firebase.firestore.CollectionReference {
    return this._collectionRef;
  }

  /**
   * Removes the provided key from this GeoFirestore. Returns an empty promise fulfilled when the key has been removed.
   *
   * If the provided key is not in this GeoFirestore, the promise will still successfully resolve.
   *
   * @param key The key of the location to remove.
   * @returns A promise that is fulfilled after the inputted key is removed.
   */
  public remove(key: string): Promise<void> {
    return this.set(key, null);
  }

  /**
   * Adds the provided key - location pair(s) to Firestore. Returns an empty promise which is fulfilled when the write is complete.
   *
   * If any provided key already exists in this GeoFirestore, it will be overwritten with the new location value.
   *
   * @param keyOrLocations The key representing the location to add or a mapping of key - location pairs which
   * represent the locations to add.
   * @param location The [latitude, longitude] pair to add.
   * @returns A promise that is fulfilled when the write is complete.
   */
  public set(
    keyOrLocations: string | any,
    payload: any,
    location?: number[]
  ): Promise<any> {
    keyOrLocations = keyOrLocations ? keyOrLocations : '<xxx>';
    if (typeof keyOrLocations === 'string' && keyOrLocations.length !== 0) {
      validateKey(keyOrLocations);
      if (location === null) {
        // Setting location to null is valid since it will remove the key
        return this._collectionRef.doc(keyOrLocations).delete();
      } else {
        validateLocation(location);
        const geohash: string = encodeGeohash(location);
        const geohashToSave = encodeGeoFireObject(location, geohash);
        if (payload) {
          Object.assign(payload, geohashToSave);
        }
        if (keyOrLocations !== '<xxx>') {
          return this._collectionRef.doc(keyOrLocations).set(payload);
        } else {
          return this._collectionRef.add(payload);
        }
      }
    } else if (typeof keyOrLocations === 'object') {
      if (typeof location !== 'undefined') {
        throw new Error(
          'The location argument should not be used if you pass an object to set().'
        );
      }
    } else {
      throw new Error(
        'keyOrLocations must be a string or a mapping of key - location pairs.'
      );
    }

    const batch: firebase.firestore.WriteBatch = this._collectionRef.firestore.batch();
    Object.keys(keyOrLocations).forEach(key => {
      validateKey(key);
      const ref = this._collectionRef.doc(key);
      if (keyOrLocations[key] === null) {
        batch.delete(ref);
      } else {
        validateLocation(keyOrLocations[key]);
        const geohash: string = encodeGeohash(keyOrLocations[key]);
        batch.set(ref, encodeGeoFireObject(keyOrLocations[key], geohash), {
          merge: true
        });
      }
    });
    return batch.commit();
  }

  /**
   * Returns a new GeoQuery instance with the provided queryCriteria.
   *
   * @param queryCriteria The criteria which specifies the GeoQuery's center and radius.
   * @return A new GeoFirestoreQuery object.
   */
  public query(
    queryCriteria: QueryCriteria,
    exParams: any[]
  ): GeoFirestoreQuery {
    return new GeoFirestoreQuery(this._collectionRef, queryCriteria, exParams);
  }
}
