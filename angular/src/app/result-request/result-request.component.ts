import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService} from "../api.service";
import {EventEmitterService} from "../event-emitter.service";

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
    private eventEmitterService: EventEmitterService
  ) {}

  ngOnInit(): void {
    if (this.resultRequest.haveSentFriendRequest) {
      this.haveSentFriendRequest = true;
    }
    if (this.resultRequest.haveReceivedFriendRequest) {
      this.haveReceivedFriendRequest = true;
    }
    if (this.resultRequest.isFriend) {
      this.isFriend = true;
    }
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

  public haveSentFriendRequest: boolean = false;
  public haveReceivedFriendRequest: boolean = false;
  public isFriend: boolean = false;

  sendMessage() {
    console.log('Send message to user,', this.resultRequest._id);
  }

  updateSendMessageObject(id: string, name: string): void {
    this.eventEmitterService.updateSendMessageObjectEvent.emit({ id, name})
  }
}
