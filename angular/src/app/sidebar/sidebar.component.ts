import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {UserDataService} from "../user-data.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) { }

  ngOnInit(): void {
    this.userDataService.getUserData.subscribe((user) => {
      this.userData = user;
      console.log(user);
    });
  }

  public userData: any;

  public logout(): void {
    this.authService.logout();
  }
}
