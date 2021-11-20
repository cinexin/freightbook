import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {ApiService} from "../api.service";
import {UserDataService} from "../user-data.service";
import {AutoUnsubscribe} from "../unsubscribe";
import {Message} from "@angular/compiler/src/i18n/i18n_ast";

class MessagesGroup {
  constructor(
    public image: string,
    public name: string,
    public id: string,
    public messages: string[],
    public isMe: Boolean
  ) {
  }
}

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
    messagesGroups: [] as MessagesGroup[]
  }

  public messages: any[] = [];
  public usersProfileImage = 'default-avatar';
  public usersName = '';
  public usersId = '';
  public newMessage = '';
  private subscriptions: any[] = [];

  sendMessage(): void {
    if (!this.newMessage) { return; }
    const obj = {
      content: this.newMessage,
        id: this.activeMessage.fromId,
    }
    this.apiService.sendMessage(obj, false).then((val) => {
      if (val.statusCode === 201) {
        const groups = this.activeMessage.messagesGroups;
        if (groups[groups.length - 1].isMe) {
          groups[groups.length - 1].messages.push(this.newMessage);
        } else {
          const newGroup = new MessagesGroup(
            this.usersProfileImage,
            this.usersName,
            this.usersId,
            [this.newMessage],
            true
          );
          groups.push(newGroup);
        }
        for (let message of this.messages) {
          if (message.from_id == this.activeMessage.fromId) {
            const newContent = {
              message: this.newMessage,
              messenger: this.usersId
            };
            message.content.push(newContent);
          }
        }
        this.newMessage = '';
      }
    });
  }

  setActiveMessage(fromId: string) {
    this.activeMessage = {
      fromId: '',
      fromName: '',
      fromProfilePicture: '',
      messagesGroups: [] as MessagesGroup[]
    };
    for (let message of this.messages) {
      if (message.from_id == fromId) {
        this.activeMessage.fromId = message.from_id;
        this.activeMessage.fromName = message.messengerName;
        this.activeMessage.fromProfilePicture = message.messengerProfileImage;
        let currentMessageGroup: MessagesGroup;
        let groups: MessagesGroup[];
        groups = this.activeMessage.messagesGroups;
        for (let content of message.content) {
          const me = (content.messenger == this.usersId);
          if (groups.length) {
            if (content.messenger == groups[groups.length - 1].id) {
              groups[groups.length -  1].messages.push(content.message);
              continue;
            }
          }
          currentMessageGroup = new MessagesGroup(
            me ? this.usersProfileImage : message.messengerProfileImage,
            me ? 'Me' : message.messengerName,
            content.messenger,
            [content.message],
            me
          );
          groups.push(currentMessageGroup);
        }
      }
    }
  }
}
