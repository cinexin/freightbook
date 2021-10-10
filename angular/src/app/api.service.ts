import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import {EventEmitterService} from "./event-emitter.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private eventEmitterService: EventEmitterService
  ) { }

  private baseUrl = 'http://localhost:3000';

  private successHandler = (value: any) => {
    return value;
  };

  private errorHandler = (error: any) => {
    return error;
  };

  public makeRequest(requestObject: any): any {
    let method = requestObject.method;
    if (!method) {
      return console.log('No type specified in the request object.')
    }

    let body = requestObject.body || {};
    let location = requestObject.location;
    if (!location) {
      return console.log('No location specified in the request object.');
    }

    let url = `${this.baseUrl}/${location}`;

    let httpOptions = {};

    if (this.localStorageService.getToken()) {
      httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.localStorageService.getToken()}`
        })
      }
    }
    if (method === 'GET') {
      return this.http.get(url, httpOptions).toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }
    if (method === 'POST') {
      return this.http.post(url, body, httpOptions).toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }

    console.log('Could not make the request. Make sure a type of GET or POST is supplied.');
  }

  public makeFriendRequest(to: string) {
    const from = this.localStorageService.getParsedToken()._id;
    console.log(`User ${from} is sending a friend request to user ${to}`)
    const requestObj = {
      location: `users/make-friend-request/${from}/${to}`,
      method: `POST`
    };
    return new Promise((resolve, reject) => {
      this.makeRequest(requestObj).then((val: any) => {
        if (val.statusCode === 201) {
          this.eventEmitterService.onAlertEvent.emit('Friend request successfully sent');
        } else {
          this.eventEmitterService.onAlertEvent.emit('Something went wrong');
        }
        resolve(val)
      }).catch((err: any) => {
        this.eventEmitterService.onAlertEvent.emit('Some error occurred in the API call: ${err}')
        reject(err);
      });
    });
  }

  public resolveFriendRequest(resolution: any, id: any) {
    const to = this.localStorageService.getParsedToken()._id;
    return new Promise((resolve, reject) => {
      const requestObj = {
        location: `users/resolve-friend-request/${id}/${to}?resolution=${resolution}`,
        method: 'POST'
      };
      this.makeRequest(requestObj).then((val: any) => {
        if (val.statusCode === 200) {
          const resolution = (val.resolution == 'accept') ? 'accepted' : 'declined';
          this.eventEmitterService.onAlertEvent.emit(`Successfully ${resolution} friend request`);
          this.eventEmitterService.updateNumOfFriendRequestsEvent.emit();
        } else {
          this.eventEmitterService.onAlertEvent.emit(`Something went wrong and we couldn't handle the friend request resolution`);
        }
        resolve(val);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }
}
