import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../local-storage.service";
import {AlertsService} from "../alerts.service";

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private alertsService: AlertsService
  ) { }

  ngOnInit(): void {
    this.usersName = this.localStorageService.getParsedToken().name;
    this.alertsService.onAlertEvent.subscribe((msg: string) => {
      this.alertMessage = msg;
    });
  }

  public query: string = '';
  public usersName: string = "Jesse Caine";
  public alertMessage: string = '';

  public searchFriends() {
    console.log('Searching friends...');
    this.router.navigate(['/search-results', {query: this.query}]);
  }

  public logout(): void {
    this.authService.logout();
  }
}
