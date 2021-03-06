import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../local-storage.service";
import {EventEmitterService} from "../event-emitter.service";
import {ApiService} from "../api.service";
import {AutoUnsubscribe} from "../unsubscribe";

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
@AutoUnsubscribe
export class TopbarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private eventEmitterService: EventEmitterService,
    private api: ApiService
  ) { }


  private subscriptions: any[] = [];
  public query: string = '';
  public sendMessageObject: any = {
    id: '',
    name: '',
    content: ''
  }
  public alertMessage: string = '';

  // User Data
  public usersName: string = '';
  public usersId = '';
  public profilePicture: string = 'default-avatar';
  public messagePreviews: any[] = [];
  public alerts: any[] = [];
  public notifications = {
    alerts: 0,
    friendRequests: 0,
    messages: 0,
  }

  ngOnInit(): void {
    this.usersName = this.localStorageService.getParsedToken().name;
    this.usersId = this.localStorageService.getParsedToken()._id;

    const alertEvent  = this.eventEmitterService.onAlertEvent.subscribe((msg: string) => {
      this.alertMessage = msg;
    });

    const friendRequestEvent = this.eventEmitterService.updateNumOfFriendRequestsEvent.subscribe(() => {
      this.notifications.friendRequests--;
    });

    const userDataEvent = this.eventEmitterService.getUserData.subscribe((user) => {
      this.notifications.friendRequests = user.friend_requests.length;
      this.notifications.messages = user.new_message_notifications.length;
      this.notifications.alerts = user.new_notifications;
      this.profilePicture = user.profile_image;
      this.setAlerts(user.notifications);
      this.setMessagePreviews(user.messages, user.new_message_notifications);
      console.log(this.messagePreviews);
    });
    const requestObj = {
      location: `users/get-user-data/${this.usersId}`,
      method: 'GET',
    };
    const updateMessageEvent = this.eventEmitterService.updateSendMessageObjectEvent.subscribe((data: any) => {
      this.sendMessageObject.id = data.id;
      this.sendMessageObject.name = data.name;
    });
    const resetMessagesEvent = this.eventEmitterService.resetMessageNotificationsEvent.subscribe(() => {
      this.notifications.messages = 0;
    });
    this.subscriptions.push(alertEvent, friendRequestEvent, userDataEvent, updateMessageEvent, resetMessagesEvent)

    this.api.makeRequest(requestObj).then((val: any) => {
      if (val.statusCode !== 200) {
        return this.authService.logout();
      }

      this.eventEmitterService.getUserData.emit(val.user);
    });
  }

  public searchFriends() {
    console.log('Searching friends...');
    this.router.navigate(['/search-results', {query: this.query}]);
  }

  sendMessage(): void {
    this.api.sendMessage(this.sendMessageObject);
    this.sendMessageObject.content = '';
  }

  resetMessageNotifications() {
    if (this.notifications.messages === 0) {
      return;
    }

    this.api.resetMessageNotifications();
  }

  resetAlertNotifications() {
    if (this.notifications.alerts === 0) {
      return;
    }

    const requestObj = {
      location: 'users/reset-alert-notifications',
      method: 'POST',
    }
    this.api.makeRequest(requestObj).then((val: any) => {
      if (val.statusCode === 200) {
        this.notifications.alerts = 0;
      }
    });
  }

  private setMessagePreviews(messages: any[], messageNotifications: any[]): void {
    for (let i = messages.length - 1; i >= 0; i--) {
      const lastMessage = messages[i].content[messages[i].content.length - 1];
      const preview = {
        messengerName: messages[i].messengerName,
        messageContent: lastMessage.message,
        messengerImage: '',
        messengerId: messages[i].from_id,
        isNew: false
      }

      if (lastMessage.messenger == this.usersId) {
        preview.messengerImage = this.profilePicture;
      } else {
        preview.messengerImage = messages[i].messengerProfileImage;
        if (messageNotifications.includes(messages[i].from_id)) {
          preview.isNew = true;
        }
      }

      if (preview.isNew) {
        this.messagePreviews.unshift(preview);
      } else {
        this.messagePreviews.push(preview);
      }
    }
  }

  messageLink(messageId: any) {
    this.router.navigate(['/messages'], {state: {data: {msgId: messageId}}});
  }

  private setAlerts(notificationData: any) {
    notificationData.forEach((alert: string) => {
      const alertObj = JSON.parse(alert);
      const newAlert = {
        text: alertObj.alert_text,
        icon: '',
        bgColor: '',
        href: ''
      };

      switch (alertObj.alert_type) {
        case 'new_friend':
          newAlert.icon = 'fa-user-check';
          newAlert.bgColor = 'bg-success';
          newAlert.href = `/profile/${alertObj.from_id}`;
          break;
        case 'liked_post':
          newAlert.icon = 'fa-thumbs-up';
          newAlert.bgColor = 'bg-purple';
          newAlert.href = `/profile/${this.usersId}`;
          break;
        case 'commented_post':
          newAlert.icon = 'fa-comment';
          newAlert.bgColor = 'bg-primary';
          newAlert.href = `/profile/${this.usersId}`;
          break;
      }

      this.alerts.push(newAlert);
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}
