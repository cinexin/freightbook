import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() post: any;
  fakeId: string = 'fakeid';

  constructor() { }

  ngOnInit(): void {
    const removeLeadingNumbers = (s: string) => {
      const isNumber = (n: any) => {
        n = Number(n);
        return isNaN(n) ? false : true;
      }
      if (s && isNumber(s[0])) {
        s = removeLeadingNumbers(s.substr(1))
      }
      return s;
    }

    this.fakeId = removeLeadingNumbers(this.post._id);
  }

}
