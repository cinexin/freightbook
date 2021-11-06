import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {LocalStorageService} from "../local-storage.service";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-page-register',
  templateUrl: './page-register.component.html',
  styleUrls: ['./page-register.component.css']
})
export class PageRegisterComponent implements OnInit {

  constructor(
    private api: ApiService,
    private storageService: LocalStorageService,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Freightbook - Register');
  }

  public formError = '';

  public credentials = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: ''
  }

  public formSubmit(): any {
    this.formError = '';
    if (
      !this.credentials.first_name ||
      !this.credentials.last_name ||
      !this.credentials.email ||
      !this.credentials.password ||
      !this.credentials.password_confirm
    ) {
      return this.formError = 'All fields are required.';
    }
    const emailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!emailRegex.test(this.credentials.email)) {
      return this.formError = 'Please enter a valid email address.';
    }

    if (this.credentials.password !== this.credentials.password_confirm) {
      return this.formError = 'Passwords don\'t match';
    }

    this.register();
  }

  private register() {
    let requestObject = {
      method: 'POST',
      location: 'users/register',
      body: this.credentials
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.token) {
        this.storageService.setToken(val.token);
        this.router.navigate(['/']);
        return;
      }
      if (val.message) {
        this.formError = val.message;
      }
    });
  }
}
