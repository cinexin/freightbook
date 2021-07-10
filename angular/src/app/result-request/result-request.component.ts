import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from "../api.service";

@Component({
  selector: 'app-result-request',
  templateUrl: './result-request.component.html',
  styleUrls: ['./result-request.component.css']
})
export class ResultRequestComponent implements OnInit {

  @Input() resultRequest: any;
  constructor(
    private api: ApiService
  ) { }

  ngOnInit(): void {
  }

  makeFriendRequest(to: string): void {
    this.api.makeFriendRequest(to);
  }
}
