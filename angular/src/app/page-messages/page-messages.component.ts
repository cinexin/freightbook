import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {ApiService} from "../api.service";
import {UserDataService} from "../user-data.service";
import {AutoUnsubscribe} from "../unsubscribe";

@Component({
  selector: 'app-page-messages',
  templateUrl: './page-messages.component.html',
  styleUrls: ['./page-messages.component.css']
})
@AutoUnsubscribe
export class PageMessagesComponent implements OnInit {

  constructor(
    private title: Title,
    private apiService: ApiService,
    private centralUserData: UserDataService
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Your messages');
    this.apiService.resetMessageNotifications();

    if (history.state.data && history.state.data.msgId) {
      this.activeMessage.fromId = history.state.data.msgId;
    }
    const userDataEvent = this.centralUserData.getUserData.subscribe((user) => {
      this.activeMessage.fromId = this.activeMessage.fromId || user.messages[0].from_id;
      this.messages = user.messages;
      this.usersName = user.name;
      this.usersId = user._id;
      this.usersProfileImage = user.profile_image;
      this.setActiveMessage(this.activeMessage.fromId);
    });
    this.subscriptions.push(userDataEvent);
  }

  public activeMessage = {
    fromId: '',
    fromName: '',
    fromProfilePicture: '',
    messages: []
  }

  public messages: any[] = [];
  public usersProfileImage = 'default-avatar';
  public usersName = '';
  public usersId = '';
  private subscriptions: any[] = [];

  setActiveMessage(fromId: string) {
    for (let message of this.messages) {
      if (message.from_id == fromId) {
        this.activeMessage.fromId = message.from_id;
        this.activeMessage.fromName = message.messengerName;
        this.activeMessage.fromProfilePicture = message.messengerProfileImage;
        this.activeMessage.messages = message.content;
      }
    }
    console.log('ACTIVE MESSAGE: ', this.activeMessage);
  }

}
