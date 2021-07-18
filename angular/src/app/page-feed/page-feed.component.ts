import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-page-feed',
  templateUrl: './page-feed.component.html',
  styleUrls: ['./page-feed.component.css']
})
export class PageFeedComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Freightbook - Feed');
    const requestObj = {
      type: 'GET',
      location: 'users/generate-feed',
      authorize: true
    }
    this.apiService.makeRequest(requestObj).then((val: any) => {
      console.log(val)
    });
  }
}
