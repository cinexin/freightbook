import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  tokenName = '--token-ASM';
  postThemeName = '--post-theme-ASM-PROD';

  private browserHasLocalStorageSupport(): boolean {
    if (!localStorage) {
      alert('Browser does not support localstorage API')
      return false
    }
    return true
  }

  private set(key: string, value: string) {
    if (this.browserHasLocalStorageSupport()) {
      localStorage.setItem(key, value)
    }
  }

  private get(key: string): string | null {
    if (this.browserHasLocalStorageSupport()) {
      if (key in localStorage) {
        return localStorage.getItem(key);
      }
    }
    return null;
  }

  public setToken(token: string) {
    this.set(this.tokenName, token)
  }

  public getToken(): string | null {
    return this.get(this.tokenName)
  }

  public getParsedToken() {
    const token = this.getToken();
    return token ? JSON.parse(atob(token.split('.')[1])) : '';
  }

  public removeToken() {
    if (this.browserHasLocalStorageSupport()) {
      localStorage.removeItem(this.tokenName);
    }
  }

  public setPostTheme(theme: string) {
    this.set(this.postThemeName, theme)
  }

  public getPostTheme(): string {
    return this.get(this.postThemeName) || 'primary' ;
  }
}
