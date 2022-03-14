export class GeoCallbackRegistration {
  /**
   * @param _cancelCallback Callback to run when this callback registration is cancelled.
   */
  constructor(private _cancelCallback: Function | null) {
    if (Object.prototype.toString.call(this._cancelCallback) !== '[object Function]') {
      throw new Error('callback must be a function');
    }
  }

  /**
   * Cancels this callback registration so that it no longer fires its callback. This
   * has no effect on any other callback registrations you may have created.
   */
  public cancel(): void {
    if (this._cancelCallback) {
      this._cancelCallback();
      this._cancelCallback = null;
    }
  }
}
