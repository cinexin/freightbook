import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {query} from "@angular/animations";

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  public query: string = '';

  public searchFriends() {
    console.log('Searching friends...');
    this.router.navigate(['/search-results', {query: this.query}]);
  }

  public logout(): void {
    this.authService.logout();
  }
}
