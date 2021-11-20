import {Component, Inject, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {Title} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {AutoUnsubscribe} from "../unsubscribe";
import {EventEmitterService} from "../event-emitter.service";

@Component({
  selector: 'app-page-friend-requests',
  templateUrl: './page-friend-requests.component.html',
  styleUrls: ['./page-friend-requests.component.css']
})
@AutoUnsubscribe
export class PageFriendRequestsComponent implements OnInit {
  userData: any = {};
  friendRequests = [];
  private subscriptions: any[] = [];

  constructor(
    private eventService: EventEmitterService,
    private api: ApiService,
    private title: Title,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const sidebar = this.document.getElementById('sidebarToggleTop');
    if (sidebar) {
      sidebar.classList.add('d-none');
    }
    this.title.setTitle('Freightbook - Friend Requests');
    const userDataSubscription = this.eventService.getUserData.subscribe((data) => {
      this.userData = data;
      const friend_requests = JSON.stringify(this.userData.friend_requests);
      const requestObj = {
        location: `users/get-friend-requests?friend_requests=${friend_requests}`,
        method: 'GET'
      }
      this.api.makeRequest(requestObj).then((val: any) => {
        if (val.statusCode === 200) {
          this.friendRequests = val.users;
        }
      });
    });
    this.subscriptions.push(userDataSubscription);
  }

  updateFriendRequests(id: string) {
    this.friendRequests = this.friendRequests.filter((item: any) => item._id !== id);
  }
}
