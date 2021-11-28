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
      method: 'GET',
      location: 'users/generate-feed'
    }
    this.apiService.makeRequest(requestObj).then((val: any) => {
      if (val.statusCode == 200) {
        this.bestiesPosts = val.bestiesPosts;
        let fullCol1 = val.posts.filter((val: any, i: number) => i % 4 === 0);
        let fullCol2 = val.posts.filter((val: any, i: number) => i % 4 === 1);
        let fullCol3 = val.posts.filter((val: any, i: number) => i % 4 === 2);
        let fullCol4 = val.posts.filter((val: any, i: number) => i % 4 === 3);

        let cols = [fullCol1, fullCol2, fullCol3, fullCol4];
        this.addPostToFeed(cols, 0, 0);

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
  bestiesPosts = [];
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
      method: 'POST',
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

  private addPostToFeed(array: any, colNumber: number, delay: number) {
    setTimeout(() => {
      if (array[colNumber].length) {
        const key = 'col' + (colNumber + 1);
        // @ts-ignore
        const colPosts = this.posts[key];
        colPosts.push(array[colNumber].splice(0, 1)[0]);
        colNumber = ++colNumber % 4;
        this.addPostToFeed(array, colNumber, 100);
      }
    }, delay);
  }
}
