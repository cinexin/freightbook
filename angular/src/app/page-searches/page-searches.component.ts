import {Component, Inject, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {ActivatedRoute} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {DOCUMENT} from "@angular/common";
import {UserDataService} from "../user-data.service";

@Component({
  selector: 'app-page-searches',
  templateUrl: './page-searches.component.html',
  styleUrls: ['./page-searches.component.css']
})
export class PageSearchesComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private title: Title,
    private centralUserData: UserDataService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const sidebar = this.document.getElementById('sidebarToggleTop');
    if (sidebar) {
      sidebar.classList.add('d-none');
    }
    this.title.setTitle('Search results');
    this.centralUserData.getUserData.subscribe((data) => {
      this.subscription = this.route.params.subscribe(params => {
        this.query = params.query;
        this.user = data;
        this.getResults();
      });
    });
  }

  public results: any;
  public query = this.route.snapshot.params.query;
  public subscription: any;
  private user: any;

  private getResults() {
    const requestObj = {
      location: `users/get-search-results?query=${this.query}`,
      type: 'GET',
      authorize: true
    }
    this.apiService.makeRequest(requestObj).then((val: any) => {
      this.results = val.results;
      for (let result of this.results) {
        if (result.friends.includes(this.user._id)) {
          result.isFriend = true;
        }
        if (result.friend_requests.includes(this.user._id)) {
          result.haveSentFriendRequest = true;
        }
        if (this.user.friend_requests.includes(result._id)) {
          result.haveReceivedFriendRequest = true;
        }
      }
    })
  }
}
