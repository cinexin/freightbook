import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-result-request',
  templateUrl: './result-request.component.html',
  styleUrls: ['./result-request.component.css']
})
export class ResultRequestComponent implements OnInit {

  @Input() resultRequest: any;
  constructor() { }

  ngOnInit(): void {
  }

}
