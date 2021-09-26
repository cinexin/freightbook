import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  onAlertEvent: EventEmitter<string> = new EventEmitter<string>();
  updateNumOfFriendRequestsEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }
}