import {Component, OnInit} from '@angular/core';
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
  userData: any;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) { }

  ngOnInit(): void {
    const userDataSubscription = this.userDataService.getUserData.subscribe((user) => {
      this.userData = user;
      console.log(user);
    }, (error) => {
      console.log('Error on user data subscription: ' + error);
    });
    this.subscriptions.push(userDataSubscription);
  }


  public logout(): void {
    this.authService.logout();
  }
}
