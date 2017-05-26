import { Observable, IObserver, Subject, helpers } from 'rx';

import { Property, Command, ObservableOrPropertyOrValue } from './Interfaces';

export function isObservable<T>(value: any | undefined): value is Observable<T> {
  return Observable.isObservable(value);
}

export function isObserver<T>(value: any | undefined): value is IObserver<T> {
  if (value == null) {
    return false;
  }

  const obs = <IObserver<any>>value;

  return (
    helpers.isFunction(obs.onNext) &&
    helpers.isFunction(obs.onError) &&
    helpers.isFunction(obs.onCompleted)
  );
}

export function isSubject<T>(value: any): value is Subject<T> {
  return isObservable(value) && isObserver(value);
}

export function isProperty<T>(value: any | undefined): value is Property<T> {
  if (value == null) {
    return false;
  }

  return isObservable((<Property<T>>value).changed);
}

export function isCommand<T>(value: any | undefined): value is Command<T> {
  if (value == null) {
    return false;
  }

  return isObservable((<Command<any>>value).results);
}

export function asObservable<T>(value: T | Observable<T>) {
  return isObservable(value) ? value : Observable.of(value);
}

export function getObservable<T>(observableOrProperty: ObservableOrPropertyOrValue<T>) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty.changed.startWith(observableOrProperty.value);
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty;
  }

  if (observableOrProperty != null) {
    return Observable.of(observableOrProperty);
  }

  return Observable.never<T>();
}

export function getProperty<T>(observableOrProperty: ObservableOrPropertyOrValue<T>, initialValue?: T) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty;
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty.toProperty(initialValue);
  }

  if (initialValue == null && observableOrProperty != null) {
    initialValue = observableOrProperty;
  }

  return Observable.never<T>().toProperty(initialValue);
}

export function handleError(e: any, ...optionalParams: any[]) {
  const err = e instanceof Error ? e : new Error(e);

  // trim off the subject if it was provided with the optional params
  const subject = isSubject(optionalParams[0]) ?
    optionalParams.shift() :
    undefined;

  if (DEBUG || subject == null) {
    // in debug mode we want to emit any webrx errors
    // if there is no subject receiving the error then we should be emitting to the console
    logError(err, ...optionalParams);
  }

  if (isSubject<Error>(subject)) {
    subject.onNext(err);
  }
}

// replace this function to inject your own global error handling
export function logError(err: Error, ...optionalParams: any[]) {
  // tslint:disable-next-line:no-console
  console.error(err, ...optionalParams);
}
