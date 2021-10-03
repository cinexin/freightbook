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
      if (val.statusCode == 200) {
        console.log(val.posts[0]);
        this.posts.col1 = val.posts.filter((val: any, i: number) => i % 4 === 0);
        this.posts.col2 = val.posts.filter((val: any, i: number) => i % 4 === 1);
        this.posts.col3 = val.posts.filter((val: any, i: number) => i % 4 === 2);
        this.posts.col4 = val.posts.filter((val: any, i: number) => i % 4 === 3);
      } else {
        this.events.onAlertEvent.emit('Something went wrong, feed couldn\'t be retrieved');
      }
    });
  }

  posts = {
    col1: [''],
    col2: [''],
    col3: [''],
    col4: ['']
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
      if (val.statusCode === 201) {
        val.newPost.ago = "now";
        this.posts.col1.unshift(val.newPost);
      } else {
        this.events.onAlertEvent.emit('Post couldn\'t be created');
      }
      this.newPostContent = '';
    });
  }
}
