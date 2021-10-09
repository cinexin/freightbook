import {Component, Inject, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {UserDataService} from "../user-data.service";
import {ApiService} from "../api.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.css']
})
export class PageProfileComponent implements OnInit {

  constructor(
    private title: Title,
    private userDataService: UserDataService,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Your profile');
    const sidebar = this.document.getElementById('sidebarToggleTop');
    if (sidebar) {
      sidebar.classList.add('d-none');
    }
    const paramId = this.activatedRoute.snapshot.params.userId;
     this.userDataService.getUserData.subscribe((user: any) => {
       if (user._id == paramId) {
         console.log('Your profile');
         this.setComponentValues(user);
       } else {
         console.log('Not your profile');
       }
     });
  }

  public randomFriends: any[] = [];
  public totalFriends: number = 0;
  public posts: object[] = [];
  public profilePicture: string = 'default-avatar';
  public usersName: string = '';
  public usersEmail: string = '';

  public canAddUser: boolean = false;
  public canSendMessage: boolean = true;
  public postsToShow: number = 6;

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
    this.usersName = user.name;
    this.usersEmail = user.email;
    this.totalFriends = user.friends.length;
  }
}
