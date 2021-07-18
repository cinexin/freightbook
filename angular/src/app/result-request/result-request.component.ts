import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
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
  @Output() resultRequestChange = new EventEmitter();

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
    this.updateRequests();
    this.api.resolveFriendRequest('accept', this.resultRequest._id).then((val: any) => {
      console.log(val);
    });
  }

  declineFriendRequest() {
    this.updateRequests();
    console.log('Decline friend request from user,', this.resultRequest._id);
    this.api.resolveFriendRequest('decline', this.resultRequest._id).then((val: any) => {
      console.log(val);
    });
  }

  private updateRequests() {
    this.resultRequestChange.emit(this.resultRequest._id);
  }

  sendMessage() {
    console.log('Send message to user,', this.resultRequest._id);
  }
}
