import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {LocalStorageService} from "../local-storage.service";

@Component({
  selector: 'app-result-request',
  templateUrl: './result-request.component.html',
  styleUrls: ['./result-request.component.css']
})
export class ResultRequestComponent implements OnInit {

  @Input() resultRequest: any;
  @Input() useFor: any;

  constructor(
    private api: ApiService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit(): void {

  }

  makeFriendRequest(to: string): void {
    this.api.makeFriendRequest(to);
  }

  acceptFriendRequest() {
    console.log('Accept friend request from user,', this.resultRequest._id);
    this.api.resolveFriendRequest('accept', this.resultRequest._id).then((val: any) => {
      console.log(val);
    });
  }

  declineFriendRequest() {
    console.log('Decline friend request from user,', this.resultRequest._id);
    this.api.resolveFriendRequest('decline', this.resultRequest._id).then((val: any) => {
      console.log(val);
    });
  }

  sendMessage() {
    console.log('Send message to user,', this.resultRequest._id);
  }
}
