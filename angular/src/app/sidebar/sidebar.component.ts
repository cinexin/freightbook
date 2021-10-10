import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {UserDataService} from "../user-data.service";
import {AutoUnsubscribe} from "../unsubscribe";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
@AutoUnsubscribe
export class SidebarComponent implements OnInit {

  private subscriptions: any[] = [];

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) { }

  ngOnInit(): void {
    const userDataSubscription = this.userDataService.getUserData.subscribe((user) => {
      this.userData = user;
      console.log(user);
    });
    this.subscriptions.push(userDataSubscription);
  }

  public userData: any;

  public logout(): void {
    this.authService.logout();
  }
}
