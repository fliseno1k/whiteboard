/*
 * This file contains source code copied and adapted from the Eventary library.
 *
 * Original Source: https://github.com/hmans/eventery
 *
 * Copyright (c) 2023 Hendrik Mans
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Any modifications or additional code in this file are Copyright (c) 2025 Aleksei Flis
 * and are also licensed under the same terms unless otherwise noted.
 *
 * DISCLAIMER:
 *   This notice is provided in compliance with the Eventary library’s license terms.
 *   For the full licensing details, please refer to the original license file or repository
 *   linked above.
 */

export type Callback<T extends unknown[]> = (...args: T) => void;

export type SubscriptionEvent<T extends unknown[]> = Event<
  [callback: Callback<T>]
>;

export class Event<T extends unknown[] = []> {
  private readonly subscribers = new Set<Callback<T>>();

  protected _onSubscribe?: SubscriptionEvent<T>;
  protected _onUnsubscribe?: SubscriptionEvent<T>;

  /**
   * Event that is emitted when a new subscription is added.
   */
  public get onSubscribe(): SubscriptionEvent<T> {
    if (!this._onSubscribe) this._onSubscribe = new Event();
    return this._onSubscribe;
  }

  /**
   * Event that is emitted when a subscription is removed.
   */
  public get onUnsubscribe(): SubscriptionEvent<T> {
    if (!this._onUnsubscribe) this._onUnsubscribe = new Event();
    return this._onUnsubscribe;
  }

  /**
   * Subscribes a callback to the event.
   *
   * @param callback The callback to subscribe to the event.
   * @returns A function that will unsubscribe the callback.
   */
  public subscribe(callback: Callback<T>) {
    this.subscribers.add(callback);
    this._onSubscribe?.emit(callback);

    /* Return a function that will unsubscribe the callback */
    return () => this.unsubscribe(callback);
  }

  /**
   * Unsubscribes a callback from the event.
   *
   * @param callback The callback to unsubscribe from the event.
   */
  public unsubscribe(callback: Callback<T>) {
    this.subscribers.delete(callback);
    this._onUnsubscribe?.emit(callback);
  }

  /**
   * Clears all existing subscriptions.
   */
  public clear() {
    if (this._onUnsubscribe) {
      for (const callback of this.subscribers) {
        this._onUnsubscribe.emit(callback);
      }
    }

    this.subscribers.clear();
  }

  /**
   * Emit the event. This will invoke all stored listeners, passing the
   * given payload to each of them.
   *
   * @param args Arguments to pass to the listeners.
   */
  public emit(...args: T) {
    this.subscribers.forEach((callback) => callback(...args));
  }

  /**
   * Emit the event. This will invoke all stored listeners, passing the
   * given payload to each of them. This method supports asynchronous
   * listeners and returns a promise that resolves when all listeners
   * have completed their work.
   *
   * @param args Arguments to pass to the listeners.
   * @returns A promise that resolves when all listeners have been invoked.
   */
  public emitAsync(...args: T) {
    return Promise.all(
      [...this.subscribers].map((listener) => listener(...args))
    );
  }
}