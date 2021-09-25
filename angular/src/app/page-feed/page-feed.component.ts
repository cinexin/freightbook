import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {Title} from "@angular/platform-browser";
import {LocalStorageService} from "../local-storage.service";
import {EventEmitterService} from "../event-emitter.service";

@Component({
  selector: 'app-page-feed',
  templateUrl: './page-feed.component.html',
  styleUrls: ['./page-feed.component.css']
})
export class PageFeedComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private title: Title,
    private localStorageService: LocalStorageService,
    private events: EventEmitterService
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

  newPostContent: String = '';
  newPostTheme: string = this.localStorageService.getPostTheme() || 'primary';

  public changeTheme(newTheme: string): void {
    this.newPostTheme = newTheme;
    this.localStorageService.setPostTheme(newTheme);
  }

  public createPost() {
    if (this.newPostContent.length == 0) {
      return this.events.onAlertEvent.emit('No content for your post was provided');
    }

    const requestObject = {
      location: 'users/create-post',
      type: 'POST',
      authorize: true,
      body: {
        theme: this.newPostTheme,
        content: this.newPostContent
      }
    }
    this.apiService.makeRequest(requestObject).then((val: any) => {
      console.log(val);
      this.newPostContent = '';
    });
  }
}
