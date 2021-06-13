import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {ApiService} from "../api.service";

@Component({
  selector: 'app-page-feed',
  templateUrl: './page-feed.component.html',
  styleUrls: ['./page-feed.component.css']
})
export class PageFeedComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    const requestObj = {
      type: 'GET',
      location: 'users/generate-feed',
      authorize: true
    }
    this.apiService.makeRequest(requestObj).then((val: any) => {
      console.log(val)
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}
