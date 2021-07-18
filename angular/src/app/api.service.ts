import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import {AlertsService} from "./alerts.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private alertsService: AlertsService
  ) { }

  private baseUrl = 'http://localhost:3000';

  private successHandler = (value: any) => {
    return value;
  };

  private errorHandler = (error: any) => {
    return error;
  };

  public makeRequest(requestObject: any): any {
    let type = requestObject.type.toLowerCase();
    if (!type) {
      return console.log('No type specified in the request object.')
    }

    let body = requestObject.body || {};
    let location = requestObject.location;
    if (!location) {
      return console.log('No location specified in the request object.');
    }

    let url = `${this.baseUrl}/${location}`;

    let httpOptions = {};

    if (requestObject.authorize) {
      httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.localStorageService.getToken()}`
        })
      }
    }
    if (type === 'get') {
      return this.http.get(url, httpOptions).toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }
    if (type === 'post') {
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
      type: `POST`,
      authorize: true
    };
    this.makeRequest(requestObj).then((val: any) => {
      console.log(val);
      if (val.statusCode === 201) {
        this.alertsService.onAlertEvent.emit('Friend request successfully sent');
      } else {
        this.alertsService.onAlertEvent.emit('Something went wrong');
      }
    }).catch((err: any) => {
      this.alertsService.onAlertEvent.emit('Some error occurred in the API call: ${err}')
    });
  }

  public resolveFriendRequest(resolution: any, id: any) {
    const to = this.localStorageService.getParsedToken()._id;
    return new Promise((resolve, reject) => {
      const requestObj = {
        location: `users/resolve-friend-request/${id}/${to}?resolution=${resolution}`,
        type: 'POST',
        authorize: true
      };
      this.makeRequest(requestObj).then((val: any) => {
        resolve(val);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }
}
