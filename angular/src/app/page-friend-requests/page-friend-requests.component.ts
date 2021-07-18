import { Component, OnInit } from '@angular/core';
import {UserDataService} from "../user-data.service";
import {ApiService} from "../api.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-page-friend-requests',
  templateUrl: './page-friend-requests.component.html',
  styleUrls: ['./page-friend-requests.component.css']
})
export class PageFriendRequestsComponent implements OnInit {
  userData: any = {};
  friendRequests = [];

  constructor(
    private centralUserData: UserDataService,
    private api: ApiService,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Freightbook - Friend Requests');
    this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;
      const friend_requests = JSON.stringify(this.userData.friend_requests);
      const requestObj = {
        location: `users/get-friend-requests?friend_requests=${friend_requests}`,
        type: 'GET',
        authorize: true
      }
      this.api.makeRequest(requestObj).then((val: any) => {
        if (val.statusCode === 200) {
          this.friendRequests = val.users;
        }
      });
    });
  }

  updateFriendRequests(id: string) {
    this.friendRequests = this.friendRequests.filter((item: any) => item._id !== id);
  }
}
