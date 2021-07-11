import { Component, OnInit } from '@angular/core';
import {UserDataService} from "../user-data.service";
import {ApiService} from "../api.service";

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
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;
      const friend_requests = JSON.stringify(this.userData.friend_requests);
      console.log(this.userData);
      const requestObj = {
        location: `users/get-friend-requests?friend_requests=${friend_requests}`,
        type: 'GET',
        authorize: true
      }
      this.api.makeRequest(requestObj).then((val: any) => {
        if (val.statusCode === 200) {
          this.friendRequests = val.users;
          console.log(this.friendRequests);
        }
      });
    });
  }

}
