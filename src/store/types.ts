import { ActionCreator, MapStateToProps as _MapStateToProps } from "react-redux";
import { Action } from "redux";
import { ThunkAction, ThunkDispatch as _ThunkDispatch } from "redux-thunk";
import { ApplicationState } from 'src/store';

export type ThunkResult<T> = ThunkAction<T, ApplicationState, undefined, Action>;

export type ThunkActionCreator<T> = ActionCreator<ThunkResult<T>>;

export type ThunkDispatch = _ThunkDispatch<ApplicationState, undefined, Action>

export type MapState<S, O> = _MapStateToProps<S, O, ApplicationState>;

export interface HasStringID { id: string; }

export interface HasNumericID { id: number; }

export type Entity = HasStringID | HasNumericID;

export type TypeOfID<T> = T extends HasNumericID ? number : string;

export type EntityMap<T> = Record<string, T>;

export interface MappedEntityState<T extends Entity> {
  error?: Error;
  items: string[];
  itemsById: EntityMap<T>;
  lastUpdated: number;
  loading: boolean;
}

export interface EntityState<T extends Entity> {
  results: TypeOfID<T>[];
  entities: T[];
  loading: boolean;
  lastUpdated: number;
  error?: Linode.ApiFieldError[];
}

export interface RequestableData<D> {
  lastUpdated: number;
  loading: boolean;
  data?: D;
  error?: Error | Linode.ApiFieldError[];
}
