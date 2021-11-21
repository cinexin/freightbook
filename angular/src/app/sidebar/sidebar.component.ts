import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {AutoUnsubscribe} from "../unsubscribe";
import {EventEmitterService} from "../event-emitter.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
@AutoUnsubscribe
export class SidebarComponent implements OnInit {

  private subscriptions: any[] = [];
  userData: any;
  public besties: any[] = [];
  public enemies: any[] = [];

  constructor(
    private authService: AuthService,
    private eventService: EventEmitterService
  ) { }

  ngOnInit(): void {
    const userDataSubscription = this.eventService.getUserData.subscribe((user) => {
      this.userData = user;
      this.besties = user.besties;
      this.enemies = user.enemies;
    }, (error) => {
      console.log('Error on user data subscription: ' + error);
    });
    this.subscriptions.push(userDataSubscription);
  }


  public logout(): void {
    this.authService.logout();
  }
}
