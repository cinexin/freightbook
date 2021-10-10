import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../local-storage.service";
import {EventEmitterService} from "../event-emitter.service";
import {UserDataService} from "../user-data.service";
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
    private centralUserData: UserDataService,
    private api: ApiService
  ) { }


  public query: string = '';
  public usersName: string = '';
  public usersId = '';
  public alertMessage: string = '';
  public profilePicture: string = 'default-avatar';

  public userData: any = {};
  public numOfFriendRequests: number = 0;

  private subscriptions: any[] = [];

  ngOnInit(): void {
    this.usersName = this.localStorageService.getParsedToken().name;
    this.usersId = this.localStorageService.getParsedToken()._id;

    const alertEvent  = this.eventEmitterService.onAlertEvent.subscribe((msg: string) => {
      this.alertMessage = msg;
    });

    const friendRequestEvent = this.eventEmitterService.updateNumOfFriendRequestsEvent.subscribe(() => {
      this.numOfFriendRequests--;
    });

    const userDataEvent = this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;
      this.numOfFriendRequests = data.friend_requests.length;
      this.profilePicture = data.profile_image;
    });
    const requestObj = {
      location: `users/get-user-data/${this.usersId}`,
      method: 'GET',
    };
    this.api.makeRequest(requestObj).then((val: any) => {
      console.log(val);
      this.centralUserData.getUserData.emit(val.user);
    });

    this.subscriptions.push(alertEvent, friendRequestEvent, userDataEvent)
  }

  public searchFriends() {
    console.log('Searching friends...');
    this.router.navigate(['/search-results', {query: this.query}]);
  }

  public logout(): void {
    this.authService.logout();
  }
}
