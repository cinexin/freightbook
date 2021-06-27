import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-page-searches',
  templateUrl: './page-searches.component.html',
  styleUrls: ['./page-searches.component.css']
})
export class PageSearchesComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      this.query = params.query;
      this.getResults();
    });
  }

  public results: any;
  public query = this.route.snapshot.params.query;
  public subscription: any;

  private getResults() {
    const requestObj = {
      location: `users/get-search-results?query=${this.query}`,
      type: 'GET',
      authorize: true
    }
    this.apiService.makeRequest(requestObj).then((val: any) => {
      this.results = val.results;
    })
  }
}
