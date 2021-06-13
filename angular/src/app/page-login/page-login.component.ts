import { Component, OnInit } from '@angular/core';
import { ApiService } from "../api.service";
import { LocalStorageService } from "../local-storage.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.css']
})
export class PageLoginComponent implements OnInit {

  constructor(
    private api: ApiService,
    private storageService: LocalStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  public formError = '';

  public credentials = {
    email: '',
    password: ''
  };

  private login() {
    let requestObject = {
      type: "POST",
      location: 'users/login',
      body: this.credentials
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.token) {
        this.storageService.setToken(val.token);
        this.router.navigate(['/']);
        return;
      }
      if (val.error.message) {
        this.formError = val.error.message;
      }
    });
  }

  public formSubmit(): any {
    this.formError = '';
    if (!this.credentials.email || !this.credentials.password) {
      return this.formError = 'All fields are required'
    }

    this.login();
  }
}
