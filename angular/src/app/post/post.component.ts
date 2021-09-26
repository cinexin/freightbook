import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() post: any;
  fakeId: string = 'fakeid';
  public fontSize: number = 18;
  public align: string = 'left';

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

    if (this.post && this.post.content) {
      if (this.post.content.length < 40) { this.fontSize = 22; }
      if (this.post.content.length < 24) { this.fontSize = 28; }
      if (this.post.content.length < 14) { this.fontSize = 32; }
      if (this.post.content.length < 8) { this.fontSize = 44; }
      if (this.post.content.length < 5) { this.fontSize = 63; }
    }
  }

}
