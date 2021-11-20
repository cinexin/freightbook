import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  onAlertEvent: EventEmitter<string> = new EventEmitter<string>();
  updateNumOfFriendRequestsEvent: EventEmitter<string> = new EventEmitter<string>();
  updateSendMessageObjectEvent: EventEmitter<object> = new EventEmitter<object>();
  resetMessageNotificationsEvent: EventEmitter<string> = new EventEmitter<string>();
  getUserData: EventEmitter<any> = new EventEmitter<any>();
  
  constructor() { }
}
