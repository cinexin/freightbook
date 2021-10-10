import {Component, Inject, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {UserDataService} from "../user-data.service";
import {ApiService} from "../api.service";
import {ActivatedRoute} from "@angular/router";
import {EventEmitterService} from "../event-emitter.service";
import {AutoUnsubscribe} from "../unsubscribe";

@Component({
  selector: 'app-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.css']
})
@AutoUnsubscribe
export class PageProfileComponent implements OnInit {

  constructor(
    private title: Title,
    private userDataService: UserDataService,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private eventEmitterService: EventEmitterService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Your profile');
    const sidebar = this.document.getElementById('sidebarToggleTop');
    if (sidebar) {
      sidebar.classList.add('d-none');
    }

     const userDataSubscription = this.userDataService.getUserData.subscribe((user: any) => {
       const paramsSubscription = this.activatedRoute.params.subscribe((params) => {
         this.postsToShow = 6;
         if (user._id == params.userId) {
           console.log('Your profile');
           this.setComponentValues(user);
           this.resetBooleans();
         } else {
           console.log('Not your profile');
           this.canSendMessage = true;
           const requestObj = {
             location: `users/get-user-data/${params.userId}`,
             method: 'GET'
           }
           this.apiService.makeRequest(requestObj).then((data: any) => {
             if (data.statusCode == 200) {
               this.canAddUser = user.friends.includes(data.user._id) ? false : true;
               this.haveReceivedFriendRequest = user.friend_requests.includes(data.user._id);
               this.haveSentFriendRequest = data.user.friend_requests.includes(user._id) ? true : false;
               if (this.canAddUser) {
                 this.postsToShow = 0;
               }
               this.setComponentValues(data.user);
             }
           });
         }
       })
      this.subscriptions.push(paramsSubscription);
      this.subscriptions.push(userDataSubscription);
     });
  }

  public randomFriends: any[] = [];
  public totalFriends: number = 0;
  public posts: object[] = [];
  public profilePicture: string = 'default-avatar';
  public userName: string = '';
  public userEmail: string = '';
  public userId: string = '';

  public canAddUser: boolean = false;
  public canSendMessage: boolean = false;
  public haveSentFriendRequest: boolean = false;
  public haveReceivedFriendRequest: boolean = false;
  public postsToShow: number = 6;

  private subscriptions: any[] = [];

  showMorePosts(): void {
    this.postsToShow += 6;
  }

  backToTop(): void {
    this.document.body.scrollTop = this.document.documentElement.scrollTop = 0;
  }

  setComponentValues(user: any): void {
    this.randomFriends = user.random_friends;
    this.profilePicture = user.profile_image;
    this.posts = user.posts;
    this.userName = user.name;
    this.userEmail = user.email;
    this.totalFriends = user.friends.length;
    this.userId = user._id;
  }

  acceptFriendRequest(): void {
    this.apiService.resolveFriendRequest('accept', this.userId).then((val: any) => {
      if (val.statusCode == 200) {
        this.haveReceivedFriendRequest = false;
        this.canAddUser = false;
        this.totalFriends++;
        this.postsToShow = 6;
      }
    });
  }

  declineFriendRequest(): void {
    this.apiService.resolveFriendRequest('decline', this.userId).then((val: any) => {
      if (val.statusCode == 200) {
        this.haveReceivedFriendRequest = false;
      }
    });
  }

  makeFriendRequest(): void {
    this.apiService.makeFriendRequest(this.userId).then((val: any) => {
      if (val.statusCode == 201) {
        this.haveSentFriendRequest = true;
      }
    });
  }

  private resetBooleans(): void {
    this.canAddUser = false;
    this.canSendMessage = false;
    this.haveSentFriendRequest = false;
    this.haveReceivedFriendRequest = false;
  }
}
