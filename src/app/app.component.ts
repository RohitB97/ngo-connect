import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: User = {
    _id: "",
    name: "",
    designation: "",
    team: "",
    email: "",
    password: "",
    contact: ""
  };
  
  new_user: User = {
    _id: "",
    name: "",
    designation: "",
    team: "",
    email: "",
    password: "",
    contact: ""
  };
  
  guest: boolean;

  constructor(private http: HttpClient) {}

  ngOnInit(){
  	if(localStorage.getItem('auth_token') && localStorage.getItem('user')){
        this.guest = false;
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    else if(localStorage.getItem('auth_token') && !localStorage.getItem('user')){
    	this.fetchUser(localStorage.getItem('auth_token'));
    }

    else{
        this.guest = true;
    }
  }

  signIn(form: NgForm): void{
    this.http.post("/api/user/login", this.user).subscribe((obj:any) => {
    	if(obj.status){
        form.reset();
    		localStorage.setItem('auth_token', obj.auth_token);
    		location.reload();
    	}

    	else{
    		alert(obj.message);
    	}
    });
  }

  fetchUser(token: String): void{
  	this.http.get("/api/user/" + token).subscribe((obj:any) => {
  		if(obj.status){
  			localStorage.removeItem('auth_token');
  			localStorage.removeItem('user');
  			location.reload();
  		}

  		else{
  			localStorage.setItem('user', JSON.stringify(obj));
        this.user = obj;
  			this.guest = false;
  		}
  	})
  }

  signUp(form: NgForm): void{
  	this.http.post("/api/user/signup", this.new_user).subscribe((obj:any) => {
    	if(obj.status){
        form.reset();
    		alert("User successfully registered");
    	}
    });
  }

  logout(): void{
  	localStorage.removeItem('auth_token');
  	localStorage.removeItem('user');
  	location.reload();
  }

}
