import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  getUserData: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
}
