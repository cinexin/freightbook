import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {LocalStorageService} from "../local-storage.service";

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
  public liked: boolean = false;
  public userId: string = '';
  public comment: string = '';

  constructor(
    private apiService: ApiService,
    private storageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    console.log(`Likes: ${this.post.likes}`);
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

      this.userId = this.storageService.getParsedToken()._id;
      if (this.post.likes.includes(this.userId)) {
        this.liked = true;
      }
    }
  }

  likeButtonClicked(postId: string): void {
    const requestObj = {
      location: `users/like-unlike/${this.post.ownerId}/${this.post._id}`,
      method: 'POST',
    };
    this.apiService.makeRequest(requestObj).then((val: any) => {
      if (this.post.likes.includes(this.userId)) {
        this.post.likes.splice(this.post.likes.indexOf(this.userId), 1)
        this.liked = false;
      } else {
        this.post.likes.push(this.userId);
        this.liked = true;
      }
    });
  }

  postComment() {
    if (this.comment.length == 0) { return; }
    console.log("POST COMMENT", this.comment);
    const requestObj = {
      location: `users/post-comment/${this.post.ownerId}/${this.post._id}`,
      method: 'POST',
      body: { content: this.comment }
    }
    this.apiService.makeRequest(requestObj).then((val: any) => {
      console.log(val);
      if (val.statusCode == 201) {
        const newComment = {
          ...val.comment,
          commenter_name: val.commenter.name,
          commenter_image: val.commenter.profile_image
        }
        this.post.comments.push(newComment);
        this.comment = '';
      }
    });
  }

}
