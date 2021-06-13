import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
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
}
